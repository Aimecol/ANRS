const database = require("../config/mysql-database");

class SavedMeal {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.total_cost = data.total_cost;
    this.foods_data =
      typeof data.foods_data === "string"
        ? JSON.parse(data.foods_data)
        : data.foods_data;
    this.saved_at = data.saved_at;
  }

  // Create a new saved meal
  static async create(mealData) {
    const { user_id, name, total_cost, foods } = mealData;

    const sql = `
      INSERT INTO saved_meals (user_id, name, total_cost, foods_data)
      VALUES (?, ?, ?, ?)
    `;

    const result = await database.run(sql, [
      user_id,
      name,
      total_cost,
      JSON.stringify(foods),
    ]);

    return await SavedMeal.findById(result.insertId);
  }

  // Find saved meal by ID
  static async findById(id) {
    const sql = "SELECT * FROM saved_meals WHERE id = ?";
    const row = await database.get(sql, [id]);

    if (!row) return null;

    return new SavedMeal(row);
  }

  // Find all saved meals for a user
  static async findByUserId(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM saved_meals
      WHERE user_id = ?
      ORDER BY saved_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await database.all(sql, [userId, limit, offset]);

    return rows.map(
      (row) =>
        new SavedMeal({
          ...row,
          foods_data: JSON.parse(row.foods_data || "[]"),
        })
    );
  }

  // Get count of saved meals for a user
  static async countByUserId(userId) {
    const sql = "SELECT COUNT(*) as count FROM saved_meals WHERE user_id = ?";
    const result = await database.get(sql, [userId]);
    return result.count;
  }

  // Update a saved meal
  static async update(id, updateData) {
    const { name, total_cost, foods } = updateData;

    const sql = `
      UPDATE saved_meals
      SET name = ?, total_cost = ?, foods_data = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await database.run(sql, [name, total_cost, JSON.stringify(foods), id]);

    return await SavedMeal.findById(id);
  }

  // Delete a saved meal
  static async delete(id, userId) {
    const sql = "DELETE FROM saved_meals WHERE id = ? AND user_id = ?";
    const result = await database.run(sql, [id, userId]);
    return result.changes > 0;
  }

  // Search saved meals by name
  static async search(userId, searchTerm, limit = 20) {
    const sql = `
      SELECT * FROM saved_meals
      WHERE user_id = ? AND name LIKE ?
      ORDER BY saved_at DESC
      LIMIT ?
    `;

    const rows = await database.all(sql, [userId, `%${searchTerm}%`, limit]);

    return rows.map(
      (row) =>
        new SavedMeal({
          ...row,
          foods_data: JSON.parse(row.foods_data || "[]"),
        })
    );
  }

  // Get meals by cost range
  static async findByCostRange(userId, minCost, maxCost) {
    const sql = `
      SELECT * FROM saved_meals
      WHERE user_id = ? AND total_cost BETWEEN ? AND ?
      ORDER BY total_cost ASC
    `;

    const rows = await database.all(sql, [userId, minCost, maxCost]);

    return rows.map(
      (row) =>
        new SavedMeal({
          ...row,
          foods_data: JSON.parse(row.foods_data || "[]"),
        })
    );
  }

  // Get recent meals (last 30 days)
  static async getRecentMeals(userId, days = 30) {
    const sql = `
      SELECT * FROM saved_meals
      WHERE user_id = ? AND saved_at >= datetime('now', '-${days} days')
      ORDER BY saved_at DESC
    `;

    const rows = await database.all(sql, [userId]);

    return rows.map(
      (row) =>
        new SavedMeal({
          ...row,
          foods_data: JSON.parse(row.foods_data || "[]"),
        })
    );
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      total_cost: this.total_cost,
      foods: this.foods_data,
      saved_at: this.saved_at,
    };
  }
}

module.exports = SavedMeal;
