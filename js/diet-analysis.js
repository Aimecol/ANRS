/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Diet Analysis JavaScript File
 */

// Global variables for diet analysis
// Use the existing selectedFoods array if it exists, otherwise create a new one
window.selectedFoods = window.selectedFoods || [];

/**
 * Add food to selection
 * @param {number} foodId - ID of the food to add
 */
function addFoodToSelection(foodId) {
  const food = foodData.foods.find((f) => f.id === parseInt(foodId));
  if (!food) return;

  const quantityInput = document.getElementById(`quantity-${foodId}`);
  const unitSelect = document.getElementById(`unit-${foodId}`);

  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
  const unit = unitSelect ? unitSelect.value : food.quantityUnits[0];

  // Check if food is already in selection
  const existingIndex = selectedFoods.findIndex((f) => f.id === food.id);

  if (existingIndex >= 0) {
    // Update existing food
    selectedFoods[existingIndex].quantity = quantity;
    selectedFoods[existingIndex].unit = unit;
  } else {
    // Add new food
    selectedFoods.push({
      id: food.id,
      name: food.name,
      category: food.category,
      quantity: quantity,
      unit: unit,
      price: food.price,
    });
  }

  // Update UI
  updateSelectedFoodsUI();
}

/**
 * Remove food from selection
 * @param {number} foodId - ID of the food to remove
 */
function removeFoodFromSelection(foodId) {
  selectedFoods = selectedFoods.filter((food) => food.id !== parseInt(foodId));

  // Update UI
  updateSelectedFoodsUI();
}

/**
 * Update the UI to show selected foods
 */
function updateSelectedFoodsUI() {
  const selectedFoodsContainer = document.getElementById("selected-foods");
  if (!selectedFoodsContainer) return;

  // Clear container
  selectedFoodsContainer.innerHTML = "";

  if (selectedFoods.length === 0) {
    selectedFoodsContainer.innerHTML = "<p>No foods selected yet.</p>";
    return;
  }

  // Create table for selected foods
  const table = document.createElement("table");
  table.className = "selected-foods-table";

  // Table header
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Food</th>
      <th>Category</th>
      <th>Quantity</th>
      <th>Action</th>
    </tr>
  `;
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement("tbody");

  selectedFoods.forEach((food) => {
    const tr = document.createElement("tr");

    // Get category info
    const category = foodData.categories.find((c) => c.id === food.category);

    tr.innerHTML = `
      <td>${food.name.en} (${food.name.rw})</td>
      <td>
        <span class="category-badge category-${food.category}" style="background-color: ${category.color};">
          ${category.name.en}
        </span>
      </td>
      <td>${food.quantity} ${food.unit}</td>
      <td>
        <button class="btn-remove" data-food-id="${food.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  selectedFoodsContainer.appendChild(table);

  // Add event listeners to remove buttons
  const removeButtons = selectedFoodsContainer.querySelectorAll(".btn-remove");
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const foodId = button.dataset.foodId;
      removeFoodFromSelection(parseInt(foodId));

      // Also uncheck the checkbox
      const checkbox = document.getElementById(`food-${foodId}`);
      if (checkbox) {
        checkbox.checked = false;
        const quantityDiv = checkbox
          .closest(".food-item")
          .querySelector(".food-quantity");
        if (quantityDiv) {
          quantityDiv.classList.add("hidden");
        }
      }
    });
  });
}

/**
 * Analyze the diet based on selected foods
 */
function analyzeDiet() {
  if (selectedFoods.length === 0) {
    showError("Please select at least one food item.");
    return;
  }

  // Count foods in each category
  const categoryCounts = {};
  foodData.categories.forEach((category) => {
    categoryCounts[category.id] = 0;
  });

  selectedFoods.forEach((food) => {
    categoryCounts[food.category]++;
  });

  // Check if diet is balanced (has at least one item from each category)
  const missingCategories = [];
  let isBalanced = true;

  Object.keys(categoryCounts).forEach((categoryId) => {
    if (categoryCounts[categoryId] === 0) {
      isBalanced = false;
      missingCategories.push(categoryId);
    }
  });

  // Display results
  displayDietAnalysisResults(isBalanced, categoryCounts, missingCategories);

  // Save to localStorage for logged in users
  if (currentUser) {
    saveGrocerySelection();
  }
}

/**
 * Display diet analysis results
 * @param {boolean} isBalanced - Whether the diet is balanced
 * @param {Object} categoryCounts - Count of foods in each category
 * @param {Array} missingCategories - List of missing categories
 */
function displayDietAnalysisResults(
  isBalanced,
  categoryCounts,
  missingCategories
) {
  const resultsContainer = document.getElementById("analysis-results");
  if (!resultsContainer) return;

  // Clear previous results
  resultsContainer.innerHTML = "";

  // Create results card
  const resultsCard = document.createElement("div");
  resultsCard.className = "card analysis-card slide-up";

  if (isBalanced) {
    // Balanced diet
    resultsCard.innerHTML = `
      <div class="analysis-header balanced">
        <i class="fas fa-check-circle"></i>
        <h3>Balanced Diet!</h3>
      </div>
      <div class="analysis-content">
        <p>Congratulations! Your selected foods make up a balanced diet.</p>
        <div class="category-breakdown">
          <h4>Category Breakdown:</h4>
          <ul class="category-list">
            ${Object.keys(categoryCounts)
              .map((categoryId) => {
                const category = foodData.categories.find(
                  (c) => c.id === categoryId
                );
                return `
                <li>
                  <span class="category-badge category-${categoryId}" style="background-color: ${category.color};">
                    <i class="fas fa-${category.icon}"></i> ${category.name.en}
                  </span>
                  <span class="category-count">${categoryCounts[categoryId]} items</span>
                </li>
              `;
              })
              .join("")}
          </ul>
        </div>
        <div class="benefits-section">
          <h4>Benefits for Children:</h4>
          <ul class="benefits-list">
            <li><i class="fas fa-child"></i> <strong>Growth Support:</strong> Proteins help build strong muscles and tissues.</li>
            <li><i class="fas fa-brain"></i> <strong>Brain Development:</strong> Fats are essential for brain development.</li>
            <li><i class="fas fa-running"></i> <strong>Energy:</strong> Carbohydrates provide energy for daily activities.</li>
            <li><i class="fas fa-shield-alt"></i> <strong>Immune Support:</strong> Vitamins and minerals strengthen the immune system.</li>
          </ul>
        </div>
        <div class="meal-suggestions">
          <h4>Possible Meal Ideas:</h4>
          <div class="meal-cards">
            ${generateMealSuggestions()}
          </div>
        </div>
      </div>
    `;
  } else {
    // Unbalanced diet
    resultsCard.innerHTML = `
      <div class="analysis-header unbalanced">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unbalanced Diet</h3>
      </div>
      <div class="analysis-content">
        <p>Your selected foods do not make up a balanced diet. Here's what's missing:</p>
        <div class="missing-categories">
          <h4>Missing Categories:</h4>
          <ul class="category-list">
            ${missingCategories
              .map((categoryId) => {
                const category = foodData.categories.find(
                  (c) => c.id === categoryId
                );
                return `
                <li>
                  <span class="category-badge category-${categoryId}" style="background-color: ${
                  category.color
                };">
                    <i class="fas fa-${category.icon}"></i> ${category.name.en}
                  </span>
                  <div class="category-suggestions">
                    <p>Suggested affordable options:</p>
                    <ul class="food-suggestions">
                      ${generateFoodSuggestions(categoryId)}
                    </ul>
                  </div>
                </li>
              `;
              })
              .join("")}
          </ul>
        </div>
      </div>
    `;
  }

  resultsContainer.appendChild(resultsCard);
}

/**
 * Generate meal suggestions based on selected foods
 * @returns {string} HTML for meal suggestions
 */
function generateMealSuggestions() {
  // Simple algorithm to generate meal combinations
  // This is a placeholder - in a real app, this would be more sophisticated

  // Get one food from each category
  const mealComponents = {};

  foodData.categories.forEach((category) => {
    const foodsInCategory = selectedFoods.filter(
      (food) => food.category === category.id
    );
    if (foodsInCategory.length > 0) {
      // Pick a random food from this category
      const randomIndex = Math.floor(Math.random() * foodsInCategory.length);
      mealComponents[category.id] = foodsInCategory[randomIndex];
    }
  });

  // Generate 2 meal ideas
  const meals = [
    {
      name: "Balanced Lunch",
      components: Object.values(mealComponents),
    },
    {
      name: "Nutritious Dinner",
      components: Object.values(mealComponents),
    },
  ];

  return meals
    .map(
      (meal) => `
    <div class="meal-card">
      <h5>${meal.name}</h5>
      <ul>
        ${meal.components
          .map(
            (food) => `
          <li>${food.name.en} (${food.name.rw})</li>
        `
          )
          .join("")}
      </ul>
    </div>
  `
    )
    .join("");
}

/**
 * Generate food suggestions for a missing category
 * @param {string} categoryId - ID of the missing category
 * @returns {string} HTML for food suggestions
 */
function generateFoodSuggestions(categoryId) {
  // Get affordable foods from this category
  const affordableFoods = foodData.foods
    .filter((food) => food.category === categoryId)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3); // Get top 3 most affordable

  return affordableFoods
    .map(
      (food) => `
    <li>
      <strong>${food.name.en} (${food.name.rw})</strong> -
      ${food.price} RWF per ${food.priceUnit}
    </li>
  `
    )
    .join("");
}

/**
 * Save current grocery selection to user's localStorage
 */
function saveGrocerySelection() {
  if (!currentUser) return;

  // Get existing saved groceries or initialize empty array
  const savedGroceries = currentUser.savedGroceries || [];

  // Add current selection with timestamp
  savedGroceries.push({
    date: new Date().toISOString(),
    foods: [...selectedFoods],
  });

  // Keep only the last 5 selections
  if (savedGroceries.length > 5) {
    savedGroceries.shift();
  }

  // Update user data
  currentUser.savedGroceries = savedGroceries;

  // Save to grocery history for dashboard
  saveGroceryHistory();

  // Save to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  showSuccess("Your grocery selection has been saved.");
}

/**
 * Save grocery analysis to history
 */
function saveGroceryHistory() {
  if (!currentUser) return;

  // Initialize grocery history array if it doesn't exist
  if (!currentUser.groceryHistory) {
    currentUser.groceryHistory = [];
  }

  // Create history entry
  const historyEntry = {
    date: new Date().toISOString(),
    foods: selectedFoods.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      quantity: food.quantity,
      unit: food.unit,
    })),
  };

  // Add to history
  currentUser.groceryHistory.push(historyEntry);

  // Keep only the last 10 entries
  if (currentUser.groceryHistory.length > 10) {
    currentUser.groceryHistory.shift();
  }

  // Log activity if on dashboard
  if (
    window.location.pathname.includes("dashboard.html") &&
    typeof logUserActivity === "function"
  ) {
    logUserActivity("save_grocery_analysis", {
      foodCount: selectedFoods.length,
    });
  }
}

/**
 * Load saved groceries for the current user
 */
function loadSavedGroceries() {
  if (
    !currentUser ||
    !currentUser.savedGroceries ||
    currentUser.savedGroceries.length === 0
  )
    return;

  const savedGroceriesContainer = document.getElementById("saved-groceries");
  if (!savedGroceriesContainer) return;

  // Get the most recent saved grocery list
  const mostRecent =
    currentUser.savedGroceries[currentUser.savedGroceries.length - 1];

  // Create UI element
  const savedListCard = document.createElement("div");
  savedListCard.className = "card saved-groceries-card";

  savedListCard.innerHTML = `
    <h3>Your Last Saved Grocery List</h3>
    <p class="saved-date">Saved on: ${new Date(
      mostRecent.date
    ).toLocaleDateString()}</p>
    <ul class="saved-foods-list">
      ${mostRecent.foods
        .map(
          (food) => `
        <li>${food.name.en} (${food.name.rw}) - ${food.quantity} ${food.unit}</li>
      `
        )
        .join("")}
    </ul>
    <button class="btn btn-secondary" id="load-saved-groceries">Load This List</button>
  `;

  savedGroceriesContainer.appendChild(savedListCard);

  // Add event listener to load button
  document
    .getElementById("load-saved-groceries")
    .addEventListener("click", () => {
      // Clear current selection
      selectedFoods = [];

      // Load saved foods
      mostRecent.foods.forEach((food) => {
        selectedFoods.push(food);

        // Update UI checkboxes
        const checkbox = document.getElementById(`food-${food.id}`);
        if (checkbox) {
          checkbox.checked = true;

          // Show quantity div
          const quantityDiv = checkbox
            .closest(".food-item")
            .querySelector(".food-quantity");
          if (quantityDiv) {
            quantityDiv.classList.remove("hidden");

            // Update quantity and unit
            const quantityInput = document.getElementById(
              `quantity-${food.id}`
            );
            const unitSelect = document.getElementById(`unit-${food.id}`);

            if (quantityInput) quantityInput.value = food.quantity;
            if (unitSelect) unitSelect.value = food.unit;
          }
        }
      });

      // Update selected foods UI
      updateSelectedFoodsUI();

      showSuccess("Saved grocery list loaded successfully.");
    });
}
