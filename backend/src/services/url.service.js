const UrlModel = require("../models/url.model");
const AnalyticsModel = require("../models/analytics.model");
const {
  cacheGet,
  cacheSet,
  cacheDel,
  acquireLock,
  releaseLock,
  KEYS,
  TTL,
} = require("../config/redis");
const { isValidCode } = require("../utils/base62");
const logger = require("../config/logger");
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function evaluateUrlHealth(originalUrl) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(originalUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    console.log(
      `Health check for ${originalUrl}: ${response.status} ${response.statusText}`,
    );

    const responseTimeMs = Date.now() - startedAt;
    if (response.status === 401 || response.status === 403) return "warn";

    return response.ok || (response.status >= 300 && response.status < 400)
      ? responseTimeMs > 3000
        ? "warn"
        : "ok"
      : "error";
  } catch {
    return "error";
  } finally {
    clearTimeout(timeout);
  }
}

const UrlService = {
  /**
   * THE HOT PATH — runs on every single redirect request.
   *
   * Flow:
   *   1. Check Redis cache (LFU — most-used URLs stay in memory)
   *   2. Cache hit  → return immediately (sub-millisecond)
   *   3. Cache miss → acquire mutex lock (stampede protection)
   *   4. First request fetches from DB, populates cache
   *   5. Subsequent requests wait, then get cache hit
   *   6. Record click event asynchronously (never delays redirect)
   */
  async resolveShortCode(shortCode, meta = {}) {
    // ── Step 1: Cache lookup ───────────────────────────────────────────────
    const cacheKey = KEYS.url(shortCode);
    const cached = await cacheGet(cacheKey);

    if (cached) {
      const url = JSON.parse(cached);
      // Fire-and-forget analytics — redirect is never delayed
      setImmediate(() => UrlService._recordClick(url.id, shortCode, meta));
      return url;
    }

    // ── Step 2: Cache miss — acquire mutex to prevent stampede ─────────────
    const lockKey = shortCode;
    const hasLock = await acquireLock(lockKey);

    if (!hasLock) {
      // Another request is already fetching. Brief wait then retry from cache.
      await new Promise((resolve) => setTimeout(resolve, 200));
      const retried = await cacheGet(cacheKey);
      if (retried) {
        const url = JSON.parse(retried);
        setImmediate(() => UrlService._recordClick(url.id, shortCode, meta));
        return url;
      }
    }

    try {
      // ── Step 3: DB fetch (replica) ───────────────────────────────────────
      const url = await UrlModel.findByCode(shortCode);

      if (!url) return null;

      // ── Step 4: Validate URL is usable ──────────────────────────────────
      if (!url.is_active) return null;
      if (url.expires_at && new Date(url.expires_at) < new Date()) return null;

      // ── Step 5: Lazy cache population ───────────────────────────────────
      // Only cache on first actual visit — avoids polluting cache with
      // 1,200 new URLs/second that nobody ever clicks.
      await cacheSet(cacheKey, JSON.stringify(url), TTL);

      setImmediate(() => UrlService._recordClick(url.id, shortCode, meta));

      return url;
    } finally {
      await releaseLock(lockKey);
    }
  },

  async createShortUrl({
    originalUrl,
    domain,
    customCode,
    userId,
    expiresAt,
    title,
    tags,
    note,
    mobileUrl,
    scheduledFrom,
    scheduledUntil,
    fallbackUrl,
    ogTitle,
    ogDescription,
    ogImage,
    pinned,
    healthStatus,
    milestoneThreshold,
  }) {
    // Validate custom code format if provided
    if (customCode) {
      const taken = await UrlModel.codeExists(customCode);
      if (taken) {
        const err = new Error("Custom code is already taken");
        err.statusCode = 409;
        throw err;
      }
    }

    const url = await UrlModel.create({
      originalUrl,
      domain,
      customCode,
      userId,
      expiresAt,
      title,
      tags,
      note,
      mobileUrl,
      scheduledFrom,
      scheduledUntil,
      fallbackUrl,
      ogTitle,
      ogDescription,
      ogImage,
      pinned,
      healthStatus,
      milestoneThreshold,
    });

    // Pre-warm cache for authenticated users' URLs — they tend to share immediately
    if (userId) {
      await cacheSet(KEYS.url(url.short_code), JSON.stringify(url), TTL);
    }

    return {
      ...url,
      short_url: `${baseUrl}/${url.short_code}`,
    };
  },

  async deleteShortUrl(shortCode, userId) {
    const deleted = await UrlModel.deactivate(shortCode, userId);
    if (!deleted) {
      const err = new Error("URL not found or not owned by you");
      err.statusCode = 404;
      throw err;
    }
    // Evict from cache immediately
    await cacheDel(KEYS.url(shortCode));
    return deleted;
  },

  async getUserUrls(userId, pagination) {
    const [urls, total] = await Promise.all([
      UrlModel.findByUserId(userId, pagination),
      UrlModel.countByUserId(userId),
    ]);

    return {
      urls: urls.map((u) => ({
        ...u,
        short_url: `${baseUrl}/${u.short_code}`,
      })),
      total,
      limit: pagination.limit,
      offset: pagination.offset,
    };
  },

  async updateShortUrl(shortCode, userId, fields) {
    const updated = await UrlModel.update(shortCode, userId, fields);
    if (!updated) return null;
    await cacheDel(KEYS.url(shortCode));
    return { ...updated, short_url: `${baseUrl}/${updated.short_code}` };
  },

  async checkUrlHealth(shortCode, userId) {
    const url = await UrlModel.findByCode(shortCode);
    if (!url || String(url.user_id) !== String(userId) || !url.is_active) {
      return null;
    }

    const healthStatus = await evaluateUrlHealth(url.original_url);

    const updated = await UrlModel.updateHealthStatus(
      shortCode,
      userId,
      healthStatus,
    );
    if (!updated) return null;
    return { ...updated, short_url: `${baseUrl}/${updated.short_code}` };
  },

  async updateMilestoneThresholds(userId, milestones) {
    return UrlModel.updateMilestoneThresholds(userId, milestones);
  },

  async checkUrlsHealth(userId, shortCodes) {
    const targets = await UrlModel.findHealthCheckTargets(userId, shortCodes);
    const results = [];
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < targets.length) {
        const target = targets[nextIndex++];
        results.push({
          shortCode: target.short_code,
          healthStatus: await evaluateUrlHealth(
            // `${baseUrl}/${target.short_code}`,
            target.original_url,
          ),
        });
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(10, targets.length) }, worker),
    );

    const updated = await UrlModel.updateHealthStatuses(userId, results);
    return updated.map((item) => ({
      short_code: item.short_code,
      health_status: item.health_status,
      health_checked_at: item.health_checked_at,
    }));
  },

  // ── Internal helpers ─────────────────────────────────────────────────────

  async _recordClick(urlId, shortCode, meta) {
    try {
      await Promise.all([
        UrlModel.incrementClickCount(urlId),
        AnalyticsModel.recordClick({
          urlId,
          shortCode,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          referer: meta.referer,
          country: meta.country,
        }),
      ]);
    } catch (err) {
      // Analytics failure must NEVER surface to the user
      logger.error("Failed to record click", { urlId, error: err.message });
    }
  },
};

module.exports = UrlService;
