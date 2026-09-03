const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { queryRead, queryWrite } = require("../config/database");
const { redis } = require("../config/redis");

const userSelect = `
  SELECT u.id, u.name, u.email, u.plan, u.status, u.is_active,
         u.created_at AS joined_at,
         COUNT(urls.id)::int AS links_count
  FROM users u
  LEFT JOIN short_urls urls ON urls.user_id = u.id AND urls.is_active = true`;

const AdminModel = {
  async listDomains() {
    const { rows } = await queryRead(
      `SELECT d.id::text, d.domain, d.status, d.ssl_enabled,
              d.added_at, u.id::text AS owner_id, u.name AS owner_name,
              u.email AS owner_email, COUNT(l.id)::int AS links_count
       FROM custom_domains d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN short_urls l ON l.domain = d.domain AND l.is_active = true
       GROUP BY d.id, u.id
       ORDER BY d.added_at DESC`,
    );
    return rows;
  },

  async verifyDomain(id, adminId) {
    const DomainModel = require("./domain.model");
    const { rows } = await queryRead(
      `SELECT id, user_id, domain FROM custom_domains WHERE id = $1`,
      [id],
    );
    if (!rows[0]) return null;
    const updated = await DomainModel.updateVerification(
      rows[0].id,
      rows[0].user_id,
      "active",
      true,
    );
    await queryWrite(
      `INSERT INTO admin_audit_logs (admin_id, action, resource, resource_id, details)
       VALUES ($1, 'domain_verified', 'domain', $2, $3::jsonb)`,
      [adminId, String(id), JSON.stringify({ domain: rows[0].domain })],
    );
    return updated;
  },

  async removeDomain(id, adminId) {
    const { rows } = await queryWrite(
      `DELETE FROM custom_domains WHERE id = $1 RETURNING id, domain`,
      [id],
    );
    if (!rows[0]) return null;
    await queryWrite(
      `INSERT INTO admin_audit_logs (admin_id, action, resource, resource_id, details)
       VALUES ($1, 'domain_removed', 'domain', $2, $3::jsonb)`,
      [adminId, String(id), JSON.stringify({ domain: rows[0].domain })],
    );
    return rows[0];
  },

  async getWorkspaceAnalytics({ days = 30, domain, userId } = {}) {
    const values = [];
    const conditions = ["is_active = true"];
    if (domain) {
      values.push(domain);
      conditions.push(`domain = $${values.length}`);
    }
    if (userId) {
      values.push(userId);
      conditions.push(`user_id = $${values.length}`);
    }
    const { rows: urls } = await queryRead(
      `SELECT id, short_code, original_url, domain, tags
       FROM short_urls WHERE ${conditions.join(" AND ")}`,
      values,
    );
    const AnalyticsModel = require("./analytics.model");
    const analytics = await AnalyticsModel.getOverview(urls, { days });
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return {
      ...analytics,
      top_links: analytics.top_links.map((link) => ({
        ...link,
        short_url: `${link.domain && link.domain !== "localhost" ? link.domain : baseUrl}/${link.short_code}`,
      })),
    };
  },

  async createAnnouncement(adminId, { title, description, type = "digest" }) {
    const { rows } = await queryWrite(
      `INSERT INTO notifications (user_id, type, title, description, read)
       SELECT id, $1, $2, $3, false FROM users WHERE is_active = true
       RETURNING id`,
      [type, title, description],
    );
    await queryWrite(
      `INSERT INTO admin_audit_logs (admin_id, action, resource, details)
       VALUES ($1, 'announcement_sent', 'notification', $2::jsonb)`,
      [adminId, JSON.stringify({ title, recipients: rows.length })],
    );
    return { recipients: rows.length };
  },

  async systemHealth() {
    const check = async (name, operation) => {
      const startedAt = Date.now();
      try {
        await Promise.race([
          operation(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Health check timed out")), 2000),
          ),
        ]);
        return {
          name,
          status: "operational",
          latency_ms: Date.now() - startedAt,
        };
      } catch (error) {
        return {
          name,
          status: "down",
          latency_ms: Date.now() - startedAt,
          message: error.message,
        };
      }
    };

    const services = await Promise.all([
      check("api", async () => undefined),
      check("postgresql", () => queryRead("SELECT 1")),
      check("redis", () => redis.ping()),
    ]);
    const isHealthy = services.every(
      (service) => service.status === "operational",
    );
    return {
      status: isHealthy ? "operational" : "degraded",
      checked_at: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      services,
    };
  },

  async listLinks({ search, status, limit = 20, offset = 0 } = {}) {
    const values = [];
    const conditions = [];
    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(l.short_code ILIKE $${values.length} OR l.original_url ILIKE $${values.length} OR u.email ILIKE $${values.length})`,
      );
    }
    if (status === "active" || status === "archived") {
      values.push(status === "active");
      conditions.push(`l.is_active = $${values.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(limit, offset);
    const { rows } = await queryRead(
      `SELECT l.id::text, l.short_code, l.original_url, l.title, l.domain,
              l.click_count::bigint AS click_count, l.is_active, l.health_status,
              l.created_at, u.id::text AS owner_id, u.name AS owner_name,
              u.email AS owner_email
       FROM short_urls l
       LEFT JOIN users u ON u.id = l.user_id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    const countValues = values.slice(0, -2);
    const count = await queryRead(
      `SELECT COUNT(*)::int AS total FROM short_urls l
       LEFT JOIN users u ON u.id = l.user_id ${where}`,
      countValues,
    );
    return {
      links: rows.map((link) => ({
        ...link,
        click_count: Number(link.click_count) || 0,
        short_url: `${link.domain && link.domain !== "localhost" ? link.domain : process.env.BASE_URL || "http://localhost:3000"}/${link.short_code}`,
      })),
      total: count.rows[0]?.total || 0,
      limit,
      offset,
    };
  },

  async moderateLink(id, isActive, adminId) {
    const { rows } = await queryWrite(
      `UPDATE short_urls SET is_active = $1
       WHERE id = $2
       RETURNING id::text, short_code, is_active`,
      [isActive, id],
    );
    if (!rows[0]) return null;
    await queryWrite(
      `INSERT INTO admin_audit_logs
       (admin_id, action, resource, resource_id, details)
       VALUES ($1, $2, 'link', $3, $4::jsonb)`,
      [
        adminId,
        isActive ? "link_restored" : "link_archived",
        String(id),
        JSON.stringify({ short_code: rows[0].short_code }),
      ],
    );
    return rows[0];
  },

  async listAuditLogs({ limit = 50, offset = 0 } = {}) {
    const { rows } = await queryRead(
      `SELECT a.id::text, a.action, a.resource, a.resource_id, a.details,
              a.created_at, a.admin_id::text, u.name AS admin_name,
              u.email AS admin_email
       FROM admin_audit_logs a
       LEFT JOIN users u ON u.id = a.admin_id
       ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return { logs: rows, limit, offset };
  },

  async listUsers({ search, limit = 100, offset = 0 } = {}) {
    const values = [];
    const conditions = [];
    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`,
      );
    }
    values.push(limit, offset);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await queryRead(
      `${userSelect} ${where}
       GROUP BY u.id ORDER BY u.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    return rows;
  },

  async createInvitation({ name, email, plan }) {
    const passwordHash = await bcrypt.hash(uuidv4(), 12);
    const apiKey = `sk_${uuidv4().replace(/-/g, "")}`;
    const { rows } = await queryWrite(
      `INSERT INTO users (email, password_hash, name, api_key, plan, status, is_active)
       VALUES ($1, $2, $3, $4, $5, 'invited', true)
       RETURNING id, name, email, plan, status, is_active, created_at AS joined_at`,
      [email, passwordHash, name, apiKey, plan],
    );
    return { ...rows[0], links_count: 0 };
  },

  async updateUser(id, fields) {
    const allowed = {
      name: "name",
      email: "email",
      plan: "plan",
      status: "status",
    };
    const entries = Object.entries(fields).filter(([key]) => allowed[key]);
    if (entries.length === 0) return null;
    const values = entries.map(([, value]) => value);
    const assignments = entries
      .map(([key], index) => `${allowed[key]} = $${index + 1}`)
      .join(", ");
    if (fields.status) {
      values.push(fields.status === "suspended");
      assignments.concat(", is_active = $" + values.length);
    }
    values.push(id);
    const activeAssignment = fields.status
      ? `${assignments}, is_active = $${values.length - 1}`
      : assignments;
    const { rows } = await queryWrite(
      `UPDATE users SET ${activeAssignment}
       WHERE id = $${values.length} RETURNING id, name, email, plan, status, is_active,
       created_at AS joined_at`,
      values,
    );
    return rows[0] ? { ...rows[0], links_count: 0 } : null;
  },

  async deactivateUser(id) {
    const { rows } = await queryWrite(
      `UPDATE users SET status = 'suspended', is_active = false
       WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] || null;
  },

  async overview() {
    const [totals, plans, activity, topLinks, domains, visitors] =
      await Promise.all([
        queryRead(
          "SELECT COUNT(*)::int AS total_users, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_users FROM users",
        ),
        queryRead(
          "SELECT plan AS name, COUNT(*)::int AS count FROM users WHERE is_active = true GROUP BY plan ORDER BY plan",
        ),
        queryRead(
          "SELECT id, 'user_signup' AS type, name || ' joined the workspace' AS description, created_at AS timestamp FROM users ORDER BY created_at DESC LIMIT 10",
        ),
        queryRead(
          "SELECT id, short_code, original_url, domain, click_count::bigint AS click_count FROM short_urls WHERE is_active = true ORDER BY click_count DESC, created_at DESC LIMIT 3",
        ),
        queryRead(
          "SELECT COUNT(*)::int AS active_domains FROM custom_domains WHERE status = 'active'",
        ),
        queryRead(
          "SELECT COUNT(DISTINCT ip_address)::int AS unique_visitors FROM click_events WHERE ip_address IS NOT NULL",
        ),
      ]);
    const links = await queryRead(
      "SELECT COUNT(*)::int AS total_links, COALESCE(SUM(click_count), 0)::bigint AS total_clicks FROM short_urls WHERE is_active = true",
    );
    const totalClicks = Number(links.rows[0].total_clicks) || 0;
    const uniqueVisitors = Number(visitors.rows[0]?.unique_visitors) || 0;
    const topLinkRows = topLinks.rows.map((link) => ({
      ...link,
      click_count: Number(link.click_count) || 0,
      short_url: `${link.domain && link.domain !== "localhost" ? link.domain : process.env.BASE_URL || "http://localhost:3000"}/${link.short_code}`,
    }));

    return {
      total_users: totals.rows[0].total_users,
      new_users: totals.rows[0].new_users,
      total_links: links.rows[0].total_links,
      total_clicks: totalClicks,
      avg_ctr: totalClicks
        ? Number(((uniqueVisitors / totalClicks) * 100).toFixed(2))
        : 0,
      active_domains: domains.rows[0]?.active_domains || 0,
      plan_distribution: plans.rows,
      activity: activity.rows,
      top_links: topLinkRows,
    };
  },
};

module.exports = AdminModel;
