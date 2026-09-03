const { queryRead, queryWrite } = require("../config/database");

const RefreshTokenModel = {
  async create({ userId, tokenHash, expiresAt, userAgent, ipAddress }) {
    const { rows } = await queryWrite(
      `INSERT INTO refresh_tokens
         (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, token_hash, user_agent, ip_address, revoked, expires_at, created_at`,
      [userId, tokenHash, userAgent, ipAddress, expiresAt],
    );
    return rows[0];
  },

  async findByHash(tokenHash) {
    const { rows } = await queryRead(
      `SELECT id, user_id, token_hash, revoked, expires_at, created_at
       FROM refresh_tokens
       WHERE token_hash = $1`,
      [tokenHash],
    );
    return rows[0] || null;
  },

  async revokeById(id) {
    const { rows } = await queryWrite(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE id = $1
       RETURNING id, revoked`,
      [id],
    );
    return rows[0];
  },

  async revokeByHash(tokenHash) {
    const { rows } = await queryWrite(
      `UPDATE refresh_tokens
       SET revoked = true
       WHERE token_hash = $1
       RETURNING id, revoked`,
      [tokenHash],
    );
    return rows[0];
  },
};

module.exports = RefreshTokenModel;
