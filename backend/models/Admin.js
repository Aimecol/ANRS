const database = require('../config/mysql-database');
const bcrypt = require('bcryptjs');

class Admin {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role || 'admin';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new admin
  static async create(adminData) {
    const { name, email, password, role = 'admin' } = adminData;

    // Hash the password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO admins (name, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await database.execute(sql, [
      name,
      email,
      password_hash,
      role,
      true
    ]);

    return await Admin.findById(result.insertId);
  }

  // Find admin by ID
  static async findById(id) {
    const sql = 'SELECT * FROM admins WHERE id = ?';
    const [rows] = await database.execute(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Admin(rows[0]);
  }

  // Find admin by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM admins WHERE email = ?';
    const [rows] = await database.execute(sql, [email]);
    
    if (rows.length === 0) {
      return null;
    }

    return new Admin(rows[0]);
  }

  // Get all admins with pagination
  static async getAll(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT id, name, email, role, is_active, last_login, created_at, updated_at
      FROM admins
    `;
    let countSql = 'SELECT COUNT(*) as total FROM admins';
    let params = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR email LIKE ?';
      countSql += ' WHERE name LIKE ? OR email LIKE ?';
      const searchParam = `%${search}%`;
      params = [searchParam, searchParam];
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await database.execute(sql, params);
    const [countRows] = await database.execute(countSql, search ? [`%${search}%`, `%${search}%`] : []);

    const admins = rows.map(row => new Admin(row));
    const total = countRows[0].total;

    return {
      admins,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Update admin
  async update(updateData) {
    const allowedFields = ['name', 'email', 'role', 'is_active'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);

    const sql = `
      UPDATE admins 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.execute(sql, values);

    // Refresh the instance with updated data
    const updated = await Admin.findById(this.id);
    Object.assign(this, updated);

    return this;
  }

  // Update password
  async updatePassword(newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    const sql = `
      UPDATE admins 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.execute(sql, [password_hash, this.id]);
    this.password_hash = password_hash;

    return this;
  }

  // Update last login
  async updateLastLogin() {
    const sql = `
      UPDATE admins 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.execute(sql, [this.id]);
    this.last_login = new Date();

    return this;
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Toggle active status
  async toggleStatus() {
    const newStatus = !this.is_active;
    
    const sql = `
      UPDATE admins 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.execute(sql, [newStatus, this.id]);
    this.is_active = newStatus;

    return this;
  }

  // Delete admin
  async delete() {
    const sql = 'DELETE FROM admins WHERE id = ?';
    await database.execute(sql, [this.id]);
    return true;
  }

  // Check if admin exists by email
  static async existsByEmail(email) {
    const sql = 'SELECT COUNT(*) as count FROM admins WHERE email = ?';
    const [rows] = await database.execute(sql, [email]);
    return rows[0].count > 0;
  }

  // Get admin statistics
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_admins,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_admins,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as super_admins,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_this_month
      FROM admins
    `;

    const [rows] = await database.execute(sql);
    return rows[0];
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    const { password_hash, ...adminData } = this;
    return {
      ...adminData,
      is_active: Boolean(adminData.is_active)
    };
  }

  // Convert to safe JSON for public use
  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      is_active: Boolean(this.is_active),
      created_at: this.created_at
    };
  }
}

module.exports = Admin;
