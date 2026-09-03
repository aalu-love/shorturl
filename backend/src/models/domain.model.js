const { queryRead, queryWrite } = require("../config/database");

const domainSelect = `
  SELECT domains.id, domains.domain, domains.status,
         COUNT(urls.id)::int AS links_count,
         domains.added_at, domains.ssl_enabled
  FROM custom_domains domains
  LEFT JOIN short_urls urls
    ON urls.user_id = domains.user_id
  AND urls.domain = domains.domain
   AND urls.is_active = true
  WHERE domains.user_id = $1`;

const DomainModel = {
  async findByUserId(userId) {
    const { rows } = await queryRead(
      `${domainSelect}
       GROUP BY domains.id
       ORDER BY domains.added_at DESC`,
      [userId],
    );
    return rows;
  },

  async create(userId, domain) {
    const { rows } = await queryWrite(
      `INSERT INTO custom_domains (user_id, domain)
       VALUES ($1, $2)
       RETURNING id, domain, status, 0::int AS links_count,
                 added_at, ssl_enabled`,
      [userId, domain],
    );
    return rows[0];
  },

  async findOwnedById(id, userId) {
    const { rows } = await queryRead(
      `${domainSelect} AND domains.id = $2
       GROUP BY domains.id`,
      [userId, id],
    );
    return rows[0] || null;
  },

  async updateVerification(id, userId, status, sslEnabled) {
    const { rows } = await queryWrite(
      `UPDATE custom_domains
         SET status = $1::varchar, ssl_enabled = $2,
           verified_at = CASE WHEN $1::varchar = 'active' THEN NOW() ELSE verified_at END
       WHERE id = $3 AND user_id = $4
       RETURNING id, domain, status, 0::int AS links_count,
                 added_at, ssl_enabled`,
      [status, sslEnabled, id, userId],
    );
    return rows[0] || null;
  },

  async remove(id, userId) {
    const { rows } = await queryWrite(
      `DELETE FROM custom_domains
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId],
    );
    return rows[0] || null;
  },
};

module.exports = DomainModel;
