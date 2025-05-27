/**
 * API Service for ANRS Backend (MySQL/XAMPP)
 * Replaces localStorage with backend API calls
 */

class APIService {
  constructor() {
    this.baseURL = "http://localhost:3000/api";
    this.token = localStorage.getItem("authToken");
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  // Setup network status listeners
  setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      console.log("Network connection restored");
      this.syncOfflineData();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("Network connection lost - switching to offline mode");
    });
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);

      // If network error and we have fallback data, use localStorage
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.warn("Network error, falling back to localStorage");
        return this.fallbackToLocalStorage(endpoint, options);
      }

      throw error;
    }
  }

  // Fallback to localStorage when API is unavailable
  fallbackToLocalStorage(endpoint, options) {
    console.warn(`Falling back to localStorage for: ${endpoint}`);

    // This is a simplified fallback - in production, you'd want more sophisticated offline handling
    if (endpoint.includes("/meals") && options.method === "GET") {
      const userId = JSON.parse(localStorage.getItem("currentUser") || "{}").id;
      return {
        meals: JSON.parse(localStorage.getItem(`savedMeals_${userId}`) || "[]"),
        pagination: { total: 0, limit: 20, offset: 0, hasMore: false },
      };
    }

    throw new Error("API unavailable and no fallback data");
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.setToken(null);
    }
  }

  // Saved Meals API
  async getSavedMeals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/meals${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async getSavedMeal(id) {
    return await this.request(`/meals/${id}`);
  }

  async saveMeal(mealData) {
    return await this.request("/meals", {
      method: "POST",
      body: JSON.stringify(mealData),
    });
  }

  async updateSavedMeal(id, mealData) {
    return await this.request(`/meals/${id}`, {
      method: "PUT",
      body: JSON.stringify(mealData),
    });
  }

  async deleteSavedMeal(id) {
    return await this.request(`/meals/${id}`, {
      method: "DELETE",
    });
  }

  async searchSavedMeals(searchTerm, limit = 20) {
    return await this.getSavedMeals({ search: searchTerm, limit });
  }

  async getMealsByCostRange(minCost, maxCost) {
    return await this.request(
      `/meals/filter/cost-range?min_cost=${minCost}&max_cost=${maxCost}`
    );
  }

  async getRecentMeals(days = 30) {
    return await this.request(`/meals/filter/recent?days=${days}`);
  }

  // Budget History API
  async getBudgetHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/budget${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async saveBudgetEntry(budgetData) {
    return await this.request("/budget", {
      method: "POST",
      body: JSON.stringify(budgetData),
    });
  }

  // Grocery History API
  async getGroceryHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/grocery${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async saveGroceryAnalysis(groceryData) {
    return await this.request("/grocery", {
      method: "POST",
      body: JSON.stringify(groceryData),
    });
  }

  // Children Recommendations API
  async getChildrenRecommendations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/children${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async saveChildrenRecommendation(recommendationData) {
    return await this.request("/children", {
      method: "POST",
      body: JSON.stringify(recommendationData),
    });
  }

  // Foods API
  async getFoods(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/foods${queryString ? `?${queryString}` : ""}`;
    return await this.request(endpoint);
  }

  async searchFoods(searchTerm) {
    return await this.getFoods({ search: searchTerm });
  }

  // User Profile API
  async getUserProfile() {
    return await this.request("/users/profile");
  }

  async updateUserProfile(profileData) {
    return await this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return await this.request("/users/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  // Health check
  async healthCheck() {
    return await this.request("/health");
  }

  // Sync localStorage data to backend (migration helper)
  async syncLocalStorageData() {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) {
        throw new Error("No current user found");
      }

      // Sync saved meals
      const savedMeals = JSON.parse(
        localStorage.getItem(`savedMeals_${currentUser.id}`) || "[]"
      );
      for (const meal of savedMeals) {
        try {
          await this.saveMeal({
            name: meal.name,
            total_cost: meal.totalCost || meal.total_cost,
            foods: meal.foods || [],
          });
        } catch (error) {
          console.warn(`Failed to sync meal: ${meal.name}`, error);
        }
      }

      // Sync budget history
      const budgetHistory = JSON.parse(
        localStorage.getItem(`budgetHistory_${currentUser.id}`) || "[]"
      );
      for (const entry of budgetHistory) {
        try {
          await this.saveBudgetEntry(entry);
        } catch (error) {
          console.warn("Failed to sync budget entry", error);
        }
      }

      // Sync grocery history
      const groceryHistory = JSON.parse(
        localStorage.getItem(`groceryHistory_${currentUser.id}`) || "[]"
      );
      for (const entry of groceryHistory) {
        try {
          await this.saveGroceryAnalysis(entry);
        } catch (error) {
          console.warn("Failed to sync grocery entry", error);
        }
      }

      // Sync children recommendations
      const childrenRecs = JSON.parse(
        localStorage.getItem(`childrenRecommendations_${currentUser.id}`) ||
          "[]"
      );
      for (const rec of childrenRecs) {
        try {
          await this.saveChildrenRecommendation(rec);
        } catch (error) {
          console.warn("Failed to sync children recommendation", error);
        }
      }

      console.log("localStorage data synced successfully");
      return { success: true, message: "Data synced successfully" };
    } catch (error) {
      console.error("Failed to sync localStorage data:", error);
      throw error;
    }
  }
}

// Create global instance
const apiService = new APIService();

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = APIService;
}
