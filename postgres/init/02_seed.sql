-- Seed data for development only
-- Password is 'password123' (bcrypt hash)

INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full access'),
  ('user', 'Regular user')
ON CONFLICT DO NOTHING;

INSERT INTO users (email, password_hash, name, api_key, role_id) VALUES
  ('dev@example.com',
   '$2a$12$9/.qRgyovavxZNQ.5O9Axev7HBUKSawki7NU8WbSCvGbkqnZ9NFvy',
   'Dev User',
   'sk_dev00000000000000000000000000000',
   (SELECT id FROM roles WHERE name = 'user'))
ON CONFLICT DO NOTHING;
