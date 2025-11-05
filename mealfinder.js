// API URLs
const CATEGORY_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

const hamLogo = document.querySelector(".hamlogo");
const searchInput = document.querySelector(".search input");
const searchIcon = document.querySelector(".search i");
const listContainer = document.querySelector(".list");

// Create dropdown container
const dropdown = document.createElement("div");
dropdown.classList.add("dropdown-menu");
dropdown.innerHTML = `
  <div class="close-btn">&times;</div>
  <ul class="dropdown-list"></ul>
`;
document.body.appendChild(dropdown);

// Toggle dropdown
hamLogo.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

// Close dropdown
dropdown.querySelector(".close-btn").addEventListener("click", () => {
  dropdown.classList.remove("show");
});

let allCategories = [];

// Load all categories into dropdown
async function loadCategories() {
  const res = await fetch(CATEGORY_API);
  const data = await res.json();
  allCategories = data.categories;

  const ul = dropdown.querySelector(".dropdown-list");
  ul.innerHTML = "";

  allCategories.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat.strCategory;
    li.addEventListener("click", async () => {
      dropdown.classList.remove("show");
      await showCategoryWithMeals(cat);
    });
    ul.appendChild(li);
  });
}

// Show description + meals of selected category
async function showCategoryWithMeals(category) {
  document.querySelector(".section-title").textContent = category.strCategory.toUpperCase();

  // Fetch meals in that category
  const res = await fetch(FILTER_API + category.strCategory);
  const data = await res.json();
  const meals = data.meals;

  // Description at top + meals grid
  listContainer.innerHTML = `
    <div class="category-description">
      <h2>${category.strCategory}</h2>
      <p>${category.strCategoryDescription}</p>
    </div>
    <div class="meals-grid"></div>
  `;

  const grid = listContainer.querySelector(".meals-grid");

  meals.forEach(meal => {
    const div = document.createElement("div");
    div.classList.add("listimage");
    div.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <p class="food">${meal.strMeal}</p>
    `;
    grid.appendChild(div);
  });
}

// Search for meals
async function fetchMealsBySearch(query) {
  const res = await fetch(SEARCH_API + query);
  const data = await res.json();
  if (data.meals) {
    displayMeals(data.meals, `Search results for "${query}"`);
  } else {
    listContainer.innerHTML = `<p style="margin-left:70px; font-size:1.2rem;">No meals found for "${query}"</p>`;
  }
}

// Display meals for search
function displayMeals(meals, titleText) {
  document.querySelector(".section-title").textContent = titleText.toUpperCase();
  listContainer.innerHTML = "";
  meals.forEach(meal => {
    const div = document.createElement("div");
    div.classList.add("listimage");
    div.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <p class="food">${meal.strMeal}</p>
    `;
    listContainer.appendChild(div);
  });
}

// Search events
searchIcon.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchMealsBySearch(query);
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchMealsBySearch(query);
  }
});

// Load categories
loadCategories();
