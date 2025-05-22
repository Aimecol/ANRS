/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Budget Recommendations JavaScript File
 */

/**
 * Generate meal recommendations based on budget
 */
function generateBudgetRecommendations() {
  const budgetInput = document.getElementById('budget-amount');
  const resultsContainer = document.getElementById('budget-results');
  
  if (!budgetInput || !resultsContainer) return;
  
  const budget = parseInt(budgetInput.value);
  
  if (isNaN(budget) || budget <= 0) {
    showError('Please enter a valid budget amount.');
    return;
  }
  
  // Clear previous results
  resultsContainer.innerHTML = '';
  
  // Generate meal recommendations
  const recommendations = generateMealRecommendationsForBudget(budget);
  
  if (recommendations.length === 0) {
    resultsContainer.innerHTML = `
      <div class="card error-card slide-up">
        <div class="card-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>No Recommendations Available</h3>
        </div>
        <div class="card-content">
          <p>We couldn't generate balanced meal recommendations for your budget of ${budget} RWF.</p>
          <p>Try increasing your budget or check back later for more affordable options.</p>
        </div>
      </div>
    `;
    return;
  }
  
  // Display recommendations
  const recommendationsCard = document.createElement('div');
  recommendationsCard.className = 'card recommendations-card slide-up';
  
  recommendationsCard.innerHTML = `
    <div class="card-header">
      <i class="fas fa-utensils"></i>
      <h3>Meal Recommendations for ${budget} RWF</h3>
    </div>
    <div class="card-content">
      <p>Here are balanced meal options within your budget:</p>
      <div class="meal-options">
        ${recommendations.map((meal, index) => `
          <div class="meal-option">
            <h4>Option ${index + 1}: ${meal.name}</h4>
            <div class="meal-details">
              <div class="meal-ingredients">
                <h5>Ingredients:</h5>
                <ul>
                  ${meal.foods.map(food => `
                    <li>
                      <span class="food-name">${food.name.en} (${food.name.rw})</span>
                      <span class="food-quantity">${food.quantity} ${food.unit}</span>
                      <span class="food-price">${food.price * food.quantity} RWF</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              <div class="meal-nutrition">
                <h5>Nutrition:</h5>
                <div class="nutrition-categories">
                  ${Object.keys(meal.nutritionBreakdown).map(categoryId => {
                    const category = foodData.categories.find(c => c.id === categoryId);
                    return `
                      <div class="nutrition-category">
                        <span class="category-badge category-${categoryId}" style="background-color: ${category.color};">
                          <i class="fas fa-${category.icon}"></i> ${category.name.en}
                        </span>
                        <div class="nutrition-bar">
                          <div class="nutrition-fill" style="width: ${meal.nutritionBreakdown[categoryId]}%; background-color: ${category.color};"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
            <div class="meal-summary">
              <div class="meal-cost">
                <strong>Total Cost:</strong> ${meal.totalCost} RWF
              </div>
              <div class="meal-savings">
                <strong>Savings:</strong> ${budget - meal.totalCost} RWF
              </div>
            </div>
            <div class="meal-preparation">
              <h5>Preparation Tip:</h5>
              <p>${meal.preparationTip}</p>
            </div>
            ${currentUser ? `
              <button class="btn btn-secondary save-meal-btn" data-meal-index="${index}">
                <i class="fas fa-save"></i> Save This Meal
              </button>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  resultsContainer.appendChild(recommendationsCard);
  
  // Add event listeners to save buttons
  if (currentUser) {
    const saveButtons = resultsContainer.querySelectorAll('.save-meal-btn');
    saveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mealIndex = parseInt(button.dataset.mealIndex);
        saveMealToUserProfile(recommendations[mealIndex]);
      });
    });
  }
  
  // Save budget history for logged in users
  if (currentUser) {
    saveBudgetHistory(budget, recommendations);
  }
}

/**
 * Generate meal recommendations based on budget
 * @param {number} budget - Budget in RWF
 * @returns {Array} Array of meal recommendations
 */
function generateMealRecommendationsForBudget(budget) {
  if (!foodData || !foodData.foods) return [];
  
  const recommendations = [];
  
  // Sort foods by price (cheapest first)
  const sortedFoods = [...foodData.foods].sort((a, b) => a.price - b.price);
  
  // Try to create balanced meals within budget
  // This is a simplified algorithm - a real app would have more sophisticated logic
  
  // Attempt to create 3 different meal options
  for (let attempt = 0; attempt < 3; attempt++) {
    // Start with a different base food for variety
    const startIndex = attempt % sortedFoods.length;
    
    const mealFoods = [];
    let remainingBudget = budget;
    let categoriesCovered = {};
    
    // Initialize categories covered
    foodData.categories.forEach(category => {
      categoriesCovered[category.id] = false;
    });
    
    // First, try to cover all categories with at least one food
    for (let i = 0; i < sortedFoods.length; i++) {
      const foodIndex = (startIndex + i) % sortedFoods.length;
      const food = sortedFoods[foodIndex];
      
      // Skip if we already have this category covered
      if (categoriesCovered[food.category]) continue;
      
      // Check if we can afford this food
      if (food.price <= remainingBudget) {
        // Add food to meal
        const quantity = 1; // Start with quantity of 1
        
        mealFoods.push({
          ...food,
          quantity: quantity,
          unit: food.quantityUnits[0]
        });
        
        // Update budget and mark category as covered
        remainingBudget -= food.price * quantity;
        categoriesCovered[food.category] = true;
        
        // Check if all categories are covered
        const allCategoriesCovered = Object.values(categoriesCovered).every(covered => covered);
        if (allCategoriesCovered) break;
      }
    }
    
    // Check if we have a balanced meal
    const isBalanced = Object.values(categoriesCovered).every(covered => covered);
    
    if (isBalanced) {
      // Try to add more quantity or variety with remaining budget
      for (let i = 0; i < sortedFoods.length && remainingBudget > 0; i++) {
        const food = sortedFoods[i];
        
        // Skip expensive foods
        if (food.price > remainingBudget) continue;
        
        // Check if we already have this food
        const existingFoodIndex = mealFoods.findIndex(f => f.id === food.id);
        
        if (existingFoodIndex >= 0) {
          // Increase quantity of existing food
          mealFoods[existingFoodIndex].quantity += 1;
          remainingBudget -= food.price;
        } else {
          // Add new food for variety
          mealFoods.push({
            ...food,
            quantity: 1,
            unit: food.quantityUnits[0]
          });
          remainingBudget -= food.price;
        }
        
        // Stop if budget is too low
        if (remainingBudget < sortedFoods[0].price) break;
      }
      
      // Calculate total cost
      const totalCost = mealFoods.reduce((sum, food) => sum + (food.price * food.quantity), 0);
      
      // Calculate nutrition breakdown (simplified)
      const nutritionBreakdown = {};
      const categoryCount = {};
      
      // Count items in each category
      mealFoods.forEach(food => {
        if (!categoryCount[food.category]) {
          categoryCount[food.category] = 0;
        }
        categoryCount[food.category] += food.quantity;
      });
      
      // Calculate percentage for each category
      const totalItems = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
      
      Object.keys(categoryCount).forEach(category => {
        nutritionBreakdown[category] = Math.round((categoryCount[category] / totalItems) * 100);
      });
      
      // Generate a meal name
      const mealName = generateMealName(mealFoods);
      
      // Generate a preparation tip
      const preparationTip = generatePreparationTip(mealFoods);
      
      // Add to recommendations
      recommendations.push({
        name: mealName,
        foods: mealFoods,
        totalCost: totalCost,
        nutritionBreakdown: nutritionBreakdown,
        preparationTip: preparationTip
      });
    }
  }
  
  return recommendations;
}

/**
 * Generate a meal name based on ingredients
 * @param {Array} foods - Array of food objects
 * @returns {string} Meal name
 */
function generateMealName(foods) {
  // Get the main protein and carb
  const protein = foods.find(food => food.category === 'proteins');
  const carb = foods.find(food => food.category === 'carbohydrates');
  
  if (protein && carb) {
    return `${protein.name.en} with ${carb.name.en}`;
  } else if (protein) {
    return `${protein.name.en} Meal`;
  } else if (carb) {
    return `${carb.name.en} Dish`;
  } else {
    return 'Balanced Meal';
  }
}

/**
 * Generate a preparation tip based on ingredients
 * @param {Array} foods - Array of food objects
 * @returns {string} Preparation tip
 */
function generatePreparationTip(foods) {
  // This is a simplified version - a real app would have more sophisticated tips
  const tips = [
    "Cook the carbohydrates until soft, then add proteins and vegetables.",
    "Start by preparing the proteins, then add vegetables for the last few minutes of cooking.",
    "Boil the vegetables separately to preserve nutrients, then combine with other ingredients.",
    "Use minimal water when cooking to preserve nutrients.",
    "Add a small amount of oil or fat to help absorb fat-soluble vitamins."
  ];
  
  // Return a random tip
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Save meal to user profile
 * @param {Object} meal - Meal object to save
 */
function saveMealToUserProfile(meal) {
  if (!currentUser) return;
  
  // Initialize saved meals array if it doesn't exist
  if (!currentUser.savedMeals) {
    currentUser.savedMeals = [];
  }
  
  // Add meal with timestamp
  currentUser.savedMeals.push({
    date: new Date().toISOString(),
    meal: meal
  });
  
  // Keep only the last 10 meals
  if (currentUser.savedMeals.length > 10) {
    currentUser.savedMeals.shift();
  }
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  showSuccess('Meal saved to your profile.');
}

/**
 * Save budget history
 * @param {number} budget - Budget amount
 * @param {Array} recommendations - Generated recommendations
 */
function saveBudgetHistory(budget, recommendations) {
  if (!currentUser) return;
  
  // Initialize budget history array if it doesn't exist
  if (!currentUser.budgetHistory) {
    currentUser.budgetHistory = [];
  }
  
  // Add budget entry with timestamp
  currentUser.budgetHistory.push({
    date: new Date().toISOString(),
    budget: budget,
    recommendationsCount: recommendations.length
  });
  
  // Keep only the last 10 entries
  if (currentUser.budgetHistory.length > 10) {
    currentUser.budgetHistory.shift();
  }
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

/**
 * Load budget history for the current user
 */
function loadBudgetHistory() {
  if (!currentUser || !currentUser.budgetHistory || currentUser.budgetHistory.length === 0) return;
  
  const historyContainer = document.getElementById('budget-history');
  if (!historyContainer) return;
  
  // Clear container
  historyContainer.innerHTML = '';
  
  // Create history card
  const historyCard = document.createElement('div');
  historyCard.className = 'card history-card';
  
  historyCard.innerHTML = `
    <h3>Your Budget History</h3>
    <ul class="budget-history-list">
      ${currentUser.budgetHistory.map(entry => `
        <li>
          <span class="budget-date">${new Date(entry.date).toLocaleDateString()}</span>
          <span class="budget-amount">${entry.budget} RWF</span>
          <button class="btn-use-budget" data-budget="${entry.budget}">Use</button>
        </li>
      `).join('')}
    </ul>
  `;
  
  historyContainer.appendChild(historyCard);
  
  // Add event listeners to use buttons
  const useButtons = historyContainer.querySelectorAll('.btn-use-budget');
  useButtons.forEach(button => {
    button.addEventListener('click', () => {
      const budget = button.dataset.budget;
      document.getElementById('budget-amount').value = budget;
      generateBudgetRecommendations();
    });
  });
}
