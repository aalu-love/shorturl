-- Add refresh token storage for issued refresh tokens.
-- This file is safe to run multiple times because it uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           BIGSERIAL     PRIMARY KEY,
  user_id      BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255)  NOT NULL,
  user_agent   TEXT,
  ip_address   INET,
  revoked      BOOLEAN       NOT NULL DEFAULT false,
  expires_at   TIMESTAMPTZ   NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
