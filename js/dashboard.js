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

  // Initialize overview tab
  initOverviewTab();

  // Set up periodic refresh of summary cards
  setupPeriodicRefresh();
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
  console.log(`Loading data for tab: ${tabId}`);

  // First reload user data to ensure we have the latest information
  loadUserData();

  switch (tabId) {
    case "profile-tab":
      loadProfileData();
      break;
    case "saved-meals-tab":
      // Reload user data specifically for saved meals
      userSavedMeals = JSON.parse(
        localStorage.getItem(`savedMeals_${currentUser.id}`) || "[]"
      );
      // Load saved meals
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
    case "overview-tab":
      // Refresh overview tab data
      loadRecentActivity();
      loadLatestRecommendation();
      loadNutritionInsights();
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

  // Scan localStorage for any additional data
  scanLocalStorageForUserData();
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
 * Scan localStorage for user data and update summary cards
 */
function scanLocalStorageForUserData() {
  if (!currentUser) return;

  // Get all keys in localStorage
  const keys = Object.keys(localStorage);

  // Initialize counters
  let savedMealsCount = userSavedMeals.length;
  let budgetHistoryCount = userBudgetHistory.length;
  let groceryHistoryCount = userGroceryHistory.length;
  let childrenRecommendationsCount = userChildrenRecommendations.length;

  // Check if currentUser has these properties directly
  if (currentUser.savedMeals && Array.isArray(currentUser.savedMeals)) {
    savedMealsCount = Math.max(savedMealsCount, currentUser.savedMeals.length);
  }

  if (currentUser.budgetHistory && Array.isArray(currentUser.budgetHistory)) {
    budgetHistoryCount = Math.max(
      budgetHistoryCount,
      currentUser.budgetHistory.length
    );
  }

  if (currentUser.groceryHistory && Array.isArray(currentUser.groceryHistory)) {
    groceryHistoryCount = Math.max(
      groceryHistoryCount,
      currentUser.groceryHistory.length
    );
  }

  if (
    currentUser.childrenRecommendations &&
    Array.isArray(currentUser.childrenRecommendations)
  ) {
    childrenRecommendationsCount = Math.max(
      childrenRecommendationsCount,
      currentUser.childrenRecommendations.length
    );
  }

  // Scan localStorage for additional data
  keys.forEach((key) => {
    // Check for saved meals
    if (
      key.startsWith("savedMeals_") ||
      key.includes("meals") ||
      key.includes("meal")
    ) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          savedMealsCount = Math.max(savedMealsCount, data.length);
        } else if (
          data &&
          typeof data === "object" &&
          data.meals &&
          Array.isArray(data.meals)
        ) {
          savedMealsCount = Math.max(savedMealsCount, data.meals.length);
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e);
      }
    }

    // Check for budget history
    if (key.startsWith("budgetHistory_") || key.includes("budget")) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          budgetHistoryCount = Math.max(budgetHistoryCount, data.length);
        } else if (
          data &&
          typeof data === "object" &&
          data.history &&
          Array.isArray(data.history)
        ) {
          budgetHistoryCount = Math.max(
            budgetHistoryCount,
            data.history.length
          );
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e);
      }
    }

    // Check for grocery history
    if (key.startsWith("groceryHistory_") || key.includes("grocery")) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          groceryHistoryCount = Math.max(groceryHistoryCount, data.length);
        } else if (
          data &&
          typeof data === "object" &&
          data.history &&
          Array.isArray(data.history)
        ) {
          groceryHistoryCount = Math.max(
            groceryHistoryCount,
            data.history.length
          );
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e);
      }
    }

    // Check for children recommendations
    if (
      key.startsWith("childrenRecommendations_") ||
      key.includes("children") ||
      key.includes("child")
    ) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          childrenRecommendationsCount = Math.max(
            childrenRecommendationsCount,
            data.length
          );
        } else if (
          data &&
          typeof data === "object" &&
          data.recommendations &&
          Array.isArray(data.recommendations)
        ) {
          childrenRecommendationsCount = Math.max(
            childrenRecommendationsCount,
            data.recommendations.length
          );
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e);
      }
    }
  });

  // Update summary cards with the new counts
  updateSummaryCard("saved-meals-count", savedMealsCount);
  updateSummaryCard("budget-history-count", budgetHistoryCount);
  updateSummaryCard("grocery-history-count", groceryHistoryCount);
  updateSummaryCard(
    "children-recommendations-count",
    childrenRecommendationsCount
  );
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
 * Initialize overview tab with dynamic content
 */
function initOverviewTab() {
  // Set up event listeners for overview tab
  const viewProfileBtn = document.getElementById("view-profile-btn");
  if (viewProfileBtn) {
    viewProfileBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Find the profile tab button and click it
      const profileTabBtn = document.querySelector(
        '.tab-button[data-tab="profile-tab"]'
      );
      if (profileTabBtn) {
        profileTabBtn.click();
      }
    });
  }

  const viewAllActivityBtn = document.getElementById("view-all-activity-btn");
  if (viewAllActivityBtn) {
    viewAllActivityBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // Find the analytics tab button and click it
      const analyticsTabBtn = document.querySelector(
        '.tab-button[data-tab="analytics-tab"]'
      );
      if (analyticsTabBtn) {
        analyticsTabBtn.click();
      }
    });
  }

  // Load recent activity
  loadRecentActivity();

  // Load latest recommendation
  loadLatestRecommendation();

  // Load nutrition insights
  loadNutritionInsights();
}

/**
 * Load recent activity for overview tab
 */
function loadRecentActivity() {
  const recentActivityList = document.getElementById("recent-activity-list");
  if (!recentActivityList) return;

  if (!userActivityData || userActivityData.length === 0) {
    recentActivityList.innerHTML =
      '<li class="activity-placeholder">No recent activity yet.</li>';
    return;
  }

  // Sort activities by date (newest first)
  const sortedActivities = [...userActivityData].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Take only the 5 most recent activities
  const recentActivities = sortedActivities.slice(0, 5);

  recentActivityList.innerHTML = recentActivities
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

/**
 * Load latest recommendation for overview tab
 */
function loadLatestRecommendation() {
  const latestRecommendationContainer = document.getElementById(
    "latest-recommendation"
  );
  if (!latestRecommendationContainer) return;

  // Check for latest child recommendation
  if (
    currentUser.childrenRecommendations &&
    currentUser.childrenRecommendations.length > 0
  ) {
    const sortedRecs = [...currentUser.childrenRecommendations].sort(
      (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
    );
    const latestRec = sortedRecs[0];

    latestRecommendationContainer.innerHTML = `
      <div class="latest-recommendation-item">
        <h4>Children's Nutrition Guide</h4>
        <p><strong>Age:</strong> ${latestRec.ageValue} ${latestRec.ageType}</p>
        <p><strong>Stage:</strong> ${latestRec.recommendations.stage}</p>
        <p>${latestRec.recommendations.description.substring(0, 150)}${
      latestRec.recommendations.description.length > 150 ? "..." : ""
    }</p>
        <a href="#" class="btn btn-sm view-recommendation-btn" data-id="${
          latestRec.id
        }">
          <i class="fas fa-eye"></i> View Full Recommendation
        </a>
      </div>
    `;

    // Add event listener to view button
    const viewBtn = latestRecommendationContainer.querySelector(
      ".view-recommendation-btn"
    );
    if (viewBtn) {
      viewBtn.addEventListener("click", function (e) {
        e.preventDefault();
        // Find the children recommendations tab button and click it
        const childrenTabBtn = document.querySelector(
          '.tab-button[data-tab="children-recommendations-tab"]'
        );
        if (childrenTabBtn) {
          childrenTabBtn.click();
        }
      });
    }

    return;
  }

  // Check for latest meal recommendation
  if (currentUser.savedMeals && currentUser.savedMeals.length > 0) {
    const sortedMeals = [...currentUser.savedMeals].sort(
      (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
    );
    const latestMeal = sortedMeals[0];

    latestRecommendationContainer.innerHTML = `
      <div class="latest-recommendation-item">
        <h4>Meal Plan: ${latestMeal.name}</h4>
        <p><strong>Cost:</strong> ${latestMeal.totalCost} RWF</p>
        <p><strong>Foods:</strong> ${latestMeal.foods
          .slice(0, 3)
          .map((food) => food.name.en)
          .join(", ")}${latestMeal.foods.length > 3 ? "..." : ""}</p>
        <a href="#" class="btn btn-sm view-meal-btn">
          <i class="fas fa-eye"></i> View Saved Meals
        </a>
      </div>
    `;

    // Add event listener to view button
    const viewBtn =
      latestRecommendationContainer.querySelector(".view-meal-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", function (e) {
        e.preventDefault();
        // Find the saved meals tab button and click it
        const mealsTabBtn = document.querySelector(
          '.tab-button[data-tab="saved-meals-tab"]'
        );
        if (mealsTabBtn) {
          mealsTabBtn.click();
        }
      });
    }

    return;
  }

  // If no recommendations found
  latestRecommendationContainer.innerHTML = `
    <div class="recommendation-placeholder">
      <p>Your latest recommendation will appear here.</p>
      <p>Start by creating a meal plan or getting children's nutrition advice!</p>
    </div>
  `;
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

  // Refresh summary button
  const refreshSummaryBtn = document.getElementById("refresh-summary-btn");
  if (refreshSummaryBtn) {
    refreshSummaryBtn.addEventListener("click", handleRefreshSummary);
  }

  // Create sample meals button
  const createSampleMealsBtn = document.getElementById(
    "create-sample-meals-btn"
  );
  if (createSampleMealsBtn) {
    createSampleMealsBtn.addEventListener("click", () => {
      // Confirm before creating sample data
      if (
        confirm(
          "This will create sample meal data for testing purposes. Continue?"
        )
      ) {
        createSampleMealData();
      }
    });
  }
}

/**
 * Handle refresh summary button click
 */
function handleRefreshSummary() {
  // Add spinning animation to the refresh icon
  const refreshIcon = document.querySelector("#refresh-summary-btn i");
  if (refreshIcon) {
    refreshIcon.classList.add("fa-spin");
  }

  // Reload user data
  loadUserData();

  // Scan localStorage for any additional data
  scanLocalStorageForUserData();

  // Refresh recent activity
  loadRecentActivity();

  // Refresh latest recommendation
  loadLatestRecommendation();

  // Show success message
  const successMessage = document.createElement("div");
  successMessage.className = "success-message";
  successMessage.innerHTML =
    '<i class="fas fa-check-circle"></i> Dashboard data refreshed successfully!';

  // Find a good place to show the message
  const summaryCardsHeader = document.querySelector(".summary-cards-header");
  if (summaryCardsHeader) {
    summaryCardsHeader.parentNode.insertBefore(
      successMessage,
      summaryCardsHeader.nextSibling
    );
  }

  // Remove spinning animation after 1 second
  setTimeout(() => {
    if (refreshIcon) {
      refreshIcon.classList.remove("fa-spin");
    }

    // Remove success message after 3 seconds
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.parentNode.removeChild(successMessage);
      }
    }, 3000);
  }, 1000);
}

/**
 * Load nutrition insights for overview tab
 */
function loadNutritionInsights() {
  const insightsPlaceholder = document.querySelector(".insights-placeholder");
  const insightsContent = document.getElementById("insights-content");

  if (!insightsPlaceholder || !insightsContent) return;

  // Check if we have grocery history to generate insights
  if (currentUser.groceryHistory && currentUser.groceryHistory.length > 0) {
    // Calculate balance score
    const balanceScore = calculateBalanceScore();

    // Update balance progress bar
    const balanceProgress = document.getElementById("balance-progress");
    const balanceText = document.getElementById("balance-text");

    if (balanceProgress) {
      balanceProgress.style.width = `${balanceScore}%`;

      // Change color based on score
      if (balanceScore < 40) {
        balanceProgress.style.backgroundColor = "#f44336"; // Red
      } else if (balanceScore < 70) {
        balanceProgress.style.backgroundColor = "#ff9800"; // Orange
      } else {
        balanceProgress.style.backgroundColor = "#4caf50"; // Green
      }
    }

    if (balanceText) {
      if (balanceScore < 40) {
        balanceText.textContent =
          "Your diet could use more balance. Try adding more variety.";
      } else if (balanceScore < 70) {
        balanceText.textContent =
          "Your diet is moderately balanced. Keep improving!";
      } else {
        balanceText.textContent = "Great job! Your diet is well-balanced.";
      }
    }

    // Generate category distribution
    const categoryDistribution = document.getElementById(
      "category-distribution"
    );
    if (categoryDistribution) {
      const distribution = calculateCategoryDistribution();

      categoryDistribution.innerHTML = Object.keys(distribution)
        .map((category) => {
          const categoryInfo = foodData?.categories?.find(
            (c) => c.id === category
          );
          if (!categoryInfo) return "";

          return `
          <span class="category-badge" style="background-color: ${
            categoryInfo.color || "#ccc"
          };">
            <i class="fas fa-${categoryInfo.icon || "circle"}"></i>
            ${categoryInfo.name?.en || category}: ${distribution[category]}%
          </span>
        `;
        })
        .join("");
    }

    // Update budget efficiency
    const budgetEfficiencyText = document.getElementById(
      "budget-efficiency-text"
    );
    if (
      budgetEfficiencyText &&
      currentUser.budgetHistory &&
      currentUser.budgetHistory.length > 0
    ) {
      const efficiency = calculateBudgetEfficiency();

      if (efficiency < 40) {
        budgetEfficiencyText.textContent =
          "You could improve your budget efficiency. Try our budget recommendations.";
      } else if (efficiency < 70) {
        budgetEfficiencyText.textContent =
          "Your budget efficiency is good. Keep using our budget planner for better results.";
      } else {
        budgetEfficiencyText.textContent =
          "Excellent budget efficiency! You are making the most of your food budget.";
      }
    }

    // Show insights content and hide placeholder
    insightsPlaceholder.classList.add("hidden");
    insightsContent.classList.remove("hidden");
  } else {
    // Show placeholder if no data
    insightsPlaceholder.classList.remove("hidden");
    insightsContent.classList.add("hidden");
  }
}

/**
 * Calculate balance score based on grocery history
 * @returns {number} Balance score (0-100)
 */
function calculateBalanceScore() {
  if (!currentUser.groceryHistory || currentUser.groceryHistory.length === 0)
    return 0;

  // Get the most recent grocery analysis
  const sortedHistory = [...currentUser.groceryHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const latestAnalysis = sortedHistory[0];

  // Count categories
  const categoryCounts = {};

  // Initialize category counts
  if (window.foodData && window.foodData.categories) {
    window.foodData.categories.forEach((category) => {
      categoryCounts[category.id] = 0;
    });
  } else {
    // Fallback if foodData is not available
    latestAnalysis.foods.forEach((food) => {
      if (!categoryCounts[food.category]) {
        categoryCounts[food.category] = 0;
      }
    });
  }

  latestAnalysis.foods.forEach((food) => {
    if (categoryCounts[food.category] !== undefined) {
      categoryCounts[food.category]++;
    }
  });

  // Check if all categories are represented
  const categoryCount = Object.keys(categoryCounts).length;
  const categoriesWithFood = Object.values(categoryCounts).filter(
    (count) => count > 0
  ).length;

  // Calculate balance score (0-100)
  const baseScore = (categoriesWithFood / categoryCount) * 100;

  // Adjust score based on distribution
  let distributionPenalty = 0;

  // Calculate standard deviation of category counts
  const counts = Object.values(categoryCounts);
  const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
  const variance =
    counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) /
    counts.length;
  const stdDev = Math.sqrt(variance);

  // Penalize high standard deviation (uneven distribution)
  if (mean > 0) {
    distributionPenalty = Math.min(30, (stdDev / mean) * 30);
  }

  return Math.max(
    0,
    Math.min(100, Math.round(baseScore - distributionPenalty))
  );
}

/**
 * Calculate category distribution based on grocery history
 * @returns {Object} Category distribution percentages
 */
function calculateCategoryDistribution() {
  if (!currentUser.groceryHistory || currentUser.groceryHistory.length === 0)
    return {};

  // Get the most recent grocery analysis
  const sortedHistory = [...currentUser.groceryHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const latestAnalysis = sortedHistory[0];

  // Count categories
  const categoryCounts = {};

  // Initialize category counts
  latestAnalysis.foods.forEach((food) => {
    if (!categoryCounts[food.category]) {
      categoryCounts[food.category] = 0;
    }
    categoryCounts[food.category]++;
  });

  // Calculate percentages
  const totalItems = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const distribution = {};

  Object.keys(categoryCounts).forEach((category) => {
    if (totalItems > 0) {
      distribution[category] = Math.round(
        (categoryCounts[category] / totalItems) * 100
      );
    } else {
      distribution[category] = 0;
    }
  });

  return distribution;
}

/**
 * Calculate budget efficiency score
 * @returns {number} Efficiency score (0-100)
 */
function calculateBudgetEfficiency() {
  if (!currentUser.budgetHistory || currentUser.budgetHistory.length === 0)
    return 0;

  // Get the most recent budget recommendation
  const sortedHistory = [...currentUser.budgetHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const latestBudget = sortedHistory[0];

  // Simple efficiency calculation based on recommendations count
  // More recommendations = more options = better efficiency
  const recommendationsCount = latestBudget.recommendationsCount || 0;

  // Scale: 0 recommendations = 0%, 3+ recommendations = 100%
  return Math.min(100, Math.round((recommendationsCount / 3) * 100));
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

  // Combine meals from both sources
  let allMeals = [...userSavedMeals];

  // Add meals from currentUser if they exist and aren't already included
  if (
    currentUser &&
    currentUser.savedMeals &&
    Array.isArray(currentUser.savedMeals)
  ) {
    currentUser.savedMeals.forEach((meal) => {
      // Check if this meal is already in allMeals by ID
      if (!allMeals.some((m) => m.id === meal.id)) {
        allMeals.push(meal);
      }
    });
  }

  // Check for meals in localStorage
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (
      key.startsWith("savedMeals_") ||
      key.includes("meals") ||
      key.includes("meal")
    ) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(data)) {
          data.forEach((meal) => {
            if (meal.id && !allMeals.some((m) => m.id === meal.id)) {
              allMeals.push(meal);
            }
          });
        } else if (
          data &&
          typeof data === "object" &&
          data.meals &&
          Array.isArray(data.meals)
        ) {
          data.meals.forEach((meal) => {
            if (meal.id && !allMeals.some((m) => m.id === meal.id)) {
              allMeals.push(meal);
            }
          });
        }
      } catch (e) {
        console.error(`Error parsing localStorage key ${key}:`, e);
      }
    }
  });

  // Show empty state if no meals found
  if (allMeals.length === 0) {
    savedMealsContainer.innerHTML = `
      <div class="empty-state">
        <p>No saved meals yet. Save meals from the Budget Recommendations page.</p>
        <button id="refresh-meals-btn" class="btn btn-sm">
          <i class="fas fa-sync-alt"></i> Refresh Meals
        </button>
      </div>
    `;

    // Add event listener to refresh button
    const refreshBtn = document.getElementById("refresh-meals-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        // Add spinning animation
        const icon = refreshBtn.querySelector("i");
        if (icon) icon.classList.add("fa-spin");

        // Reload user data and scan localStorage
        loadUserData();

        // Remove spinning animation after 1 second
        setTimeout(() => {
          if (icon) icon.classList.remove("fa-spin");
          // Reload saved meals
          loadSavedMeals();
        }, 1000);
      });
    }

    return;
  }

  // Sort meals by date (newest first)
  const sortedMeals = [...allMeals].sort(
    (a, b) =>
      new Date(b.savedAt || b.date || 0) - new Date(a.savedAt || a.date || 0)
  );

  // Add refresh button at the top
  savedMealsContainer.innerHTML = `
    <div class="saved-meals-header">
      <h3>Your Saved Meals (${sortedMeals.length})</h3>
      <button id="refresh-meals-btn" class="btn btn-sm" title="Refresh saved meals">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>
  `;

  // Create meals container
  const mealsListContainer = document.createElement("div");
  mealsListContainer.className = "saved-meals-list-container";

  // Generate HTML for saved meals
  mealsListContainer.innerHTML = sortedMeals
    .map(
      (meal) => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>${meal.name || "Unnamed Meal"}</h3>
        <span class="saved-date">${formatDate(
          meal.savedAt || meal.date || new Date()
        )}</span>
      </div>
      <div class="saved-item-content">
        <div class="meal-ingredients">
          <h4>Ingredients:</h4>
          <ul>
            ${
              meal.foods && Array.isArray(meal.foods)
                ? meal.foods
                    .map(
                      (food) => `
                  <li>
                    <span class="food-name">${
                      food.name?.en || food.name || "Unknown"
                    } ${food.name?.rw ? `(${food.name.rw})` : ""}</span>
                    <span class="food-quantity">${food.quantity || 1} ${
                        food.unit || "unit"
                      }</span>
                  </li>
                `
                    )
                    .join("")
                : "<li>No ingredients information available</li>"
            }
          </ul>
        </div>
        <div class="meal-cost">
          <strong>Total Cost:</strong> ${meal.totalCost || "N/A"} RWF
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

  // Append meals list to container
  savedMealsContainer.appendChild(mealsListContainer);

  // Add event listeners to delete buttons
  const deleteButtons =
    savedMealsContainer.querySelectorAll(".delete-meal-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mealId = button.getAttribute("data-id");
      deleteSavedMeal(mealId);
    });
  });

  // Add event listener to refresh button
  const refreshBtn = document.getElementById("refresh-meals-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      // Add spinning animation
      const icon = refreshBtn.querySelector("i");
      if (icon) icon.classList.add("fa-spin");

      // Reload user data and scan localStorage
      loadUserData();

      // Remove spinning animation after 1 second
      setTimeout(() => {
        if (icon) icon.classList.remove("fa-spin");
        // Reload saved meals
        loadSavedMeals();
      }, 1000);
    });
  }
}

/**
 * Delete saved meal
 * @param {string} mealId - ID of the meal to delete
 */
function deleteSavedMeal(mealId) {
  if (!currentUser || !mealId) return;

  // Show confirmation dialog
  if (!confirm("Are you sure you want to delete this meal?")) {
    return;
  }

  // Filter out the meal to delete from userSavedMeals
  userSavedMeals = userSavedMeals.filter((meal) => meal.id !== mealId);

  // Save updated meals to localStorage
  localStorage.setItem(
    `savedMeals_${currentUser.id}`,
    JSON.stringify(userSavedMeals)
  );

  // Also check if the meal is in currentUser.savedMeals
  if (currentUser.savedMeals && Array.isArray(currentUser.savedMeals)) {
    currentUser.savedMeals = currentUser.savedMeals.filter(
      (meal) => meal.id !== mealId
    );
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  // Check other localStorage keys that might contain this meal
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (
      key.startsWith("savedMeals_") ||
      key.includes("meals") ||
      key.includes("meal")
    ) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        let updated = false;

        if (Array.isArray(data)) {
          const filteredData = data.filter((meal) => meal.id !== mealId);
          if (filteredData.length !== data.length) {
            localStorage.setItem(key, JSON.stringify(filteredData));
            updated = true;
          }
        } else if (
          data &&
          typeof data === "object" &&
          data.meals &&
          Array.isArray(data.meals)
        ) {
          const filteredMeals = data.meals.filter((meal) => meal.id !== mealId);
          if (filteredMeals.length !== data.meals.length) {
            data.meals = filteredMeals;
            localStorage.setItem(key, JSON.stringify(data));
            updated = true;
          }
        }

        if (updated) {
          console.log(`Updated meal data in localStorage key: ${key}`);
        }
      } catch (e) {
        console.error(`Error updating localStorage key ${key}:`, e);
      }
    }
  });

  // Show success message
  const successMessage = document.createElement("div");
  successMessage.className = "success-message";
  successMessage.innerHTML =
    '<i class="fas fa-check-circle"></i> Meal deleted successfully!';

  const savedMealsContainer = document.getElementById("saved-meals-list");
  if (savedMealsContainer) {
    savedMealsContainer.insertBefore(
      successMessage,
      savedMealsContainer.firstChild
    );

    // Remove success message after 3 seconds
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.parentNode.removeChild(successMessage);
      }
    }, 3000);
  }

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

/**
 * Set up periodic refresh of summary cards
 * This ensures the dashboard stays up-to-date with any changes to localStorage
 */
function setupPeriodicRefresh() {
  // Refresh summary cards every 30 seconds
  setInterval(() => {
    // Reload user data from localStorage
    loadUserData();

    // Scan localStorage for any additional data
    scanLocalStorageForUserData();

    // Refresh recent activity if on overview tab
    const overviewTab = document.getElementById("overview-tab");
    if (overviewTab && overviewTab.classList.contains("active")) {
      loadRecentActivity();
      loadLatestRecommendation();
    }
  }, 30000); // 30 seconds
}

/**
 * Create sample meal data for testing
 * This function is for development purposes only
 */
function createSampleMealData() {
  if (!currentUser) return;

  // Check if we already have sample data
  if (userSavedMeals.length > 0) {
    console.log("Sample meal data already exists");
    return;
  }

  // Create sample meals
  const sampleMeals = [
    {
      id: "meal_" + Date.now(),
      name: "Balanced Rwandan Breakfast",
      savedAt: new Date().toISOString(),
      totalCost: 2500,
      foods: [
        {
          id: "food1",
          name: {
            en: "Sweet Potatoes",
            rw: "Ibijumba",
          },
          quantity: 2,
          unit: "kg",
          category: "starchy",
        },
        {
          id: "food2",
          name: {
            en: "Beans",
            rw: "Ibishyimbo",
          },
          quantity: 1,
          unit: "kg",
          category: "protein",
        },
        {
          id: "food3",
          name: {
            en: "Avocado",
            rw: "Avoka",
          },
          quantity: 3,
          unit: "pieces",
          category: "fruits",
        },
      ],
    },
    {
      id: "meal_" + (Date.now() + 1),
      name: "Nutritious Lunch Combo",
      savedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      totalCost: 3200,
      foods: [
        {
          id: "food4",
          name: {
            en: "Rice",
            rw: "Umuceri",
          },
          quantity: 2,
          unit: "kg",
          category: "starchy",
        },
        {
          id: "food5",
          name: {
            en: "Chicken",
            rw: "Inkoko",
          },
          quantity: 1,
          unit: "kg",
          category: "protein",
        },
        {
          id: "food6",
          name: {
            en: "Carrots",
            rw: "Karoti",
          },
          quantity: 0.5,
          unit: "kg",
          category: "vegetables",
        },
        {
          id: "food7",
          name: {
            en: "Tomatoes",
            rw: "Inyanya",
          },
          quantity: 0.5,
          unit: "kg",
          category: "vegetables",
        },
      ],
    },
  ];

  // Save sample meals to localStorage
  userSavedMeals = sampleMeals;
  localStorage.setItem(
    `savedMeals_${currentUser.id}`,
    JSON.stringify(sampleMeals)
  );

  // Also add to currentUser
  if (!currentUser.savedMeals) {
    currentUser.savedMeals = [];
  }
  currentUser.savedMeals = [...currentUser.savedMeals, ...sampleMeals];
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  console.log("Sample meal data created successfully");

  // Update dashboard
  updateDashboardSummary();

  // Log activity
  logUserActivity("create_sample_data", { count: sampleMeals.length });

  // Show success message
  alert(
    "Sample meal data created successfully. Check the Saved Meals tab to view them."
  );
}
