/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Children's Age-Based Recommendations JavaScript File
 */

/**
 * Generate recommendations based on child's age
 */
function generateAgeRecommendations() {
  const ageTypeSelect = document.getElementById('age-type');
  const ageValueInput = document.getElementById('age-value');
  const resultsContainer = document.getElementById('age-results');
  
  if (!ageTypeSelect || !ageValueInput || !resultsContainer) return;
  
  const ageType = ageTypeSelect.value;
  const ageValue = parseInt(ageValueInput.value);
  
  if (isNaN(ageValue) || ageValue <= 0) {
    showError('Please enter a valid age.');
    return;
  }
  
  // Clear previous results
  resultsContainer.innerHTML = '';
  
  // Generate recommendations based on age
  const recommendations = getRecommendationsByAge(ageType, ageValue);
  
  if (!recommendations) {
    resultsContainer.innerHTML = `
      <div class="card error-card slide-up">
        <div class="card-header">
          <i class="fas fa-exclamation-circle"></i>
          <h3>No Recommendations Available</h3>
        </div>
        <div class="card-content">
          <p>We couldn't generate recommendations for a child of ${ageValue} ${ageType}.</p>
          <p>Please check the age value or try a different age category.</p>
        </div>
      </div>
    `;
    return;
  }
  
  // Create recommendations card
  const recommendationsCard = document.createElement('div');
  recommendationsCard.className = 'card recommendations-card slide-up';
  
  recommendationsCard.innerHTML = `
    <div class="card-header">
      <i class="fas fa-child"></i>
      <h3>Nutrition Recommendations for ${ageValue} ${ageType} old</h3>
    </div>
    <div class="card-content">
      <div class="age-stage-info">
        <h4>${recommendations.stage}</h4>
        <p>${recommendations.description}</p>
      </div>
      
      <div class="recommendations-section">
        <h4>Recommended Foods:</h4>
        <ul class="recommended-foods">
          ${recommendations.recommendedFoods.map(food => `
            <li>
              <i class="fas fa-check-circle"></i>
              <span>${food.name} ${food.note ? `<small>(${food.note})</small>` : ''}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="recommendations-section">
        <h4>Foods to Avoid:</h4>
        <ul class="foods-to-avoid">
          ${recommendations.foodsToAvoid.map(food => `
            <li>
              <i class="fas fa-times-circle"></i>
              <span>${food.name} ${food.reason ? `<small>(${food.reason})</small>` : ''}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="recommendations-section">
        <h4>Feeding Schedule:</h4>
        <div class="feeding-schedule">
          ${recommendations.feedingSchedule.map(schedule => `
            <div class="schedule-item">
              <div class="schedule-time">${schedule.time}</div>
              <div class="schedule-meal">${schedule.meal}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="recommendations-section">
        <h4>Nutritional Needs:</h4>
        <div class="nutritional-needs">
          ${Object.entries(recommendations.nutritionalNeeds).map(([nutrient, info]) => `
            <div class="nutrient-item">
              <div class="nutrient-name">${nutrient}:</div>
              <div class="nutrient-value">${info.value} ${info.unit}</div>
              <div class="nutrient-sources">Sources: ${info.sources.join(', ')}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="recommendations-section">
        <h4>Important Tips:</h4>
        <ul class="important-tips">
          ${recommendations.tips.map(tip => `
            <li>
              <i class="fas fa-lightbulb"></i>
              <span>${tip}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  
  resultsContainer.appendChild(recommendationsCard);
}

/**
 * Get recommendations based on age type and value
 * @param {string} ageType - Type of age (weeks, months, years)
 * @param {number} ageValue - Age value
 * @returns {Object} Recommendations object
 */
function getRecommendationsByAge(ageType, ageValue) {
  // Convert all ages to months for easier comparison
  let ageInMonths = 0;
  
  switch (ageType) {
    case 'weeks':
      ageInMonths = ageValue / 4.3; // Approximate weeks to months
      break;
    case 'months':
      ageInMonths = ageValue;
      break;
    case 'years':
      ageInMonths = ageValue * 12;
      break;
  }
  
  // Return appropriate recommendations based on age in months
  if (ageInMonths < 0.25) { // 0-1 week
    return getNewbornRecommendations();
  } else if (ageInMonths < 1) { // 1-4 weeks
    return getFirstMonthRecommendations();
  } else if (ageInMonths < 6) { // 1-6 months
    return getOneToSixMonthsRecommendations();
  } else if (ageInMonths < 12) { // 6-12 months
    return getSixToTwelveMonthsRecommendations();
  } else if (ageInMonths < 24) { // 1-2 years
    return getOneToTwoYearsRecommendations();
  } else if (ageInMonths < 60) { // 2-5 years
    return getTwoToFiveYearsRecommendations();
  } else { // 5+ years
    return getFivePlusYearsRecommendations();
  }
}

/**
 * Get recommendations for newborns (0-1 week)
 * @returns {Object} Recommendations object
 */
function getNewbornRecommendations() {
  return {
    stage: "Newborn Stage (0-1 week)",
    description: "During the first week of life, breast milk or formula is the only food your baby needs. Colostrum, the first milk produced, is rich in antibodies and essential for your newborn's immune system.",
    recommendedFoods: [
      { name: "Breast milk", note: "Exclusively" },
      { name: "Formula", note: "Only if breastfeeding is not possible" }
    ],
    foodsToAvoid: [
      { name: "Water", reason: "Can lead to water intoxication" },
      { name: "Solid foods", reason: "Digestive system not ready" },
      { name: "Cow's milk", reason: "Too difficult to digest" },
      { name: "Honey", reason: "Risk of botulism" }
    ],
    feedingSchedule: [
      { time: "Every 2-3 hours", meal: "Breast milk or formula (8-12 times per day)" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "45-55", unit: "per pound of body weight daily", sources: ["Breast milk", "Formula"] },
      "Fluids": { value: "570-850", unit: "ml daily", sources: ["Breast milk", "Formula"] }
    },
    tips: [
      "Feed on demand - whenever your baby shows hunger cues",
      "A newborn's stomach is very small (size of a cherry), so frequent feeding is normal",
      "Watch for signs of good feeding: 6-8 wet diapers daily, regular bowel movements, steady weight gain",
      "Proper latch is important for successful breastfeeding",
      "Seek help from a healthcare provider if you have concerns about feeding"
    ]
  };
}

/**
 * Get recommendations for 1-4 weeks
 * @returns {Object} Recommendations object
 */
function getFirstMonthRecommendations() {
  return {
    stage: "First Month (1-4 weeks)",
    description: "Your baby is still adjusting to the world outside the womb. Breast milk or formula continues to be the only food needed, providing all necessary nutrients for growth and development.",
    recommendedFoods: [
      { name: "Breast milk", note: "Exclusively" },
      { name: "Formula", note: "Only if breastfeeding is not possible" }
    ],
    foodsToAvoid: [
      { name: "Water", reason: "Can lead to water intoxication" },
      { name: "Solid foods", reason: "Digestive system not ready" },
      { name: "Cow's milk", reason: "Too difficult to digest" },
      { name: "Honey", reason: "Risk of botulism" }
    ],
    feedingSchedule: [
      { time: "Every 2-3 hours", meal: "Breast milk or formula (8-12 times per day)" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "45-55", unit: "per pound of body weight daily", sources: ["Breast milk", "Formula"] },
      "Fluids": { value: "570-850", unit: "ml daily", sources: ["Breast milk", "Formula"] }
    },
    tips: [
      "Your baby should be regaining birth weight by 10-14 days",
      "Cluster feeding (frequent feeding over a few hours) is normal, especially in the evenings",
      "Burp your baby after each feeding to reduce discomfort",
      "Never prop bottles - always hold your baby during feeding",
      "Contact your healthcare provider if your baby seems unusually fussy or is not gaining weight"
    ]
  };
}

/**
 * Get recommendations for 1-6 months
 * @returns {Object} Recommendations object
 */
function getOneToSixMonthsRecommendations() {
  return {
    stage: "Exclusive Milk Diet (1-6 months)",
    description: "During this period, breast milk or formula continues to be the only food your baby needs. Their digestive system is still developing and not ready for solid foods until around 6 months.",
    recommendedFoods: [
      { name: "Breast milk", note: "Exclusively" },
      { name: "Formula", note: "Only if breastfeeding is not possible" }
    ],
    foodsToAvoid: [
      { name: "Solid foods", reason: "Wait until 6 months unless advised by doctor" },
      { name: "Cow's milk", reason: "Too difficult to digest" },
      { name: "Juice", reason: "No nutritional benefit for infants" },
      { name: "Honey", reason: "Risk of botulism" }
    ],
    feedingSchedule: [
      { time: "Every 3-4 hours", meal: "Breast milk or formula (6-8 times per day)" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "80-100", unit: "kcal/kg daily", sources: ["Breast milk", "Formula"] },
      "Vitamin D": { value: "400", unit: "IU daily", sources: ["Supplements if breastfeeding"] }
    },
    tips: [
      "Feeding patterns may become more predictable during this period",
      "Growth spurts at around 3 months may increase hunger temporarily",
      "Exclusively breastfed babies may need vitamin D supplements",
      "Watch for signs your baby is getting enough milk: steady weight gain, 6-8 wet diapers daily",
      "Consult your healthcare provider before introducing any foods before 6 months"
    ]
  };
}

/**
 * Get recommendations for 6-12 months
 * @returns {Object} Recommendations object
 */
function getSixToTwelveMonthsRecommendations() {
  return {
    stage: "Introduction to Solids (6-12 months)",
    description: "Around 6 months, your baby is ready to begin exploring solid foods while continuing breast milk or formula. This is an important time for developing eating skills and introducing new tastes and textures.",
    recommendedFoods: [
      { name: "Breast milk or formula", note: "Still the primary source of nutrition" },
      { name: "Iron-fortified cereals", note: "Often recommended as first foods" },
      { name: "Pureed vegetables", note: "Start with mild flavors like sweet potato, carrot" },
      { name: "Pureed fruits", note: "Banana, avocado, apple are good starters" },
      { name: "Pureed meats", note: "Important source of iron" },
      { name: "Mashed beans", note: "Good protein source" }
    ],
    foodsToAvoid: [
      { name: "Honey", reason: "Risk of botulism before 12 months" },
      { name: "Cow's milk as main drink", reason: "Wait until 12 months" },
      { name: "Salt and sugar", reason: "Not needed and harmful for developing kidneys" },
      { name: "Hard foods", reason: "Choking hazard (nuts, whole grapes, popcorn)" },
      { name: "Fruit juice", reason: "Limited nutritional value, can cause tooth decay" }
    ],
    feedingSchedule: [
      { time: "Morning", meal: "Breast milk/formula + small amount of iron-fortified cereal" },
      { time: "Mid-morning", meal: "Breast milk/formula" },
      { time: "Lunch", meal: "Breast milk/formula + pureed vegetable or fruit" },
      { time: "Afternoon", meal: "Breast milk/formula" },
      { time: "Dinner", meal: "Breast milk/formula + pureed meat or beans" },
      { time: "Before bed", meal: "Breast milk/formula" }
    ],
    nutritionalNeeds: {
      "Iron": { value: "11", unit: "mg daily", sources: ["Fortified cereals", "Pureed meats", "Beans"] },
      "Protein": { value: "11", unit: "g daily", sources: ["Breast milk", "Formula", "Pureed meats", "Beans"] },
      "Zinc": { value: "3", unit: "mg daily", sources: ["Meat", "Beans", "Fortified cereals"] }
    },
    tips: [
      "Start with one food at a time and wait 3-5 days before introducing another to watch for allergies",
      "Begin with thin purees and gradually increase thickness as your baby adjusts",
      "Look for signs of readiness: sitting with support, good head control, interest in food",
      "Let your baby set the pace - never force feed",
      "By 8-9 months, offer soft finger foods to encourage self-feeding",
      "Remember: 'Food before one is just for fun' - breast milk/formula remains the main nutrition source"
    ]
  };
}

/**
 * Get recommendations for 1-2 years
 * @returns {Object} Recommendations object
 */
function getOneToTwoYearsRecommendations() {
  return {
    stage: "Toddler Nutrition (1-2 years)",
    description: "Your child is now transitioning to family foods and developing more independent eating habits. Growth rate slows down, so appetite may decrease. Focus on nutrient-dense foods in appropriate portions.",
    recommendedFoods: [
      { name: "Whole milk", note: "Important source of fat for brain development" },
      { name: "Variety of fruits and vegetables", note: "Cut into small, manageable pieces" },
      { name: "Protein foods", note: "Eggs, beans, small pieces of meat, fish" },
      { name: "Whole grains", note: "Oats, brown rice, whole grain bread" },
      { name: "Healthy fats", note: "Avocado, nut butters (if no allergies)" }
    ],
    foodsToAvoid: [
      { name: "Honey", reason: "Safe after 12 months" },
      { name: "Choking hazards", reason: "Whole nuts, popcorn, hard candies, whole grapes" },
      { name: "Added sugars", reason: "Limit sweet treats and juice" },
      { name: "Excessive salt", reason: "Avoid processed foods high in sodium" },
      { name: "Cow's milk before 12 months", reason: "Can cause intestinal bleeding and nutritional deficiencies" }
    ],
    feedingSchedule: [
      { time: "Breakfast", meal: "Whole milk + iron-fortified cereal or egg + fruit" },
      { time: "Mid-morning snack", meal: "Fruit or vegetable + water" },
      { time: "Lunch", meal: "Protein + vegetable + grain + milk" },
      { time: "Afternoon snack", meal: "Yogurt or cheese + fruit" },
      { time: "Dinner", meal: "Protein + vegetable + grain + milk" },
      { time: "Optional bedtime snack", meal: "Milk or small nutritious snack" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "900-1000", unit: "daily", sources: ["Variety of foods"] },
      "Protein": { value: "13", unit: "g daily", sources: ["Milk, meat, beans, eggs"] },
      "Calcium": { value: "700", unit: "mg daily", sources: ["Milk, yogurt, cheese"] },
      "Iron": { value: "7", unit: "mg daily", sources: ["Meat, beans, fortified cereals"] }
    },
    tips: [
      "Offer a variety of foods, even if refused at first - it may take 10-15 exposures before acceptance",
      "Create a regular eating schedule with 3 meals and 2-3 snacks",
      "Allow self-feeding to develop fine motor skills, even though it's messy",
      "Avoid using food as reward or punishment",
      "Model healthy eating habits - children learn by watching you",
      "Limit milk to 16-24 ounces (2-3 cups) daily to avoid displacing other nutrients",
      "Be patient with picky eating - it's a normal developmental phase"
    ]
  };
}

/**
 * Get recommendations for 2-5 years
 * @returns {Object} Recommendations object
 */
function getTwoToFiveYearsRecommendations() {
  return {
    stage: "Preschool Nutrition (2-5 years)",
    description: "During these years, your child is developing food preferences that may last a lifetime. Focus on offering a variety of nutritious foods and establishing healthy eating patterns.",
    recommendedFoods: [
      { name: "Fruits and vegetables", note: "Aim for 5 servings daily" },
      { name: "Whole grains", note: "Bread, pasta, rice, cereals" },
      { name: "Protein foods", note: "Meat, fish, eggs, beans, lentils" },
      { name: "Dairy products", note: "Milk, yogurt, cheese" },
      { name: "Healthy fats", note: "Avocado, nuts (if no allergies), olive oil" }
    ],
    foodsToAvoid: [
      { name: "Sugary drinks", reason: "Soda, fruit drinks, excessive juice" },
      { name: "Highly processed foods", reason: "High in salt, sugar, and unhealthy fats" },
      { name: "Excessive sweets", reason: "Limit cookies, candies, and desserts" },
      { name: "Choking hazards", reason: "Still be cautious with nuts, popcorn, etc." }
    ],
    feedingSchedule: [
      { time: "Breakfast", meal: "Whole grain + protein (egg/yogurt) + fruit" },
      { time: "Morning snack", meal: "Fruit or vegetable + protein source" },
      { time: "Lunch", meal: "Protein + vegetable + grain + milk" },
      { time: "Afternoon snack", meal: "Whole grain crackers + cheese or hummus" },
      { time: "Dinner", meal: "Protein + 2 vegetables + grain + milk" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "1000-1400", unit: "daily", sources: ["Variety of foods"] },
      "Protein": { value: "13-19", unit: "g daily", sources: ["Meat, dairy, beans, eggs"] },
      "Calcium": { value: "700", unit: "mg daily", sources: ["Milk, yogurt, cheese"] },
      "Iron": { value: "10", unit: "mg daily", sources: ["Meat, beans, fortified cereals"] },
      "Fiber": { value: "19-25", unit: "g daily", sources: ["Fruits, vegetables, whole grains"] }
    },
    tips: [
      "Serve age-appropriate portions - about 1 tablespoon of each food per year of age",
      "Involve children in meal preparation to increase interest in foods",
      "Establish regular family meals without distractions (TV, phones)",
      "Respect your child's appetite - don't force them to clean their plate",
      "Limit screen time during meals",
      "Offer new foods alongside familiar favorites",
      "Be a good role model with your own eating habits"
    ]
  };
}

/**
 * Get recommendations for 5+ years
 * @returns {Object} Recommendations object
 */
function getFivePlusYearsRecommendations() {
  return {
    stage: "School-Age Nutrition (5+ years)",
    description: "As your child grows, their nutritional needs increase to support physical activity, brain development, and overall growth. Establishing healthy eating habits now will set the foundation for lifelong health.",
    recommendedFoods: [
      { name: "Fruits and vegetables", note: "Variety of colors, aim for half the plate" },
      { name: "Whole grains", note: "Brown rice, whole wheat bread, oats" },
      { name: "Lean proteins", note: "Fish, poultry, beans, eggs" },
      { name: "Dairy or alternatives", note: "Milk, yogurt, cheese, fortified plant milks" },
      { name: "Healthy fats", note: "Nuts, seeds, avocados, olive oil" }
    ],
    foodsToAvoid: [
      { name: "Sugary drinks", reason: "Limit soda, sports drinks, and fruit drinks" },
      { name: "Highly processed snacks", reason: "Chips, cookies, candy" },
      { name: "Excessive fast food", reason: "High in calories, salt, and unhealthy fats" }
    ],
    feedingSchedule: [
      { time: "Breakfast", meal: "Whole grain + protein + fruit" },
      { time: "Morning snack", meal: "Fruit or vegetable with protein source" },
      { time: "Lunch", meal: "Balanced meal with protein, grain, fruit, vegetable" },
      { time: "After-school snack", meal: "Yogurt, nuts, or whole grain with fruit" },
      { time: "Dinner", meal: "Protein + vegetables + whole grain + dairy" }
    ],
    nutritionalNeeds: {
      "Calories": { value: "1400-1800", unit: "daily (varies by activity level)", sources: ["Balanced diet"] },
      "Protein": { value: "19-34", unit: "g daily", sources: ["Meat, fish, dairy, beans, nuts"] },
      "Calcium": { value: "1000", unit: "mg daily", sources: ["Dairy products, fortified foods, leafy greens"] },
      "Iron": { value: "10", unit: "mg daily", sources: ["Meat, beans, fortified cereals, leafy greens"] },
      "Fiber": { value: "25", unit: "g daily", sources: ["Fruits, vegetables, whole grains, beans"] }
    },
    tips: [
      "Encourage water as the primary beverage",
      "Pack nutritious lunches for school",
      "Teach children to recognize hunger and fullness cues",
      "Limit highly processed foods and encourage whole foods",
      "Make healthy snacks easily accessible",
      "Involve children in meal planning and preparation",
      "Balance nutrition with regular physical activity",
      "Be mindful of portion sizes as appetite increases"
    ]
  };
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const ageForm = document.getElementById('age-form');
  if (ageForm) {
    ageForm.addEventListener('submit', function(e) {
      e.preventDefault();
      generateAgeRecommendations();
    });
  }
});

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorContainer = document.getElementById('error-container');
  if (!errorContainer) return;
  
  errorContainer.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Clear error after 5 seconds
  setTimeout(() => {
    errorContainer.innerHTML = '';
  }, 5000);
}
