const { queryRead, queryWrite } = require("../config/database");

const DEFAULT_SETTINGS = {
  workspace_name: "Acme Corp",
  default_domain: process.env.DEFAULT_DOMAIN || "sh.rt",
  require_sso: false,
  public_analytics: true,
};

const SETTINGS_COLUMNS = `workspace_name, default_domain, require_sso, public_analytics`;

const SettingsModel = {
  async findByUserId(userId) {
    const { rows } = await queryRead(
      `SELECT ${SETTINGS_COLUMNS}
       FROM workspace_settings
       WHERE user_id = $1`,
      [userId],
    );
    return rows[0] || DEFAULT_SETTINGS;
  },

  async update(userId, settings) {
    const current = await this.findByUserId(userId);
    const next = { ...current, ...settings };
    const { rows } = await queryWrite(
      `INSERT INTO workspace_settings
         (user_id, workspace_name, default_domain, require_sso, public_analytics)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         workspace_name = EXCLUDED.workspace_name,
         default_domain = EXCLUDED.default_domain,
         require_sso = EXCLUDED.require_sso,
         public_analytics = EXCLUDED.public_analytics,
         updated_at = NOW()
       RETURNING ${SETTINGS_COLUMNS}`,
      [
        userId,
        next.workspace_name,
        next.default_domain,
        next.require_sso,
        next.public_analytics,
      ],
    );
    return rows[0];
  },
};

module.exports = SettingsModel;
