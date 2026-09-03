-- ─────────────────────────────────────────────────────────────────────────
-- URL Shortener — Database Schema
--
-- Design decisions (from system design session):
--   1. BIGINT primary key — 8 bytes, faster to compare than VARCHAR(25)
--   2. UNIQUE INDEX on short_code — every redirect queries by this column.
--      Without it, every redirect is a full table scan across 182 TB.
--   3. NO updated_at — short URLs are write-once, read-many. Never updated.
--   4. INDEX on expires_at — cleanup job queries this to purge expired URLs.
--   5. click_count on the URL row — fast summary without querying click_events.
--   6. Separate click_events table — full analytics, never loses granularity.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Roles ─────────────────────────────────────────────────────────────────
CREATE TABLE roles (
  id          BIGSERIAL     PRIMARY KEY,
  name        VARCHAR(50)   NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            BIGSERIAL     PRIMARY KEY,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  name          VARCHAR(100),
  api_key       VARCHAR(64)   NOT NULL,
  role_id       BIGINT        REFERENCES roles(id) ON DELETE SET NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_unique   UNIQUE (email),
  CONSTRAINT users_api_key_unique UNIQUE (api_key)
);

-- Index for API key lookup — hits on every authenticated API request
CREATE INDEX idx_users_api_key ON users (api_key);

-- Refresh tokens for long-lived client sessions
CREATE TABLE refresh_tokens (
  id           BIGSERIAL     PRIMARY KEY,
  user_id      BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255)  NOT NULL,
  user_agent   TEXT,
  ip_address   INET,
  revoked      BOOLEAN       NOT NULL DEFAULT false,
  expires_at   TIMESTAMPTZ   NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- ── Short URLs ─────────────────────────────────────────────────────────────
--
-- This is the table that every redirect hits.
-- The short_code UNIQUE INDEX is the single most important index in the system.
-- Without it: SELECT WHERE short_code = '...' scans 182 TB.
-- With it:    lookup is O(log n) — microseconds at any scale.
--
CREATE TABLE short_urls (
  id            BIGSERIAL     PRIMARY KEY,           -- Base62 encoded to become short_code
  short_code    VARCHAR(20)   NOT NULL,              -- Base62(id) or custom code
  original_url  TEXT          NOT NULL,              -- The destination URL (up to 2048 chars)
  title         VARCHAR(255),                        -- Optional human-readable title
  user_id       BIGINT        REFERENCES users(id) ON DELETE SET NULL,
  click_count   BIGINT        NOT NULL DEFAULT 0,    -- Denormalised counter — fast summary reads
  is_active     BOOLEAN       NOT NULL DEFAULT true, -- Soft delete — never hard DELETE
  expires_at    TIMESTAMPTZ,                         -- NULL = never expires
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  -- NO updated_at: short URLs are immutable after creation
);

-- THE most critical index — every redirect queries by short_code
CREATE UNIQUE INDEX idx_short_urls_short_code ON short_urls (short_code);

-- Used by the cleanup job to find and deactivate expired URLs
CREATE INDEX idx_short_urls_expires_at ON short_urls (expires_at)
  WHERE expires_at IS NOT NULL;

-- Used by the "list my URLs" endpoint
CREATE INDEX idx_short_urls_user_id ON short_urls (user_id)
  WHERE user_id IS NOT NULL;

-- ── Click Events ───────────────────────────────────────────────────────────
--
-- Append-only analytics table. Never updated, never deleted (within retention).
-- Reads go to READ REPLICA. Writes go to PRIMARY.
-- Partitioned by month in production to manage 10B rows/day at scale.
--
CREATE TABLE click_events (
  id            BIGSERIAL     PRIMARY KEY,
  url_id        BIGINT        NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,
  short_code    VARCHAR(20)   NOT NULL, -- Denormalised — avoids JOIN on hot analytics queries
  ip_address    INET,
  user_agent    TEXT,
  referer       TEXT,
  country       VARCHAR(2),             -- ISO 3166-1 alpha-2 (e.g. 'IN', 'US')
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Analytics queries always filter by short_code + date range
CREATE INDEX idx_click_events_short_code_created
  ON click_events (short_code, created_at DESC);

-- Cleanup/retention queries
CREATE INDEX idx_click_events_created_at
  ON click_events (created_at DESC);
