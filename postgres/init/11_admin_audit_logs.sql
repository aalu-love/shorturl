-- Administrative actions are immutable and retained for accountability.
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  admin_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,
  resource    VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  details     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
  ON admin_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id
  ON admin_audit_logs (admin_id);
