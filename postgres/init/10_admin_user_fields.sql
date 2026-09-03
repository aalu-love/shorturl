ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'Free'
    CHECK (plan IN ('Free', 'Pro', 'Business')),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'suspended'));

UPDATE users
SET status = CASE WHEN is_active THEN 'active' ELSE 'suspended' END
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
