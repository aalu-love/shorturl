CREATE TABLE IF NOT EXISTS workspace_settings (
  user_id          BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  workspace_name   VARCHAR(100) NOT NULL DEFAULT 'Acme Corp',
  default_domain   VARCHAR(255) NOT NULL DEFAULT 'sh.rt',
  require_sso      BOOLEAN NOT NULL DEFAULT false,
  public_analytics BOOLEAN NOT NULL DEFAULT true,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
