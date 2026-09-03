const { queryRead, queryWrite } = require("../config/database");

const RoleModel = {
  async create({ name, description }) {
    const { rows } = await queryWrite(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, created_at`,
      [name, description || null],
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await queryRead(
      `SELECT id, name, description, created_at
       FROM roles WHERE id = $1`,
      [id],
    );
    return rows[0] || null;
  },

  async findByName(name) {
    const { rows } = await queryRead(
      `SELECT id, name, description, created_at
       FROM roles WHERE name = $1`,
      [name],
    );
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await queryRead(
      `SELECT id, name, description, created_at
       FROM roles ORDER BY name`,
    );
    return rows;
  },

  async update(id, { name, description }) {
    const { rows } = await queryWrite(
      `UPDATE roles SET name = $1, description = $2 WHERE id = $3
       RETURNING id, name, description, created_at`,
      [name, description || null, id],
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await queryWrite(
      `DELETE FROM roles WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0] || null;
  },
};

module.exports = RoleModel;
