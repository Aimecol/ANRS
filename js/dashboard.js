/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Dashboard JavaScript File
 */

// Global variables for dashboard
let userSavedMeals = [];
let userBudgetHistory = [];
let userGroceryHistory = [];
let userChildrenRecommendations = [];
let userActivityData = [];

/**
 * Initialize dashboard when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = "login.html";
    return;
  }

  // Initialize dashboard components
  initDashboardComponents();

  // Load user data
  loadUserData();

  // Set up event listeners
  setupEventListeners();
});

/**
 * Initialize dashboard components
 */
function initDashboardComponents() {
  // Update welcome message
  updateWelcomeMessage();

  // Initialize tabs
  initTabs();
}

/**
 * Update welcome message with user's name and last login
 */
function updateWelcomeMessage() {
  const welcomeNameElement = document.getElementById("welcome-name");
  const lastLoginElement = document.getElementById("last-login");

  if (welcomeNameElement && currentUser) {
    welcomeNameElement.textContent = currentUser.name;
  }

  if (lastLoginElement) {
    // Get last login time from localStorage or use current time
    const lastLogin =
      localStorage.getItem(`lastLogin_${currentUser.id}`) ||
      new Date().toISOString();

    // Format date
    const lastLoginDate = new Date(lastLogin);
    const formattedDate = lastLoginDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    lastLoginElement.textContent = formattedDate;

    // Update last login time
    localStorage.setItem(
      `lastLogin_${currentUser.id}`,
      new Date().toISOString()
    );
  }
}

/**
 * Initialize tabs functionality
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  if (!tabButtons.length || !tabContents.length) return;

  // Add click event to tab buttons
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Show corresponding content
      const tabId = button.getAttribute("data-tab");
      const tabContent = document.getElementById(tabId);

      if (tabContent) {
        tabContent.classList.add("active");

        // Load tab-specific data
        loadTabData(tabId);
      }
    });
  });

  // Activate first tab by default
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
}

/**
 * Load tab-specific data
 * @param {string} tabId - ID of the active tab
 */
function loadTabData(tabId) {
  switch (tabId) {
    case "profile-tab":
      loadProfileData();
      break;
    case "saved-meals-tab":
      loadSavedMeals();
      break;
    case "budget-history-tab":
      loadBudgetHistory();
      break;
    case "grocery-history-tab":
      loadGroceryHistory();
      break;
    case "children-recommendations-tab":
      loadChildrenRecommendations();
      break;
    case "analytics-tab":
      loadAnalyticsData();
      break;
  }
}

/**
 * Load user data from localStorage
 */
function loadUserData() {
  if (!currentUser) return;

  // Load saved meals
  userSavedMeals = JSON.parse(
    localStorage.getItem(`savedMeals_${currentUser.id}`) || "[]"
  );

  // Load budget history
  userBudgetHistory = JSON.parse(
    localStorage.getItem(`budgetHistory_${currentUser.id}`) || "[]"
  );

  // Load grocery history
  userGroceryHistory = JSON.parse(
    localStorage.getItem(`groceryHistory_${currentUser.id}`) || "[]"
  );

  // Load children recommendations
  userChildrenRecommendations = JSON.parse(
    localStorage.getItem(`childrenRecommendations_${currentUser.id}`) || "[]"
  );

  // Load activity data
  userActivityData = JSON.parse(
    localStorage.getItem(`activityData_${currentUser.id}`) || "[]"
  );

  // Update dashboard summary
  updateDashboardSummary();
}

/**
 * Update dashboard summary with user data counts
 */
function updateDashboardSummary() {
  updateSummaryCard("saved-meals-count", userSavedMeals.length);
  updateSummaryCard("budget-history-count", userBudgetHistory.length);
  updateSummaryCard("grocery-history-count", userGroceryHistory.length);
  updateSummaryCard(
    "children-recommendations-count",
    userChildrenRecommendations.length
  );

  // Calculate days active
  const daysActive = calculateDaysActive();
  updateSummaryCard("days-active", daysActive);
}

/**
 * Update summary card with count
 * @param {string} elementId - ID of the element to update
 * @param {number} count - Count to display
 */
function updateSummaryCard(elementId, count) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = count;
  }
}

/**
 * Calculate days active based on user activity data
 * @returns {number} Number of days active
 */
function calculateDaysActive() {
  if (!userActivityData.length) return 0;

  // Get unique dates from activity data
  const uniqueDates = new Set();

  userActivityData.forEach((activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    uniqueDates.add(date);
  });

  return uniqueDates.size;
}

/**
 * Set up event listeners for dashboard
 */
function setupEventListeners() {
  // Profile update form
  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileUpdate);
  }

  // Password change form
  const passwordForm = document.getElementById("password-form");
  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordChange);
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

/**
 * Load profile data into form
 */
function loadProfileData() {
  if (!currentUser) return;

  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");

  if (nameInput) {
    nameInput.value = currentUser.name || "";
  }

  if (emailInput) {
    emailInput.value = currentUser.email || "";
  }
}

/**
 * Handle profile update form submission
 * @param {Event} e - Form submit event
 */
function handleProfileUpdate(e) {
  e.preventDefault();

  if (!currentUser) return;

  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const profileMessage = document.getElementById("profile-message");

  if (!nameInput || !emailInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  // Basic validation
  if (!name || !email) {
    showMessage(profileMessage, "Please fill in all fields.", "error");
    return;
  }

  // Get all users
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Find current user
  const userIndex = users.findIndex((user) => user.id === currentUser.id);

  if (userIndex === -1) {
    showMessage(profileMessage, "User not found.", "error");
    return;
  }

  // Check if email is already used by another user
  if (
    email !== currentUser.email &&
    users.some((user) => user.email === email && user.id !== currentUser.id)
  ) {
    showMessage(
      profileMessage,
      "Email already in use by another account.",
      "error"
    );
    return;
  }

  // Update user data
  users[userIndex].name = name;
  users[userIndex].email = email;

  // Save updated users to localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Update current user
  currentUser.name = name;
  currentUser.email = email;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Update welcome message
  updateWelcomeMessage();

  // Show success message
  showMessage(profileMessage, "Profile updated successfully!", "success");

  // Log activity
  logUserActivity("profile_update");
}

/**
 * Handle password change form submission
 * @param {Event} e - Form submit event
 */
function handlePasswordChange(e) {
  e.preventDefault();

  if (!currentUser) return;

  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordMessage = document.getElementById("password-message");

  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput)
    return;

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Basic validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage(passwordMessage, "Please fill in all fields.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage(passwordMessage, "New passwords do not match.", "error");
    return;
  }

  // Get all users
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Find current user
  const userIndex = users.findIndex((user) => user.id === currentUser.id);

  if (userIndex === -1) {
    showMessage(passwordMessage, "User not found.", "error");
    return;
  }

  // Check current password
  if (users[userIndex].password !== currentPassword) {
    showMessage(passwordMessage, "Current password is incorrect.", "error");
    return;
  }

  // Update password
  users[userIndex].password = newPassword;

  // Save updated users to localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Clear form
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";

  // Show success message
  showMessage(passwordMessage, "Password changed successfully!", "success");

  // Log activity
  logUserActivity("password_change");
}

/**
 * Show message in message container
 * @param {HTMLElement} container - Message container element
 * @param {string} message - Message to display
 * @param {string} type - Message type (success or error)
 */
function showMessage(container, message, type) {
  if (!container) return;

  container.textContent = message;
  container.className = `message ${type}-message`;

  // Clear message after 5 seconds
  setTimeout(() => {
    container.textContent = "";
    container.className = "message";
  }, 5000);
}

/**
 * Log user activity
 * @param {string} activityType - Type of activity
 * @param {Object} details - Additional details about the activity
 */
function logUserActivity(activityType, details = {}) {
  if (!currentUser) return;

  // Create activity object
  const activity = {
    timestamp: new Date().toISOString(),
    type: activityType,
    details: details,
  };

  // Add to activity data
  userActivityData.push(activity);

  // Save to localStorage
  localStorage.setItem(
    `activityData_${currentUser.id}`,
    JSON.stringify(userActivityData)
  );
}

/**
 * Load saved meals
 */
function loadSavedMeals() {
  const savedMealsContainer = document.getElementById("saved-meals-list");
  if (!savedMealsContainer) return;

  if (userSavedMeals.length === 0) {
    savedMealsContainer.innerHTML =
      '<p class="empty-state">No saved meals yet. Save meals from the Budget Recommendations page.</p>';
    return;
  }

  // Sort meals by date (newest first)
  const sortedMeals = [...userSavedMeals].sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  // Generate HTML for saved meals
  savedMealsContainer.innerHTML = sortedMeals
    .map(
      (meal) => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>${meal.name}</h3>
        <span class="saved-date">${formatDate(meal.savedAt)}</span>
      </div>
      <div class="saved-item-content">
        <div class="meal-ingredients">
          <h4>Ingredients:</h4>
          <ul>
            ${meal.foods
              .map(
                (food) => `
              <li>
                <span class="food-name">${food.name.en} (${food.name.rw})</span>
                <span class="food-quantity">${food.quantity} ${food.unit}</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div class="meal-cost">
          <strong>Total Cost:</strong> ${meal.totalCost} RWF
        </div>
      </div>
      <div class="saved-item-actions">
        <button class="btn btn-sm btn-danger delete-meal-btn" data-id="${
          meal.id
        }">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to delete buttons
  const deleteButtons =
    savedMealsContainer.querySelectorAll(".delete-meal-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mealId = button.getAttribute("data-id");
      deleteSavedMeal(mealId);
    });
  });
}

/**
 * Delete saved meal
 * @param {string} mealId - ID of the meal to delete
 */
function deleteSavedMeal(mealId) {
  if (!currentUser || !mealId) return;

  // Filter out the meal to delete
  userSavedMeals = userSavedMeals.filter((meal) => meal.id !== mealId);

  // Save updated meals to localStorage
  localStorage.setItem(
    `savedMeals_${currentUser.id}`,
    JSON.stringify(userSavedMeals)
  );

  // Reload saved meals
  loadSavedMeals();

  // Update dashboard summary
  updateDashboardSummary();

  // Log activity
  logUserActivity("delete_meal", { mealId });
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Load children recommendations
 */
function loadChildrenRecommendations() {
  const childrenRecommendationsContainer = document.getElementById(
    "children-recommendations-list"
  );
  if (!childrenRecommendationsContainer) return;

  if (
    !currentUser.childrenRecommendations ||
    currentUser.childrenRecommendations.length === 0
  ) {
    childrenRecommendationsContainer.innerHTML =
      '<p class="empty-state">No children recommendations yet. Save recommendations from the Children Recommendations page.</p>';
    return;
  }

  // Sort recommendations by date (newest first)
  const sortedRecommendations = [...currentUser.childrenRecommendations].sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  // Generate HTML for saved recommendations
  childrenRecommendationsContainer.innerHTML = sortedRecommendations
    .map(
      (rec) => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>Recommendations for ${rec.ageValue} ${rec.ageType} old</h3>
        <span class="saved-date">${formatDate(rec.savedAt)}</span>
      </div>
      <div class="saved-item-content">
        <div class="age-stage-info">
          <h4>${rec.recommendations.stage}</h4>
          <p>${rec.recommendations.description}</p>
        </div>

        <div class="recommendations-section">
          <h4>Recommended Foods:</h4>
          <ul class="recommended-foods">
            ${rec.recommendations.recommendedFoods
              .slice(0, 3)
              .map(
                (food) => `
              <li>
                <i class="fas fa-check-circle"></i>
                <span>${food.name} ${
                  food.note ? `<small>(${food.note})</small>` : ""
                }</span>
              </li>
            `
              )
              .join("")}
            ${
              rec.recommendations.recommendedFoods.length > 3
                ? `<li><small>...and ${
                    rec.recommendations.recommendedFoods.length - 3
                  } more</small></li>`
                : ""
            }
          </ul>
        </div>
      </div>
      <div class="saved-item-actions">
        <a href="children.html" class="btn btn-sm">
          <i class="fas fa-external-link-alt"></i> View Full Recommendations
        </a>
        <button class="btn btn-sm btn-danger delete-recommendation-btn" data-id="${
          rec.id
        }">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to delete buttons
  const deleteButtons = childrenRecommendationsContainer.querySelectorAll(
    ".delete-recommendation-btn"
  );
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const recId = button.getAttribute("data-id");
      deleteChildRecommendation(recId);
    });
  });
}

/**
 * Delete child recommendation
 * @param {string} recId - ID of the recommendation to delete
 */
function deleteChildRecommendation(recId) {
  if (!currentUser || !recId) return;

  // Filter out the recommendation to delete
  currentUser.childrenRecommendations =
    currentUser.childrenRecommendations.filter((rec) => rec.id !== recId);

  // Save updated recommendations to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Reload recommendations
  loadChildrenRecommendations();

  // Update dashboard summary
  updateDashboardSummary();

  // Log activity
  logUserActivity("delete_child_recommendation", { recId });
}

/**
 * Load budget history
 */
function loadBudgetHistory() {
  const budgetHistoryContainer = document.getElementById("budget-history-list");
  if (!budgetHistoryContainer) return;

  if (!currentUser.budgetHistory || currentUser.budgetHistory.length === 0) {
    budgetHistoryContainer.innerHTML =
      '<p class="empty-state">No budget history yet. Use the Budget Recommendations page to create budget-based meal plans.</p>';
    return;
  }

  // Sort history by date (newest first)
  const sortedHistory = [...currentUser.budgetHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Generate HTML for budget history
  budgetHistoryContainer.innerHTML = sortedHistory
    .map(
      (entry) => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>Budget: ${entry.budget} RWF</h3>
        <span class="saved-date">${formatDate(entry.date)}</span>
      </div>
      <div class="saved-item-content">
        <p>Generated ${entry.recommendationsCount} meal recommendations</p>
      </div>
      <div class="saved-item-actions">
        <a href="budget.html" class="btn btn-sm">
          <i class="fas fa-external-link-alt"></i> Create New Budget Plan
        </a>
        <button class="btn btn-sm btn-danger delete-budget-btn" data-id="${
          entry.date
        }">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to delete buttons
  const deleteButtons =
    budgetHistoryContainer.querySelectorAll(".delete-budget-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const entryDate = button.getAttribute("data-id");
      deleteBudgetHistory(entryDate);
    });
  });
}

/**
 * Delete budget history entry
 * @param {string} entryDate - Date of the entry to delete
 */
function deleteBudgetHistory(entryDate) {
  if (!currentUser || !entryDate) return;

  // Filter out the entry to delete
  currentUser.budgetHistory = currentUser.budgetHistory.filter(
    (entry) => entry.date !== entryDate
  );

  // Save updated history to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Reload budget history
  loadBudgetHistory();

  // Update dashboard summary
  updateDashboardSummary();

  // Log activity
  logUserActivity("delete_budget_history", { entryDate });
}

/**
 * Load grocery history
 */
function loadGroceryHistory() {
  const groceryHistoryContainer = document.getElementById(
    "grocery-history-list"
  );
  if (!groceryHistoryContainer) return;

  if (!currentUser.groceryHistory || currentUser.groceryHistory.length === 0) {
    groceryHistoryContainer.innerHTML =
      '<p class="empty-state">No grocery history yet. Use the Grocery page to analyze your food selections.</p>';
    return;
  }

  // Sort history by date (newest first)
  const sortedHistory = [...currentUser.groceryHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Generate HTML for grocery history
  groceryHistoryContainer.innerHTML = sortedHistory
    .map(
      (entry) => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>Grocery Analysis</h3>
        <span class="saved-date">${formatDate(entry.date)}</span>
      </div>
      <div class="saved-item-content">
        <p>Selected ${entry.foods.length} food items</p>
        <div class="food-categories">
          ${generateCategoryBadges(entry.foods)}
        </div>
      </div>
      <div class="saved-item-actions">
        <a href="index.html" class="btn btn-sm">
          <i class="fas fa-external-link-alt"></i> New Grocery Analysis
        </a>
        <button class="btn btn-sm btn-danger delete-grocery-btn" data-id="${
          entry.date
        }">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to delete buttons
  const deleteButtons = groceryHistoryContainer.querySelectorAll(
    ".delete-grocery-btn"
  );
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const entryDate = button.getAttribute("data-id");
      deleteGroceryHistory(entryDate);
    });
  });
}

/**
 * Generate category badges for food items
 * @param {Array} foods - Array of food objects
 * @returns {string} HTML for category badges
 */
function generateCategoryBadges(foods) {
  // Count foods in each category
  const categoryCounts = {};

  foods.forEach((food) => {
    if (!categoryCounts[food.category]) {
      categoryCounts[food.category] = 0;
    }
    categoryCounts[food.category]++;
  });

  // Generate badges
  return Object.keys(categoryCounts)
    .map((category) => {
      const categoryInfo = foodData.categories.find((c) => c.id === category);
      if (!categoryInfo) return "";

      return `
      <span class="category-badge" style="background-color: ${categoryInfo.color};">
        <i class="fas fa-${categoryInfo.icon}"></i>
        ${categoryInfo.name.en}: ${categoryCounts[category]}
      </span>
    `;
    })
    .join("");
}

/**
 * Delete grocery history entry
 * @param {string} entryDate - Date of the entry to delete
 */
function deleteGroceryHistory(entryDate) {
  if (!currentUser || !entryDate) return;

  // Filter out the entry to delete
  currentUser.groceryHistory = currentUser.groceryHistory.filter(
    (entry) => entry.date !== entryDate
  );

  // Save updated history to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Reload grocery history
  loadGroceryHistory();

  // Update dashboard summary
  updateDashboardSummary();

  // Log activity
  logUserActivity("delete_grocery_history", { entryDate });
}

/**
 * Load analytics data
 */
function loadAnalyticsData() {
  const analyticsContainer = document.getElementById("analytics-container");
  if (!analyticsContainer) return;

  if (!userActivityData || userActivityData.length === 0) {
    analyticsContainer.innerHTML =
      '<p class="empty-state">No analytics data available yet. Continue using the app to generate usage statistics.</p>';
    return;
  }

  // Generate activity summary
  const activitySummary = generateActivitySummary();

  // Generate HTML for analytics
  analyticsContainer.innerHTML = `
    <div class="analytics-section">
      <h3>Activity Summary</h3>
      <div class="activity-summary">
        <div class="activity-stat">
          <div class="activity-value">${activitySummary.totalActivities}</div>
          <div class="activity-label">Total Activities</div>
        </div>
        <div class="activity-stat">
          <div class="activity-value">${activitySummary.daysActive}</div>
          <div class="activity-label">Days Active</div>
        </div>
        <div class="activity-stat">
          <div class="activity-value">${activitySummary.mostActiveDay}</div>
          <div class="activity-label">Most Active Day</div>
        </div>
      </div>
    </div>

    <div class="analytics-section">
      <h3>Recent Activity</h3>
      <ul class="activity-list">
        ${generateRecentActivityList()}
      </ul>
    </div>
  `;
}

/**
 * Generate activity summary
 * @returns {Object} Activity summary object
 */
function generateActivitySummary() {
  // Calculate days active
  const uniqueDates = new Set();
  userActivityData.forEach((activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    uniqueDates.add(date);
  });

  // Find most active day
  const activityByDay = {};
  userActivityData.forEach((activity) => {
    const day = new Date(activity.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
    });
    if (!activityByDay[day]) {
      activityByDay[day] = 0;
    }
    activityByDay[day]++;
  });

  let mostActiveDay = "None";
  let maxActivities = 0;

  Object.keys(activityByDay).forEach((day) => {
    if (activityByDay[day] > maxActivities) {
      mostActiveDay = day;
      maxActivities = activityByDay[day];
    }
  });

  return {
    totalActivities: userActivityData.length,
    daysActive: uniqueDates.size,
    mostActiveDay: mostActiveDay,
  };
}

/**
 * Generate recent activity list
 * @returns {string} HTML for recent activity list
 */
function generateRecentActivityList() {
  // Sort activities by date (newest first)
  const sortedActivities = [...userActivityData].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Take only the 10 most recent activities
  const recentActivities = sortedActivities.slice(0, 10);

  return recentActivities
    .map((activity) => {
      const date = new Date(activity.timestamp);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let activityText = "";

      switch (activity.type) {
        case "profile_update":
          activityText = "Updated profile information";
          break;
        case "password_change":
          activityText = "Changed password";
          break;
        case "save_meal":
          activityText = "Saved a meal recommendation";
          break;
        case "delete_meal":
          activityText = "Deleted a saved meal";
          break;
        case "save_child_recommendation":
          activityText = `Saved recommendations for ${activity.details.ageValue} ${activity.details.ageType} old child`;
          break;
        case "delete_child_recommendation":
          activityText = "Deleted a child recommendation";
          break;
        case "login":
          activityText = "Logged in";
          break;
        case "logout":
          activityText = "Logged out";
          break;
        default:
          activityText = `Activity: ${activity.type}`;
      }

      return `
      <li class="activity-item">
        <div class="activity-time">${formattedDate}</div>
        <div class="activity-description">${activityText}</div>
      </li>
    `;
    })
    .join("");
}
