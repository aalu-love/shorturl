CREATE TABLE IF NOT EXISTS custom_domains (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain      VARCHAR(255) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('active', 'pending', 'error')),
  ssl_enabled BOOLEAN NOT NULL DEFAULT false,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  CONSTRAINT custom_domains_domain_unique UNIQUE (domain)
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id
  ON custom_domains (user_id);

ALTER TABLE short_urls
  ADD COLUMN IF NOT EXISTS domain VARCHAR(255) NOT NULL DEFAULT 'localhost';

CREATE INDEX IF NOT EXISTS idx_short_urls_domain_user_id
  ON short_urls (domain, user_id)
  WHERE is_active = true;
