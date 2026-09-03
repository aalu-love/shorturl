-- Link management fields used by the links page.
-- This migration is additive and keeps existing short URLs valid.

ALTER TABLE short_urls
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS mobile_url TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fallback_url TEXT,
  ADD COLUMN IF NOT EXISTS og_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS health_status VARCHAR(10) NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS health_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS milestone_threshold BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;

ALTER TABLE short_urls
  DROP CONSTRAINT IF EXISTS short_urls_health_status_check;

ALTER TABLE short_urls
  ADD CONSTRAINT short_urls_health_status_check
  CHECK (health_status IN ('ok', 'warn', 'error', 'unknown'));

CREATE INDEX IF NOT EXISTS idx_short_urls_user_pinned_created
  ON short_urls (user_id, pinned DESC, created_at DESC)
  WHERE is_active = true;