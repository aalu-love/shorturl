-- Create replication user for PostgreSQL streaming replication
-- This is run during database initialization

CREATE USER repuser WITH REPLICATION PASSWORD 'password';
