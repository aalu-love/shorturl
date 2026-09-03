const Redis = require("ioredis");
const logger = require("./logger");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // Exponential backoff — max 30 seconds between retries
    const delay = Math.min(times * 100, 30000);
    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

const redis = new Redis(redisConfig);

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis error", { error: err.message }));
redis.on("close", () => logger.warn("Redis connection closed"));

// ── Cache key namespaces ───────────────────────────────────────────────────
const KEYS = {
  url: (code) => `url:${code}`, // short_code → original_url
  urlMeta: (code) => `url:meta:${code}`, // short_code → full URL record
  lock: (code) => `lock:${code}`, // mutex lock for stampede prevention
  user: (userId) => `user:${userId}`, // user profile cache
  apiKey: (key) => `apikey:${key}`, // API key → user_id cache
};

const TTL = parseInt(process.env.REDIS_TTL_SECONDS, 10) || 86400; // 24 hours
const LOCK_TTL = 5; // 5 seconds — mutex lock timeout

// ── Core cache operations ──────────────────────────────────────────────────

const cacheGet = async (key) => {
  try {
    return await redis.get(key);
  } catch (err) {
    logger.error("Cache GET failed", { key, error: err.message });
    return null; // Cache miss is safe — fall through to DB
  }
};

const cacheSet = async (key, value, ttl = TTL) => {
  try {
    await redis.setex(
      key,
      ttl,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch (err) {
    logger.error("Cache SET failed", { key, error: err.message });
    // Non-fatal — system works without cache, just slower
  }
};

const cacheDel = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error("Cache DEL failed", { key, error: err.message });
  }
};

/**
 * Mutex lock to prevent Cache Stampede.
 *
 * Problem: Cache expires → 10,000 users hit DB simultaneously → DB dies.
 * Fix: First request acquires lock and fetches from DB.
 *      All others wait, then get the freshly cached value.
 *
 * @returns {boolean} true if lock acquired
 */
const acquireLock = async (key) => {
  try {
    // NX = only set if Not eXists — atomic operation
    const result = await redis.set(KEYS.lock(key), "1", "EX", LOCK_TTL, "NX");
    return result === "OK";
  } catch (err) {
    logger.error("Lock acquire failed", { key, error: err.message });
    return true; // On failure, allow the request through rather than deadlock
  }
};

const releaseLock = async (key) => {
  try {
    await redis.del(KEYS.lock(key));
  } catch (err) {
    logger.error("Lock release failed", { key, error: err.message });
  }
};

const checkConnection = async () => {
  await redis.connect();
  await redis.ping();
  logger.info("Redis connection established");
};

module.exports = {
  redis,
  KEYS,
  TTL,
  cacheGet,
  cacheSet,
  cacheDel,
  acquireLock,
  releaseLock,
  checkConnection,
};
