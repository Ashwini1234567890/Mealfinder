
// Meal Finder JavaScript


// API URLs
const CATEGORY_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const MEAL_DETAIL_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

// Select elements
const hamLogo = document.querySelector(".hamlogo");
const searchInput = document.querySelector(".search input");
const searchIcon = document.querySelector(".search i");
const listContainer = document.querySelector(".list");
//  Create Dropdown Menu

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

//  Load Categories into Dropdown

async function loadCategories() {
  const res = await fetch(CATEGORY_API);
  const data = await res.json();
  allCategories = data.categories;

  const ul = dropdown.querySelector(".dropdown-list");
  ul.innerHTML = "";

  // Create list items for dropdown
  allCategories.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat.strCategory;
    li.addEventListener("click", async () => {
      dropdown.classList.remove("show");
      await showCategoryMeals(cat.strCategory);
    });
    ul.appendChild(li);
  });

  // Attach click event to category cards on home
  document.querySelectorAll(".listimage").forEach(card => {
    card.addEventListener("click", async () => {
      const catName = card.querySelector(".food").textContent.trim();
      await showCategoryMeals(catName);
    });
  });
}


//  Show Meals by Category

async function showCategoryMeals(categoryName) {
  document.querySelector(".section-title").textContent = categoryName.toUpperCase();

  //  Get the description for the selected category
  let categoryDescription = "";
  if (allCategories.length > 0) {
    const selectedCat = allCategories.find(
      cat => cat.strCategory.toLowerCase() === categoryName.toLowerCase()
    );
    if (selectedCat) categoryDescription = selectedCat.strCategoryDescription;
  } else {
    // Fallback in case categories not yet loaded
    const resCat = await fetch(CATEGORY_API);
    const dataCat = await resCat.json();
    const selectedCat = dataCat.categories.find(
      cat => cat.strCategory.toLowerCase() === categoryName.toLowerCase()
    );
    if (selectedCat) categoryDescription = selectedCat.strCategoryDescription;
  }

  //  Fetch meals for that category
  const res = await fetch(FILTER_API + categoryName);
  const data = await res.json();
  const meals = data.meals;

  // Display category description
  listContainer.innerHTML = `
    <div class="category-description">
      <h2>${categoryName}</h2>
      <p>${categoryDescription || `Explore delicious ${categoryName} dishes below!`}</p>
    </div>
    <div class="meals-grid"></div>
  `;

  const grid = listContainer.querySelector(".meals-grid");

  // Render meal cards
  meals.forEach(meal => {
    const div = document.createElement("div");
    div.classList.add("listimage");
    div.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <p class="food">${meal.strMeal}</p>
    `;
    div.addEventListener("click", () => showMealDetails(meal.idMeal)); 
    grid.appendChild(div);
  });
}


//  Search Meals

async function fetchMealsBySearch(query) {
  const res = await fetch(SEARCH_API + query);
  const data = await res.json();
  if (data.meals) {
    displayMeals(data.meals, `Search results for "${query}"`);
  } else {
    listContainer.innerHTML = `<p style="margin-left:70px; font-size:1.2rem;">No meals found for "${query}"</p>`;
  }
}

// Display meals for search results
function displayMeals(meals, titleText) {
  document.querySelector(".section-title").textContent = titleText.toUpperCase();
  listContainer.innerHTML = `<div class="meals-grid"></div>`;
  const grid = listContainer.querySelector(".meals-grid");

  meals.forEach(meal => {
    const div = document.createElement("div");
    div.classList.add("listimage");
    div.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <p class="food">${meal.strMeal}</p>
    `;
    div.addEventListener("click", () => showMealDetails(meal.idMeal));
    grid.appendChild(div);
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

// Load categories on start
loadCategories();


// Fetch Meal Details by ID

async function showMealDetails(mealId) {
  const res = await fetch(MEAL_DETAIL_API + mealId);
  const data = await res.json();
  const meal = data.meals[0];

  listContainer.innerHTML = `
    <div class="meal-details-final">
      <div class="meal-top">
        <!-- Left side: Meal Image -->
        <div class="meal-img-box">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        </div>

        <!-- Right side: Info + Ingredients -->
        <div class="meal-info-box">
          <h2>${meal.strMeal}</h2>
          <p><strong>Category:</strong> <span>${meal.strCategory}</span></p>
          ${
            meal.strSource
              ? `<p><strong>Source:</strong> <a href="${meal.strSource}" target="_blank">${meal.strSource}</a></p>`
              : ""
          }
          ${
            meal.strTags
              ? `<p><strong>Tags:</strong> <span>${meal.strTags}</span></p>`
              : ""
          }

          <div class="ingredients-orange-box">
            <h3>Ingredients</h3>
            <div class="ingredient-grid">
              ${getIngredients(meal)
                .map(
                  (i, index) =>
                    `<span><span class="ingredient-number">${
                      index + 1
                    }</span> ${i}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Measure Section -->
      <div class="measure-box">
        <h3>Measure:</h3>
        <div class="measure-grid">
          ${getMeasures(meal)
            .map((m) => `<p>🥄 ${m}</p>`)
            .join("")}
        </div>
      </div>

      <!-- Instructions Section -->
      <div class="instructions-box">
        <h3>Instructions:</h3>
        <ul class="instruction-list">
          ${formatInstructions(meal.strInstructions)}
        </ul>
      </div>

      ${
        meal.strYoutube
          ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link">▶ Watch on YouTube</a>`
          : ""
      }
      <button class="back-btn">⬅ Back to ${meal.strCategory}</button>
    </div>
  `;

  document.querySelector(".back-btn").addEventListener("click", async () => {
    await showCategoryMeals(meal.strCategory);
  });
}

// Helper Functions

function getIngredients(meal) {
  let ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && ing.trim()) ingredients.push(ing);
  }
  return ingredients;
}

function getMeasures(meal) {
  let measures = [];
  for (let i = 1; i <= 20; i++) {
    const measure = meal[`strMeasure${i}`];
    if (measure && measure.trim()) measures.push(measure);
  }
  return measures;
}

// Format instructions nicely
function formatInstructions(instructions) {
  if (!instructions) return "";
  const steps = instructions.split(/\r?\n|\.\s+/).filter(step => step.trim() !== "");
  return steps.map(step => `<li>✅ ${step.trim()}</li>`).join("");
}
