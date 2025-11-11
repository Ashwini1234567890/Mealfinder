
    const CATEGORY_API = "https://www.themealdb.com/api/json/v1/1/categories.php";
    const FILTER_API = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
    const SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    const MEAL_DETAIL_API = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

    const listContainer = document.getElementById("listContainer");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const menuButton = document.getElementById("menuButton");
    const closeMenu = document.getElementById("closeMenu");
    const menuList = document.getElementById("menuList");
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.getElementById("searchIcon");

    let allCategories = [];

    // Toggle dropdown
    menuButton.addEventListener("click", () => dropdownMenu.classList.toggle("right-0"));
    closeMenu.addEventListener("click", () => dropdownMenu.classList.remove("right-0"));

    // Load all categories
    async function loadCategories() {
      const res = await fetch(CATEGORY_API);
      const data = await res.json();
      allCategories = data.categories;

      listContainer.innerHTML = "";
      menuList.innerHTML = "";

      allCategories.forEach(cat => {
        listContainer.innerHTML += `
          <div class="relative bg-white rounded-xl shadow-md text-center p-3 hover:scale-105 transition cursor-pointer w-[200px]"
            onclick="showCategoryMeals('${cat.strCategory}')">
            <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="rounded-lg w-full h-[150px] object-cover mb-2">
            <p class="absolute top-[-10px] right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">${cat.strCategory}</p>
          </div>`;

        menuList.innerHTML += `
          <li class="hover:bg-orange-100 px-2 py-1 cursor-pointer rounded"
              onclick="showCategoryMeals('${cat.strCategory}'); dropdownMenu.classList.remove('right-0');">
              ${cat.strCategory}
          </li>`;
      });
    }

    // Show category meals
    async function showCategoryMeals(categoryName) {
      const res = await fetch(FILTER_API + categoryName);
      const data = await res.json();
      const meals = data.meals;

      listContainer.innerHTML = `
        <div class="text-center w-full">
          <h2 class="text-2xl text-orange-500 font-semibold mb-2">${categoryName}</h2>
          <p class="bg-gray-100 rounded-lg inline-block px-6 py-3 text-gray-700 mb-5">
            Explore delicious ${categoryName} dishes below!
          </p>
        </div>
        <div id="mealsGrid" class="flex flex-wrap justify-center gap-6"></div>`;

      const grid = document.getElementById("mealsGrid");
      meals.forEach(meal => {
        grid.innerHTML += `
          <div class="relative bg-white rounded-xl shadow-lg hover:scale-105 transition p-3 cursor-pointer w-[200px]"
            onclick="showMealDetails('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="rounded-lg w-full h-[150px] object-cover mb-2">
            <p class="absolute top-[-8px] right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">${meal.strMeal}</p>
          </div>`;
      });
    }

    // Convert instructions to ✅ steps
    function formatInstructionSteps(text) {
      if (!text) return "";
      const steps = text.split(/\r?\n|\.\s+/).map(s => s.trim()).filter(s => s.length > 0);
      return steps.map(s => `
        <div class="flex items-start gap-2 mb-2">
          <span>✅</span>
          <p class="text-gray-700 leading-relaxed">${s}</p>
        </div>
      `).join("");
    }

    // Fetch meal details by ID
    async function showMealDetails(mealId) {
      const res = await fetch(MEAL_DETAIL_API + mealId);
      const data = await res.json();
      const meal = data.meals[0];

      listContainer.innerHTML = `
        <div class="w-[90%] mx-auto my-10 bg-white rounded-xl shadow-lg p-8">
          
          <div class="flex flex-wrap justify-center items-start gap-10">
            
            <div class="w-[350px]">
              <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-[250px] object-cover rounded-lg shadow-md">
            </div>

            <div class="flex-1 min-w-[300px]">
              <h2 class="text-2xl font-bold text-orange-500 mb-2">${meal.strMeal}</h2>
              <p class="text-gray-700 mb-2"><strong>Category:</strong> ${meal.strCategory}</p>
              ${
                meal.strTags
                  ? `<p class="text-gray-700 mb-2"><strong>Tags:</strong> <span class="text-orange-500">${meal.strTags}</span></p>`
                  : ""
              }

              <div class="bg-orange-500 text-white rounded-lg p-5 mt-5">
                <h3 class="text-lg font-semibold mb-3 border-b border-white/40 pb-1">Ingredients</h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  ${getIngredients(meal)
                    .map((i, index) => `
                      <span class="flex items-center gap-2">
                        <span class="bg-teal-500 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center">${index + 1}</span>
                        ${i}
                      </span>`)
                    .join("")}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-100 border border-gray-200 rounded-lg p-5 mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Measure:</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-gray-700">
              ${getMeasures(meal).map(m => `<p>🥄 ${m}</p>`).join("")}
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Instructions:</h3>
            ${formatInstructionSteps(meal.strInstructions)}
          </div>
        </div>
      `;
    }

    // Helpers
    function getIngredients(meal) {
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && ing.trim()) ingredients.push(ing);
      }
      return ingredients;
    }

    function getMeasures(meal) {
      const measures = [];
      for (let i = 1; i <= 20; i++) {
        const m = meal[`strMeasure${i}`];
        if (m && m.trim()) measures.push(m);
      }
      return measures;
    }

    // Search
    searchIcon.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) searchMeal(query);
    });

    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) searchMeal(query);
      }
    });

    async function searchMeal(query) {
      const res = await fetch(SEARCH_API + query);
      const data = await res.json();
      if (!data.meals) {
        listContainer.innerHTML = `<p class="text-center text-lg text-red-500">No meals found for "${query}"</p>`;
        return;
      }

      listContainer.innerHTML = `
        <div class="text-center w-full">
          <h2 class="text-2xl text-orange-500 font-semibold mb-3">Results for "${query}"</h2>
        </div>
        <div id="mealsGrid" class="flex flex-wrap justify-center gap-6"></div>`;
      const grid = document.getElementById("mealsGrid");
      data.meals.forEach(meal => {
        grid.innerHTML += `
          <div class="relative bg-white rounded-xl shadow-lg hover:scale-105 transition p-3 cursor-pointer w-[200px]"
            onclick="showMealDetails('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="rounded-lg w-full h-[150px] object-cover mb-2">
            <p class="absolute top-[-8px] right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">${meal.strMeal}</p>
          </div>`;
      });
    }

    // Load initial categories
    loadCategories();
