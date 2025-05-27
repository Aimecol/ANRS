/**
 * ANRS Admin Dashboard
 * Main dashboard functionality and data management
 */

let dashboardData = {
  stats: {},
  recentUsers: [],
  recentMeals: [],
  systemHealth: {}
};

/**
 * Initialize dashboard
 */
async function initDashboard() {
  try {
    // Check authentication
    if (!checkAdminAuth()) {
      return;
    }

    // Initialize UI components
    initSidebar();
    initUserMenu();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Set up auto-refresh
    setInterval(refreshDashboardStats, 30000); // Refresh every 30 seconds
    
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showNotification('Failed to initialize dashboard', 'error');
  }
}

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const mainContent = document.getElementById('adminMainContent');
  
  if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
    });
  }

  // Set active navigation item
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.admin-nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize user menu
 */
function initUserMenu() {
  const userAvatar = document.getElementById('userAvatar');
  const adminInfo = getCurrentAdmin();
  
  if (userAvatar && adminInfo) {
    // Set user initials
    const initials = adminInfo.name ? 
      adminInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
      'A';
    userAvatar.textContent = initials;
    userAvatar.title = `${adminInfo.name} (${adminInfo.email})`;
  }
}

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
  try {
    // Show loading states
    showLoadingStates();
    
    // Load data in parallel
    const [statsData, usersData, mealsData, healthData] = await Promise.allSettled([
      AdminAPI.getDashboardStats(),
      AdminAPI.getUsers(1, 5), // Get first 5 users
      AdminAPI.getAllMeals(1, 5), // Get first 5 meals
      AdminAPI.getSystemHealth()
    ]);

    // Process stats data
    if (statsData.status === 'fulfilled') {
      dashboardData.stats = statsData.value;
      updateStatsCards(statsData.value);
    } else {
      console.error('Failed to load stats:', statsData.reason);
      updateStatsCards(getDefaultStats());
    }

    // Process users data
    if (usersData.status === 'fulfilled') {
      dashboardData.recentUsers = usersData.value.users || [];
      updateRecentUsers(dashboardData.recentUsers);
    } else {
      console.error('Failed to load users:', usersData.reason);
      updateRecentUsers([]);
    }

    // Process meals data
    if (mealsData.status === 'fulfilled') {
      dashboardData.recentMeals = mealsData.value.meals || [];
      updateRecentMeals(dashboardData.recentMeals);
    } else {
      console.error('Failed to load meals:', mealsData.reason);
      updateRecentMeals([]);
    }

    // Process health data
    if (healthData.status === 'fulfilled') {
      dashboardData.systemHealth = healthData.value;
      updateSystemHealth(healthData.value);
    } else {
      console.error('Failed to load health data:', healthData.reason);
      updateSystemHealth(getDefaultHealthData());
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
}

/**
 * Show loading states for all components
 */
function showLoadingStates() {
  const loadingHTML = '<div class="admin-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
  
  // Stats cards
  document.getElementById('totalUsers').textContent = '-';
  document.getElementById('totalMeals').textContent = '-';
  document.getElementById('totalFoods').textContent = '-';
  document.getElementById('activeUsers').textContent = '-';
  
  // Recent lists
  const recentUsers = document.getElementById('recentUsers');
  const recentMeals = document.getElementById('recentMeals');
  const systemHealth = document.getElementById('systemHealth');
  
  if (recentUsers) recentUsers.innerHTML = loadingHTML;
  if (recentMeals) recentMeals.innerHTML = loadingHTML;
  if (systemHealth) systemHealth.innerHTML = loadingHTML;
}

/**
 * Update stats cards
 */
function updateStatsCards(stats) {
  const elements = {
    totalUsers: document.getElementById('totalUsers'),
    totalMeals: document.getElementById('totalMeals'),
    totalFoods: document.getElementById('totalFoods'),
    activeUsers: document.getElementById('activeUsers'),
    usersChange: document.getElementById('usersChange'),
    mealsChange: document.getElementById('mealsChange'),
    foodsChange: document.getElementById('foodsChange'),
    activeUsersChange: document.getElementById('activeUsersChange')
  };

  if (elements.totalUsers) elements.totalUsers.textContent = formatNumber(stats.totalUsers || 0);
  if (elements.totalMeals) elements.totalMeals.textContent = formatNumber(stats.totalMeals || 0);
  if (elements.totalFoods) elements.totalFoods.textContent = formatNumber(stats.totalFoods || 0);
  if (elements.activeUsers) elements.activeUsers.textContent = formatNumber(stats.activeUsers || 0);

  // Update change indicators
  updateChangeIndicator(elements.usersChange, stats.usersChange || 0);
  updateChangeIndicator(elements.mealsChange, stats.mealsChange || 0);
  updateChangeIndicator(elements.foodsChange, stats.foodsChange || 0);
  updateChangeIndicator(elements.activeUsersChange, stats.activeUsersChange || 0);
}

/**
 * Update change indicator
 */
function updateChangeIndicator(element, change) {
  if (!element) return;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  element.textContent = `${change > 0 ? '+' : ''}${change}%`;
  element.className = 'admin-stat-change ' + 
    (isPositive ? 'positive' : isNegative ? 'negative' : 'neutral');
}

/**
 * Update recent users list
 */
function updateRecentUsers(users) {
  const container = document.getElementById('recentUsers');
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = '<div class="admin-loading">No recent users found</div>';
    return;
  }

  const html = users.map(user => `
    <div class="admin-recent-item">
      <div class="admin-recent-avatar">
        ${getInitials(user.name)}
      </div>
      <div class="admin-recent-content">
        <div class="admin-recent-name">${escapeHtml(user.name)}</div>
        <div class="admin-recent-meta">
          ${escapeHtml(user.email)} • ${formatDate(user.created_at)}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

/**
 * Update recent meals list
 */
function updateRecentMeals(meals) {
  const container = document.getElementById('recentMeals');
  if (!container) return;

  if (meals.length === 0) {
    container.innerHTML = '<div class="admin-loading">No recent meals found</div>';
    return;
  }

  const html = meals.map(meal => `
    <div class="admin-recent-item">
      <div class="admin-recent-avatar">
        <i class="fas fa-utensils"></i>
      </div>
      <div class="admin-recent-content">
        <div class="admin-recent-name">${escapeHtml(meal.name)}</div>
        <div class="admin-recent-meta">
          ${meal.total_cost ? `$${meal.total_cost.toFixed(2)}` : 'No cost'} • ${formatDate(meal.saved_at)}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

/**
 * Update system health indicators
 */
function updateSystemHealth(health) {
  const container = document.getElementById('systemHealth');
  if (!container) return;

  const indicators = [
    { label: 'Database', status: health.database || 'healthy' },
    { label: 'API Server', status: health.api || 'healthy' },
    { label: 'Memory Usage', status: health.memory || 'healthy' },
    { label: 'Disk Space', status: health.disk || 'healthy' }
  ];

  const html = indicators.map(indicator => `
    <div class="admin-health-item">
      <span class="admin-health-label">${indicator.label}</span>
      <span class="admin-health-status ${indicator.status}">
        ${indicator.status.charAt(0).toUpperCase() + indicator.status.slice(1)}
      </span>
    </div>
  `).join('');

  container.innerHTML = html;
}

/**
 * Refresh dashboard stats
 */
async function refreshDashboardStats() {
  try {
    const stats = await AdminAPI.getDashboardStats();
    updateStatsCards(stats);
  } catch (error) {
    console.error('Failed to refresh stats:', error);
  }
}

/**
 * Refresh system health
 */
async function refreshSystemHealth() {
  try {
    const healthContainer = document.getElementById('systemHealth');
    if (healthContainer) {
      healthContainer.innerHTML = '<div class="admin-loading"><i class="fas fa-spinner fa-spin"></i> Checking...</div>';
    }
    
    const health = await AdminAPI.getSystemHealth();
    updateSystemHealth(health);
    
    showNotification('System health refreshed', 'success');
  } catch (error) {
    console.error('Failed to refresh system health:', error);
    showNotification('Failed to refresh system health', 'error');
  }
}

/**
 * Utility functions
 */
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getDefaultStats() {
  return {
    totalUsers: 0,
    totalMeals: 0,
    totalFoods: 15, // From the JSON file
    activeUsers: 0,
    usersChange: 0,
    mealsChange: 0,
    foodsChange: 0,
    activeUsersChange: 0
  };
}

function getDefaultHealthData() {
  return {
    database: 'warning',
    api: 'healthy',
    memory: 'healthy',
    disk: 'healthy'
  };
}

function showNotification(message, type = 'info') {
  // Simple notification system
  const notification = document.createElement('div');
  notification.className = `admin-notification admin-notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
  `;
  
  if (type === 'success') notification.style.backgroundColor = '#4caf50';
  else if (type === 'error') notification.style.backgroundColor = '#f44336';
  else if (type === 'warning') notification.style.backgroundColor = '#ff9800';
  else notification.style.backgroundColor = '#2196f3';
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
