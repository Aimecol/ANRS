/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Main JavaScript File
 */

// Global variables
let foodData = null;
let selectedFoods = [];
let currentUser = null;

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  checkAuthStatus();

  // Load food data
  loadFoodData();

  // Initialize page-specific functionality
  initPageFunctionality();

  // Register service worker for offline functionality
  registerServiceWorker();
});

/**
 * Check if user is logged in and update UI accordingly
 */
function checkAuthStatus() {
  const userDataString = localStorage.getItem("currentUser");
  if (userDataString) {
    currentUser = JSON.parse(userDataString);
    updateUIForLoggedInUser();
  } else {
    updateUIForGuestUser();
  }
}

/**
 * Update UI elements for logged in users
 */
function updateUIForLoggedInUser() {
  const authElements = document.querySelectorAll(".auth-dependent");
  const guestElements = document.querySelectorAll(".guest-only");
  const userNameElements = document.querySelectorAll(".user-name");

  authElements.forEach((el) => el.classList.remove("hidden"));
  guestElements.forEach((el) => el.classList.add("hidden"));

  if (userNameElements) {
    userNameElements.forEach((el) => {
      el.textContent = currentUser.name;
    });
  }
}

/**
 * Update UI elements for guest users
 */
function updateUIForGuestUser() {
  const authElements = document.querySelectorAll(".auth-dependent");
  const guestElements = document.querySelectorAll(".guest-only");

  authElements.forEach((el) => el.classList.add("hidden"));
  guestElements.forEach((el) => el.classList.remove("hidden"));
}

/**
 * Load food data from JSON file
 */
async function loadFoodData() {
  try {
    const response = await fetch("./data/rwanda-foods.json");
    if (!response.ok) {
      throw new Error("Failed to load food data");
    }

    foodData = await response.json();

    // Cache the food data in localStorage for offline use
    localStorage.setItem("foodData", JSON.stringify(foodData));

    // Initialize food selection UI if on dashboard page
    const foodSelectionContainer = document.getElementById("food-selection");
    if (foodSelectionContainer) {
      populateFoodSelection(foodSelectionContainer);
    }
  } catch (error) {
    console.error("Error loading food data:", error);
    // Try to load from localStorage if available (for offline use)
    const cachedData = localStorage.getItem("foodData");
    if (cachedData) {
      foodData = JSON.parse(cachedData);
      console.log("Loaded food data from cache");

      // Initialize food selection UI if on dashboard page
      const foodSelectionContainer = document.getElementById("food-selection");
      if (foodSelectionContainer) {
        populateFoodSelection(foodSelectionContainer);
      }
    } else {
      showError(
        "Failed to load food data. Please check your connection and try again."
      );
    }
  }
}

/**
 * Initialize page-specific functionality based on current page
 */
function initPageFunctionality() {
  const currentPage = window.location.pathname.split("/").pop();

  // Check if dashboard page and redirect if not logged in
  if (currentPage === "dashboard.html" && !currentUser) {
    window.location.href = "login.html";
    return;
  }

  switch (currentPage) {
    case "home.html":
    case "":
      initLoginPage();
      break;
    case "login.html":
      initLoginPage();
      break;
    case "signup.html":
      initLoginPage(); // This initializes the registration form
      break;
    case "index.html":
      initDashboardPage();
      break;
    case "dashboard.html":
      // Dashboard.js handles initialization
      break;
    case "budget.html":
      initBudgetPage();
      break;
    default:
      // Default initialization
      break;
  }
}

/**
 * Initialize login page functionality
 */
function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const guestButton = document.getElementById("guest-access");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  if (guestButton) {
    guestButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

/**
 * Initialize dashboard page functionality
 */
function initDashboardPage() {
  const groceryForm = document.getElementById("grocery-form");

  if (groceryForm) {
    groceryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Check if analyzeDiet function exists (from diet-analysis.js)
      if (typeof analyzeDiet === "function") {
        analyzeDiet();
      } else {
        showError("Diet analysis functionality is not available.");
      }
    });
  }

  // Load saved groceries for logged in users
  if (
    currentUser &&
    currentUser.savedGroceries &&
    typeof loadSavedGroceries === "function"
  ) {
    loadSavedGroceries();
  }
}

/**
 * Initialize budget page functionality
 */
function initBudgetPage() {
  const budgetForm = document.getElementById("budget-form");

  if (budgetForm) {
    budgetForm.addEventListener("submit", (e) => {
      e.preventDefault();
      generateBudgetRecommendations();
    });
  }
}

/**
 * Populate food selection UI with food items from data
 */
function populateFoodSelection(container) {
  if (!foodData || !foodData.foods) return;

  // Create a single food list container
  const foodList = document.createElement("div");
  foodList.className = "food-list";

  // Sort foods alphabetically by name
  const sortedFoods = [...foodData.foods].sort((a, b) =>
    a.name.en.localeCompare(b.name.en)
  );

  // Add all foods to the list without categorization
  sortedFoods.forEach((food) => {
    const foodItem = document.createElement("div");
    foodItem.className = "food-item";
    foodItem.dataset.foodId = food.id;
    foodItem.dataset.category = food.category; // Keep category data attribute for search filtering

    foodItem.innerHTML = `
      <div class="food-checkbox">
        <input type="checkbox" id="food-${food.id}" data-food-id="${food.id}">
        <label for="food-${food.id}">${food.name.en} (${food.name.rw})</label>
      </div>
      <div class="food-quantity hidden">
        <label for="quantity-${food.id}">Quantity:</label>
        <input type="number" id="quantity-${food.id}" min="1" value="1">
        <select id="unit-${food.id}">
          ${food.quantityUnits
            .map((unit) => `<option value="${unit}">${unit}</option>`)
            .join("")}
        </select>
      </div>
    `;

    foodList.appendChild(foodItem);

    // Add event listener to checkbox
    setTimeout(() => {
      const checkbox = document.getElementById(`food-${food.id}`);
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          const quantityDiv = e.target
            .closest(".food-item")
            .querySelector(".food-quantity");
          if (e.target.checked) {
            quantityDiv.classList.remove("hidden");
            // Check if addFoodToSelection function exists (from diet-analysis.js)
            if (typeof addFoodToSelection === "function") {
              addFoodToSelection(food.id);
            } else {
              console.error("addFoodToSelection function is not available");
            }
          } else {
            quantityDiv.classList.add("hidden");
            // Check if removeFoodFromSelection function exists (from diet-analysis.js)
            if (typeof removeFoodFromSelection === "function") {
              removeFoodFromSelection(food.id);
            } else {
              console.error(
                "removeFoodFromSelection function is not available"
              );
            }
          }
        });
      }
    }, 0);
  });

  // Add the food list to the container
  container.appendChild(foodList);
}

/**
 * Register service worker for offline functionality
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./js/service-worker.js")
        .then((registration) => {
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        })
        .catch((err) => {
          console.log("ServiceWorker registration failed: ", err);
        });
    });
  }
}

/**
 * Show error message to user
 */
function showError(message) {
  const errorContainer = document.getElementById("error-container");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");

    // Hide after 5 seconds
    setTimeout(() => {
      errorContainer.classList.add("hidden");
    }, 5000);
  } else {
    alert(message);
  }
}

/**
 * Show success message to user
 */
function showSuccess(message) {
  const successContainer = document.getElementById("success-container");
  if (successContainer) {
    successContainer.textContent = message;
    successContainer.classList.remove("hidden");

    // Hide after 5 seconds
    setTimeout(() => {
      successContainer.classList.add("hidden");
    }, 5000);
  } else {
    alert(message);
  }
}
