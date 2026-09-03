const {
  queryRead,
  queryWrite,
  withTransaction,
} = require("../config/database");

const UrlModel = {
  /**
   * Create a new short URL.
   * Uses a transaction: INSERT → get ID → UPDATE with Base62 code.
   * This is the cleanest way to generate a Base62 code from the DB-assigned ID.
   */
  async create({
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
    return withTransaction(async (client) => {
      // Step 1: Insert the record to get an auto-increment ID
      const { rows } = await client.query(
        `INSERT INTO short_urls (
           original_url, short_code, user_id, domain, expires_at, title, tags, note,
           mobile_url, scheduled_from, scheduled_until, fallback_url,
           og_title, og_description, og_image, pinned, health_status,
           milestone_threshold
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         RETURNING id`,
        [
          originalUrl,
          customCode || "",
          userId || null,
          domain || process.env.DEFAULT_DOMAIN || "localhost",
          expiresAt || null,
          title || null,
          tags || [],
          note || null,
          mobileUrl || null,
          scheduledFrom || null,
          scheduledUntil || null,
          fallbackUrl || null,
          ogTitle || null,
          ogDescription || null,
          ogImage || null,
          pinned ?? false,
          healthStatus || "unknown",
          milestoneThreshold ?? 0,
        ],
      );

      const id = rows[0].id;

      // Step 2: Generate the short code
      // Custom code takes priority. Otherwise encode the ID into Base62.
      let shortCode = customCode;
      if (!shortCode) {
        const { encode } = require("../utils/base62");
        shortCode = encode(id);
      }

      // Step 3: Store the code back on the record
      const { rows: updated } = await client.query(
        `UPDATE short_urls SET short_code = $1 WHERE id = $2
         RETURNING id, short_code, original_url, user_id, expires_at, title,
           tags, note, mobile_url, scheduled_from, scheduled_until, fallback_url,
           og_title, og_description, og_image, pinned, health_status,
           milestone_threshold, click_count, last_clicked_at, created_at`,
        [shortCode, id],
      );

      return updated[0];
    });
  },

  /**
   * Look up a URL by its short code.
   * This is the HOT PATH — runs on every redirect.
   * Goes to READ REPLICA always.
   */
  async findByCode(shortCode) {
    const { rows } = await queryRead(
      `SELECT id, short_code, original_url, user_id, expires_at, is_active
       FROM short_urls
       WHERE short_code = $1`, // ← uses UNIQUE INDEX — instant lookup
      [shortCode],
    );
    return rows[0] || null;
  },

  async findByUserId(userId, { limit = 20, offset = 0 } = {}) {
    const { rows } = await queryRead(
      `SELECT id, short_code, original_url, title, expires_at, click_count,
              tags, note, mobile_url, scheduled_from, scheduled_until, fallback_url,
              og_title, og_description, og_image, pinned, health_status,
              health_checked_at, milestone_threshold, last_clicked_at, created_at
       FROM short_urls
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows;
  },

  async findIdsByUserId(userId) {
    const { rows } = await queryRead(
      `SELECT id
       FROM short_urls
       WHERE user_id = $1 AND is_active = true`,
      [userId],
    );
    return rows.map((row) => String(row.id));
  },

  async findAnalyticsUrlsByUserId(userId) {
    const { rows } = await queryRead(
      `SELECT id, short_code, original_url, tags
       FROM short_urls
       WHERE user_id = $1 AND is_active = true`,
      [userId],
    );
    return rows;
  },

  async findHealthCheckTargets(userId, shortCodes) {
    const conditions = ["user_id = $1", "is_active = true"];
    const params = [userId];
    if (shortCodes?.length) {
      conditions.push("short_code = ANY($2::text[])");
      params.push(shortCodes);
    }
    const { rows } = await queryRead(
      `SELECT short_code, original_url
       FROM short_urls
       WHERE ${conditions.join(" AND ")}`,
      params,
    );
    return rows;
  },

  async findOwnedCodes(userId, shortCodes) {
    const { rows } = await queryRead(
      `SELECT short_code
       FROM short_urls
       WHERE user_id = $1 AND is_active = true AND short_code = ANY($2::text[])`,
      [userId, shortCodes],
    );
    return rows.map((row) => row.short_code);
  },

  async countByUserId(userId) {
    const { rows } = await queryRead(
      `SELECT COUNT(*) as total FROM short_urls WHERE user_id = $1 AND is_active = true`,
      [userId],
    );
    return parseInt(rows[0].total, 10);
  },

  /**
   * Increment click counter — fire and forget.
   * We UPDATE the counter asynchronously so the redirect is never delayed.
   */
  async incrementClickCount(id) {
    await queryWrite(
      `UPDATE short_urls
       SET click_count = click_count + 1, last_clicked_at = NOW()
       WHERE id = $1`,
      [id],
    );
  },

  async updateHealthStatus(shortCode, userId, healthStatus) {
    const { rows } = await queryWrite(
      `UPDATE short_urls
       SET health_status = $1, health_checked_at = NOW()
       WHERE short_code = $2 AND user_id = $3 AND is_active = true
       RETURNING id, short_code, original_url, user_id, expires_at, title,
         tags, note, mobile_url, scheduled_from, scheduled_until, fallback_url,
         og_title, og_description, og_image, pinned, health_status,
         health_checked_at, milestone_threshold, click_count, last_clicked_at,
         created_at`,
      [healthStatus, shortCode, userId],
    );
    return rows[0] || null;
  },

  async updateMilestoneThresholds(userId, milestones) {
    const shortCodes = milestones.map((item) => item.short_code);
    const thresholds = milestones.map((item) => item.milestone_threshold);
    const { rows } = await queryWrite(
      `UPDATE short_urls AS urls
       SET milestone_threshold = updates.threshold
       FROM UNNEST($1::text[], $2::bigint[]) AS updates(short_code, threshold)
       WHERE urls.short_code = updates.short_code
         AND urls.user_id = $3
         AND urls.is_active = true
       RETURNING urls.id, urls.short_code, urls.milestone_threshold`,
      [shortCodes, thresholds, userId],
    );
    return rows;
  },

  async updateHealthStatuses(userId, statuses) {
    if (statuses.length === 0) return [];
    const shortCodes = statuses.map((item) => item.shortCode);
    const healthStatuses = statuses.map((item) => item.healthStatus);
    const { rows } = await queryWrite(
      `UPDATE short_urls AS urls
       SET health_status = updates.health_status,
           health_checked_at = NOW()
       FROM UNNEST($1::text[], $2::text[]) AS updates(short_code, health_status)
       WHERE urls.short_code = updates.short_code
         AND urls.user_id = $3
         AND urls.is_active = true
       RETURNING urls.short_code, urls.health_status, urls.health_checked_at`,
      [shortCodes, healthStatuses, userId],
    );
    return rows;
  },

  async update(shortCode, userId, fields) {
    const columnMap = {
      original_url: "original_url",
      title: "title",
      tags: "tags",
      note: "note",
      mobile_url: "mobile_url",
      scheduled_from: "scheduled_from",
      scheduled_until: "scheduled_until",
      fallback_url: "fallback_url",
      og_title: "og_title",
      og_description: "og_description",
      og_image: "og_image",
      pinned: "pinned",
      health_status: "health_status",
      milestone_threshold: "milestone_threshold",
    };
    const entries = Object.entries(fields).filter(([key]) => columnMap[key]);
    if (entries.length === 0) return null;

    const values = entries.map(([, value]) => value);
    values.push(shortCode, userId);
    const assignments = entries
      .map(([key], index) => `${columnMap[key]} = $${index + 1}`)
      .join(", ");
    const { rows } = await queryWrite(
      `UPDATE short_urls
       SET ${assignments}
       WHERE short_code = $${values.length - 1}
         AND user_id = $${values.length}
         AND is_active = true
       RETURNING id, short_code, original_url, user_id, expires_at, title,
         tags, note, mobile_url, scheduled_from, scheduled_until, fallback_url,
         og_title, og_description, og_image, pinned, health_status,
         milestone_threshold, click_count, last_clicked_at, created_at`,
      values,
    );
    return rows[0] || null;
  },

  async deactivate(shortCode, userId) {
    const { rows } = await queryWrite(
      `UPDATE short_urls SET is_active = false
       WHERE short_code = $1 AND user_id = $2
       RETURNING id`,
      [shortCode, userId],
    );
    return rows[0] || null;
  },

  async codeExists(code) {
    const { rows } = await queryRead(
      `SELECT 1 FROM short_urls WHERE short_code = $1`,
      [code],
    );
    return rows.length > 0;
  },
};

module.exports = UrlModel;
