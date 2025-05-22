/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Search Functionality JavaScript File
 */

// Initialize search functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeSearch();
});

/**
 * Initialize search functionality
 */
function initializeSearch() {
  const searchInput = document.getElementById("food-search");
  const clearSearchBtn = document.getElementById("clear-search");
  const filterCarbs = document.getElementById("filter-carbohydrates");
  const filterProteins = document.getElementById("filter-proteins");
  const filterVitamins = document.getElementById("filter-vitamins");
  const filterFats = document.getElementById("filter-fats");

  if (!searchInput || !clearSearchBtn) return;

  // Add event listeners
  searchInput.addEventListener("input", performSearch);
  clearSearchBtn.addEventListener("click", clearSearch);

  // Add event listeners to category filters
  if (filterCarbs) filterCarbs.addEventListener("change", performSearch);
  if (filterProteins) filterProteins.addEventListener("change", performSearch);
  if (filterVitamins) filterVitamins.addEventListener("change", performSearch);
  if (filterFats) filterFats.addEventListener("change", performSearch);
}

/**
 * Perform search based on input and filters
 */
function performSearch() {
  const searchInput = document.getElementById("food-search");
  const clearSearchBtn = document.getElementById("clear-search");
  const foodSelection = document.getElementById("food-selection");

  if (!searchInput || !foodSelection) return;

  const searchTerm = searchInput.value.trim().toLowerCase();

  // Show/hide clear button based on search term
  if (searchTerm.length > 0) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }

  // Get active filters
  const activeFilters = getActiveFilters();

  // Get all food items
  const foodItems = foodSelection.querySelectorAll(".food-item");
  let matchCount = 0;

  // Remove existing no-results message if it exists
  const existingNoResults = foodSelection.querySelector(".no-results");
  if (existingNoResults) {
    existingNoResults.remove();
  }

  // Loop through all food items
  foodItems.forEach((item) => {
    // Remove previous search classes
    item.classList.remove("search-match", "search-hidden");

    // Get food name and category
    const foodName = item.querySelector("label").textContent.toLowerCase();
    const foodCategory = item.dataset.category;

    // Check if food matches search term and active filters
    const matchesSearch = searchTerm === "" || foodName.includes(searchTerm);
    const matchesFilter =
      activeFilters.length === 0 || activeFilters.includes(foodCategory);

    if (matchesSearch && matchesFilter) {
      // Show item and highlight if search term is not empty
      if (searchTerm !== "") {
        item.classList.add("search-match");
      }
      matchCount++;
    } else {
      // Hide item
      item.classList.add("search-hidden");
    }
  });

  // Show message if no results
  if (matchCount === 0 && (searchTerm !== "" || activeFilters.length > 0)) {
    const noResults = document.createElement("div");
    noResults.className = "no-results";

    if (searchTerm !== "" && activeFilters.length > 0) {
      noResults.innerHTML = `
        <i class="fas fa-search"></i>
        <p>No foods found matching "${searchTerm}" in the selected categories.</p>
        <p>Try a different search term or select more categories.</p>
      `;
    } else if (searchTerm !== "") {
      noResults.innerHTML = `
        <i class="fas fa-search"></i>
        <p>No foods found matching "${searchTerm}".</p>
        <p>Try a different search term.</p>
      `;
    } else {
      noResults.innerHTML = `
        <i class="fas fa-filter"></i>
        <p>No foods found in the selected categories.</p>
        <p>Please select at least one category.</p>
      `;
    }

    foodSelection.appendChild(noResults);
  }

  // Update category sections visibility
  updateCategorySectionsVisibility();
}

/**
 * Clear search input and reset filters
 */
function clearSearch() {
  const searchInput = document.getElementById("food-search");
  const clearSearchBtn = document.getElementById("clear-search");
  const filterCarbs = document.getElementById("filter-carbohydrates");
  const filterProteins = document.getElementById("filter-proteins");
  const filterVitamins = document.getElementById("filter-vitamins");
  const filterFats = document.getElementById("filter-fats");

  if (!searchInput || !clearSearchBtn) return;

  // Clear search input
  searchInput.value = "";
  clearSearchBtn.classList.add("hidden");

  // Reset filters
  if (filterCarbs) filterCarbs.checked = true;
  if (filterProteins) filterProteins.checked = true;
  if (filterVitamins) filterVitamins.checked = true;
  if (filterFats) filterFats.checked = true;

  // Perform search to reset visibility
  performSearch();

  // Focus on search input
  searchInput.focus();
}

/**
 * Get active category filters
 * @returns {Array} Array of active category filters
 */
function getActiveFilters() {
  const activeFilters = [];

  const filterCarbs = document.getElementById("filter-carbohydrates");
  const filterProteins = document.getElementById("filter-proteins");
  const filterVitamins = document.getElementById("filter-vitamins");
  const filterFats = document.getElementById("filter-fats");

  if (filterCarbs && filterCarbs.checked) activeFilters.push("carbohydrates");
  if (filterProteins && filterProteins.checked) activeFilters.push("proteins");
  if (filterVitamins && filterVitamins.checked) activeFilters.push("vitamins");
  if (filterFats && filterFats.checked) activeFilters.push("fats");

  return activeFilters;
}

/**
 * Update category sections visibility based on search results
 * Note: This function is now simplified since we no longer have category sections
 */
function updateCategorySectionsVisibility() {
  // This function is now a no-op since we don't have category sections anymore
  // But we keep it for compatibility with the existing code
  return;
}
