const { queryRead, queryWrite } = require("../config/database");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const RoleModel = require("./role.model");

const SALT_ROUNDS = 12;

const UserModel = {
  async create({ email, password, name, roleName = "user" }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const apiKey = `sk_${uuidv4().replace(/-/g, "")}`;

    // Get role id
    const role = await RoleModel.findByName(roleName);
    if (!role) throw new Error(`Role '${roleName}' not found`);

    const { rows } = await queryWrite(
      `INSERT INTO users (email, password_hash, name, api_key, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, api_key, role_id, created_at`,
      [email, passwordHash, name || null, apiKey, role.id],
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await queryRead(
      `SELECT u.id, u.email, u.name, u.password_hash, u.api_key, u.role_id, u.is_active, u.created_at,
              r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email],
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await queryRead(
      `SELECT u.id, u.email, u.name, u.api_key, u.role_id, u.is_active, u.created_at,
              r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await queryRead(
      `SELECT u.id, u.email, u.name, u.api_key, u.role_id, u.is_active, u.created_at,
              r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`,
    );
    return rows;
  },

  async findByApiKey(apiKey) {
    const { rows } = await queryRead(
      `SELECT u.id, u.email, u.name, u.role_id, u.is_active,
              r.name as role_name, r.description as role_description
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.api_key = $1`,
      [apiKey],
    );
    return rows[0] || null;
  },

  async rotateApiKey(userId) {
    const newKey = `sk_${uuidv4().replace(/-/g, "")}`;
    const { rows } = await queryWrite(
      `UPDATE users SET api_key = $1 WHERE id = $2
       RETURNING api_key`,
      [newKey, userId],
    );
    return rows[0];
  },

  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },
};

module.exports = UserModel;
