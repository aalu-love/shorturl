const { queryRead, queryWrite } = require("../config/database");

const NotificationModel = {
  async findByUserId(userId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await queryRead(
      `SELECT id, type, title, description, link_short_url, read, created_at
       FROM notifications
       WHERE user_id = $1 AND dismissed = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows;
  },

  async countUnread(userId) {
    const { rows } = await queryRead(
      `SELECT COUNT(*)::int AS unread FROM notifications
       WHERE user_id = $1 AND dismissed = false AND read = false`,
      [userId],
    );
    return rows[0].unread;
  },

  async markRead(id, userId) {
    const { rows } = await queryWrite(
      `UPDATE notifications SET read = true
       WHERE id = $1 AND user_id = $2 AND dismissed = false RETURNING id`,
      [id, userId],
    );
    return rows[0] || null;
  },

  async markAllRead(userId) {
    const { rowCount } = await queryWrite(
      `UPDATE notifications SET read = true
       WHERE user_id = $1 AND dismissed = false AND read = false`,
      [userId],
    );
    return rowCount;
  },

  async dismiss(id, userId) {
    const { rows } = await queryWrite(
      `UPDATE notifications SET dismissed = true
       WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId],
    );
    return rows[0] || null;
  },

  async getPreferences(userId) {
    const { rows } = await queryRead(
      `SELECT digest_enabled, health_enabled, default_threshold
       FROM notification_preferences WHERE user_id = $1`,
      [userId],
    );
    return (
      rows[0] || {
        digest_enabled: true,
        health_enabled: true,
        default_threshold: 1000,
      }
    );
  },

  async updatePreferences(userId, preferences) {
    const { rows } = await queryWrite(
      `INSERT INTO notification_preferences
         (user_id, digest_enabled, health_enabled, default_threshold)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         digest_enabled = EXCLUDED.digest_enabled,
         health_enabled = EXCLUDED.health_enabled,
         default_threshold = EXCLUDED.default_threshold,
         updated_at = NOW()
       RETURNING digest_enabled, health_enabled, default_threshold`,
      [
        userId,
        preferences.digest_enabled,
        preferences.health_enabled,
        preferences.default_threshold,
      ],
    );
    return rows[0];
  },
};

module.exports = NotificationModel;
