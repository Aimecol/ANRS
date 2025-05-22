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
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = 'login.html';
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
  const welcomeNameElement = document.getElementById('welcome-name');
  const lastLoginElement = document.getElementById('last-login');
  
  if (welcomeNameElement && currentUser) {
    welcomeNameElement.textContent = currentUser.name;
  }
  
  if (lastLoginElement) {
    // Get last login time from localStorage or use current time
    const lastLogin = localStorage.getItem(`lastLogin_${currentUser.id}`) || new Date().toISOString();
    
    // Format date
    const lastLoginDate = new Date(lastLogin);
    const formattedDate = lastLoginDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    lastLoginElement.textContent = formattedDate;
    
    // Update last login time
    localStorage.setItem(`lastLogin_${currentUser.id}`, new Date().toISOString());
  }
}

/**
 * Initialize tabs functionality
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (!tabButtons.length || !tabContents.length) return;
  
  // Add click event to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding content
      const tabId = button.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId);
      
      if (tabContent) {
        tabContent.classList.add('active');
        
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
    case 'profile-tab':
      loadProfileData();
      break;
    case 'saved-meals-tab':
      loadSavedMeals();
      break;
    case 'budget-history-tab':
      loadBudgetHistory();
      break;
    case 'grocery-history-tab':
      loadGroceryHistory();
      break;
    case 'children-recommendations-tab':
      loadChildrenRecommendations();
      break;
    case 'analytics-tab':
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
  userSavedMeals = JSON.parse(localStorage.getItem(`savedMeals_${currentUser.id}`) || '[]');
  
  // Load budget history
  userBudgetHistory = JSON.parse(localStorage.getItem(`budgetHistory_${currentUser.id}`) || '[]');
  
  // Load grocery history
  userGroceryHistory = JSON.parse(localStorage.getItem(`groceryHistory_${currentUser.id}`) || '[]');
  
  // Load children recommendations
  userChildrenRecommendations = JSON.parse(localStorage.getItem(`childrenRecommendations_${currentUser.id}`) || '[]');
  
  // Load activity data
  userActivityData = JSON.parse(localStorage.getItem(`activityData_${currentUser.id}`) || '[]');
  
  // Update dashboard summary
  updateDashboardSummary();
}

/**
 * Update dashboard summary with user data counts
 */
function updateDashboardSummary() {
  updateSummaryCard('saved-meals-count', userSavedMeals.length);
  updateSummaryCard('budget-history-count', userBudgetHistory.length);
  updateSummaryCard('grocery-history-count', userGroceryHistory.length);
  updateSummaryCard('children-recommendations-count', userChildrenRecommendations.length);
  
  // Calculate days active
  const daysActive = calculateDaysActive();
  updateSummaryCard('days-active', daysActive);
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
  
  userActivityData.forEach(activity => {
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
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Password change form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Load profile data into form
 */
function loadProfileData() {
  if (!currentUser) return;
  
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  
  if (nameInput) {
    nameInput.value = currentUser.name || '';
  }
  
  if (emailInput) {
    emailInput.value = currentUser.email || '';
  }
}

/**
 * Handle profile update form submission
 * @param {Event} e - Form submit event
 */
function handleProfileUpdate(e) {
  e.preventDefault();
  
  if (!currentUser) return;
  
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const profileMessage = document.getElementById('profile-message');
  
  if (!nameInput || !emailInput) return;
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  
  // Basic validation
  if (!name || !email) {
    showMessage(profileMessage, 'Please fill in all fields.', 'error');
    return;
  }
  
  // Get all users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Find current user
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  
  if (userIndex === -1) {
    showMessage(profileMessage, 'User not found.', 'error');
    return;
  }
  
  // Check if email is already used by another user
  if (email !== currentUser.email && users.some(user => user.email === email && user.id !== currentUser.id)) {
    showMessage(profileMessage, 'Email already in use by another account.', 'error');
    return;
  }
  
  // Update user data
  users[userIndex].name = name;
  users[userIndex].email = email;
  
  // Save updated users to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Update current user
  currentUser.name = name;
  currentUser.email = email;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Update welcome message
  updateWelcomeMessage();
  
  // Show success message
  showMessage(profileMessage, 'Profile updated successfully!', 'success');
  
  // Log activity
  logUserActivity('profile_update');
}

/**
 * Handle password change form submission
 * @param {Event} e - Form submit event
 */
function handlePasswordChange(e) {
  e.preventDefault();
  
  if (!currentUser) return;
  
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const passwordMessage = document.getElementById('password-message');
  
  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) return;
  
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  // Basic validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage(passwordMessage, 'Please fill in all fields.', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showMessage(passwordMessage, 'New passwords do not match.', 'error');
    return;
  }
  
  // Get all users
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Find current user
  const userIndex = users.findIndex(user => user.id === currentUser.id);
  
  if (userIndex === -1) {
    showMessage(passwordMessage, 'User not found.', 'error');
    return;
  }
  
  // Check current password
  if (users[userIndex].password !== currentPassword) {
    showMessage(passwordMessage, 'Current password is incorrect.', 'error');
    return;
  }
  
  // Update password
  users[userIndex].password = newPassword;
  
  // Save updated users to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Clear form
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
  
  // Show success message
  showMessage(passwordMessage, 'Password changed successfully!', 'success');
  
  // Log activity
  logUserActivity('password_change');
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
    container.textContent = '';
    container.className = 'message';
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
    details: details
  };
  
  // Add to activity data
  userActivityData.push(activity);
  
  // Save to localStorage
  localStorage.setItem(`activityData_${currentUser.id}`, JSON.stringify(userActivityData));
}

/**
 * Load saved meals
 */
function loadSavedMeals() {
  const savedMealsContainer = document.getElementById('saved-meals-list');
  if (!savedMealsContainer) return;
  
  if (userSavedMeals.length === 0) {
    savedMealsContainer.innerHTML = '<p class="empty-state">No saved meals yet. Save meals from the Budget Recommendations page.</p>';
    return;
  }
  
  // Sort meals by date (newest first)
  const sortedMeals = [...userSavedMeals].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  
  // Generate HTML for saved meals
  savedMealsContainer.innerHTML = sortedMeals.map(meal => `
    <div class="saved-item">
      <div class="saved-item-header">
        <h3>${meal.name}</h3>
        <span class="saved-date">${formatDate(meal.savedAt)}</span>
      </div>
      <div class="saved-item-content">
        <div class="meal-ingredients">
          <h4>Ingredients:</h4>
          <ul>
            ${meal.foods.map(food => `
              <li>
                <span class="food-name">${food.name.en} (${food.name.rw})</span>
                <span class="food-quantity">${food.quantity} ${food.unit}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="meal-cost">
          <strong>Total Cost:</strong> ${meal.totalCost} RWF
        </div>
      </div>
      <div class="saved-item-actions">
        <button class="btn btn-sm btn-danger delete-meal-btn" data-id="${meal.id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to delete buttons
  const deleteButtons = savedMealsContainer.querySelectorAll('.delete-meal-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mealId = button.getAttribute('data-id');
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
  userSavedMeals = userSavedMeals.filter(meal => meal.id !== mealId);
  
  // Save updated meals to localStorage
  localStorage.setItem(`savedMeals_${currentUser.id}`, JSON.stringify(userSavedMeals));
  
  // Reload saved meals
  loadSavedMeals();
  
  // Update dashboard summary
  updateDashboardSummary();
  
  // Log activity
  logUserActivity('delete_meal', { mealId });
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Additional functions for other tabs will be implemented as needed
