/**
 * ANRS Admin API Service
 * Handles all API communications for the admin dashboard
 */

class AdminAPI {
  constructor() {
    this.baseURL = "http://localhost:3001/api";
    this.token = localStorage.getItem("adminToken");
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.token || localStorage.getItem("adminToken");
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);

      // Handle token expiration
      if (
        error.message.includes("token") ||
        error.message.includes("unauthorized")
      ) {
        this.setToken(null);
        if (
          window.location.pathname.includes("admin") &&
          !window.location.pathname.includes("index.html")
        ) {
          window.location.href = "../index.html";
        }
      }

      throw error;
    }
  }

  // ===== AUTHENTICATION METHODS =====

  /**
   * Admin login
   */
  async login(email, password) {
    const response = await this.request("/admin/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Admin registration
   */
  async register(userData) {
    const response = await this.request("/admin/auth/admin-register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Verify admin token
   */
  async verifyAdminToken() {
    try {
      const response = await this.request("/admin/auth/verify-admin");
      return response.valid === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Admin logout
   */
  async logout() {
    try {
      await this.request("/admin/auth/admin-logout", { method: "POST" });
    } finally {
      this.setToken(null);
    }
  }

  // ===== USER MANAGEMENT METHODS =====

  /**
   * Get all users with pagination
   */
  async getUsers(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    return await this.request(`/admin/users?${params}`);
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    return await this.request(`/admin/users/${userId}`);
  }

  /**
   * Update user
   */
  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId) {
    return await this.request(`/admin/users/${userId}/toggle-status`, {
      method: "PATCH",
    });
  }

  // ===== FOOD MANAGEMENT METHODS =====

  /**
   * Get all foods
   */
  async getFoods(page = 1, limit = 20, category = "", search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      category,
      search,
    });

    return await this.request(`/admin/foods?${params}`);
  }

  /**
   * Create new food item
   */
  async createFood(foodData) {
    return await this.request("/admin/foods", {
      method: "POST",
      body: JSON.stringify(foodData),
    });
  }

  /**
   * Update food item
   */
  async updateFood(foodId, foodData) {
    return await this.request(`/admin/foods/${foodId}`, {
      method: "PUT",
      body: JSON.stringify(foodData),
    });
  }

  /**
   * Delete food item
   */
  async deleteFood(foodId) {
    return await this.request(`/admin/foods/${foodId}`, {
      method: "DELETE",
    });
  }

  // ===== ANALYTICS METHODS =====

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return await this.request("/admin/stats/dashboard");
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(period = "30d") {
    return await this.request(`/admin/analytics/users?period=${period}`);
  }

  /**
   * Get meal analytics
   */
  async getMealAnalytics(period = "30d") {
    return await this.request(`/admin/analytics/meals?period=${period}`);
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    return await this.request("/admin/system/health");
  }

  // ===== MEAL MANAGEMENT METHODS =====

  /**
   * Get all saved meals
   */
  async getAllMeals(page = 1, limit = 20, search = "") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    return await this.request(`/admin/meals?${params}`);
  }

  /**
   * Delete meal
   */
  async deleteMeal(mealId) {
    return await this.request(`/admin/meals/${mealId}`, {
      method: "DELETE",
    });
  }

  // ===== SETTINGS METHODS =====

  /**
   * Get admin settings
   */
  async getSettings() {
    return await this.request("/admin/settings");
  }

  /**
   * Update admin settings
   */
  async updateSettings(settings) {
    return await this.request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  // ===== EXPORT METHODS =====

  /**
   * Export users data
   */
  async exportUsers(format = "csv") {
    const response = await fetch(
      `${this.baseURL}/admin/export/users?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  }

  /**
   * Export meals data
   */
  async exportMeals(format = "csv") {
    const response = await fetch(
      `${this.baseURL}/admin/export/meals?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    return response.blob();
  }
}

// Create global instance
window.AdminAPI = new AdminAPI();
