const { Pool } = require("pg");
const logger = require("./logger");

// ── Primary Pool (Writes) ──────────────────────────────────────────────────
const primaryPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ── Replica Pool (Reads) ───────────────────────────────────────────────────
// Reads NEVER go to Primary. That is what replicas are for.
const replicaPool = new Pool({
  host: process.env.DB_REPLICA_HOST || process.env.DB_HOST,
  port: parseInt(process.env.DB_REPLICA_PORT || process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 30, // replicas handle more connections — all reads land here
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

primaryPool.on("error", (err) => {
  logger.error("Primary DB pool error", { error: err.message });
});

replicaPool.on("error", (err) => {
  logger.error("Replica DB pool error — falling back to primary", {
    error: err.message,
  });
});

// ── Query helpers ──────────────────────────────────────────────────────────

/**
 * Execute a READ query on the replica.
 * Falls back to primary if replica is unavailable.
 */
const queryRead = async (text, params) => {
  try {
    const result = await replicaPool.query(text, params);
    return result;
  } catch (err) {
    logger.warn("Replica query failed, falling back to primary", {
      error: err.message,
    });
    return primaryPool.query(text, params);
  }
};

/**
 * Execute a WRITE query on the primary.
 */
const queryWrite = async (text, params) => {
  return primaryPool.query(text, params);
};

/**
 * Execute a transaction (always on primary — ACID guaranteed).
 */
const withTransaction = async (callback) => {
  const client = await primaryPool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const checkConnections = async () => {
  await primaryPool.query("SELECT 1");
  await replicaPool.query("SELECT 1");
  logger.info("Database connections established (primary + replica)");
};

module.exports = { queryRead, queryWrite, withTransaction, checkConnections };
