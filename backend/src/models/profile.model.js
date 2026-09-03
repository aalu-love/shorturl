const bcrypt = require("bcryptjs");
const {
  queryRead,
  queryWrite,
  withTransaction,
} = require("../config/database");

const ProfileModel = {
  async findByUserId(userId) {
    const { rows } = await queryRead(
      `SELECT u.id, u.name, u.email,
              COALESCE(settings.two_factor_enabled, false) AS two_factor_enabled
       FROM users u
       LEFT JOIN profile_settings settings ON settings.user_id = u.id
       WHERE u.id = $1 AND u.is_active = true`,
      [userId],
    );
    return rows[0] || null;
  },

  async update(userId, { name, email, two_factor_enabled }) {
    return withTransaction(async (client) => {
      const userFields = [];
      const userValues = [];
      if (name !== undefined) {
        userValues.push(name);
        userFields.push(`name = $${userValues.length}`);
      }
      if (email !== undefined) {
        userValues.push(email);
        userFields.push(`email = $${userValues.length}`);
      }
      if (userFields.length > 0) {
        userValues.push(userId);
        await client.query(
          `UPDATE users SET ${userFields.join(", ")}
           WHERE id = $${userValues.length} AND is_active = true`,
          userValues,
        );
      }
      if (two_factor_enabled !== undefined) {
        await client.query(
          `INSERT INTO profile_settings (user_id, two_factor_enabled)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET
             two_factor_enabled = EXCLUDED.two_factor_enabled,
             updated_at = NOW()`,
          [userId, two_factor_enabled],
        );
      }
      const { rows } = await client.query(
        `SELECT u.id, u.name, u.email,
                COALESCE(settings.two_factor_enabled, false) AS two_factor_enabled
         FROM users u
         LEFT JOIN profile_settings settings ON settings.user_id = u.id
         WHERE u.id = $1 AND u.is_active = true`,
        [userId],
      );
      return rows[0] || null;
    });
  },

  async changePassword(userId, currentPassword, newPassword) {
    const { rows } = await queryRead(
      "SELECT password_hash FROM users WHERE id = $1 AND is_active = true",
      [userId],
    );
    if (
      !rows[0] ||
      !(await bcrypt.compare(currentPassword, rows[0].password_hash))
    ) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await queryWrite(
      "UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = true",
      [passwordHash, userId],
    );
  },
};

module.exports = ProfileModel;
