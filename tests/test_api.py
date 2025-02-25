import requests
import pytest
import time

BASE_URL = "http://localhost:8000/recipe"

def test_list_recipes():
    """Test retrieving a list of recipes."""
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_find_recipe():
    """Test finding a recipe by ID."""
    recipe_id = 46  
    response = requests.get(f"{BASE_URL}/{recipe_id}")
    assert response.status_code == 200
    assert "name" in response.json()

def test_list_recipes_by_ingredient():
    """Test listing recipes by ingredient."""
    ingredient = "tomato"
    response = requests.get(f"{BASE_URL}/search/{ingredient}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_recipes_by_ingredients():
    """Test listing recipes by multiple ingredients."""
    data = {
        "ingredients": ["tomato", "basil"],
        "page": 1
    }
    response = requests.post(f"{BASE_URL}/search/", json=data)
    assert response.status_code == 200
    assert "recipes" in response.json()

def test_list_recipes_by_non_existent_ingredient():
    """Test listing recipes by a non-existent ingredient."""
    ingredient = "unicorn"
    response = requests.get(f"{BASE_URL}/search/{ingredient}")
    assert response.status_code == 200
    assert response.json() == []

def test_list_recipes_by_empty_ingredients():
    """Test listing recipes with an empty ingredients list."""
    data = {
        "ingredients": [],
        "page": 1
    }
    response = requests.post(f"{BASE_URL}/search/", json=data)
    assert response.status_code == 200

def test_list_ingredients():
    """Test listing ingredient suggestions."""
    query_string = "to"
    response = requests.get(f"{BASE_URL}/ingredients/{query_string}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_ingredients_no_matches():
    """Test listing ingredient suggestions with no matches."""
    query_string = "xyz"
    response = requests.get(f"{BASE_URL}/ingredients/{query_string}")
    assert response.status_code == 200
    assert response.json() == []

def test_recommend_recipes():
    """Test recommending recipes based on a query."""
    query_data = {
        "query": "easy pasta recipes"
    }
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json=query_data)
    assert response.status_code == 200
    assert "response" in response.json()

def test_recommend_recipes_with_empty_query():
    """Test recommending recipes with an empty query."""
    query_data = {
        "query": ""
    }
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json=query_data)
    assert response.status_code == 400
    assert "detail" in response.json()

def test_response_time_for_list_recipes():
    """Test the response time for listing recipes."""
    response = requests.get(f"{BASE_URL}/")
    assert response.elapsed.total_seconds() < 1

def test_find_recipe_with_query_params():
    """Test retrieving a recipe with query parameters."""
    recipe_id = 46
    response = requests.get(f"{BASE_URL}/{recipe_id}?include_nutrition=true")
    assert response.status_code == 200
    data = response.json()
    assert "calories" in data

def test_list_recipes_with_pagination():
    """Test retrieving a paginated list of recipes."""
    page = 1
    response = requests.get(f"{BASE_URL}/?page={page}")
    assert response.status_code == 200

def test_list_recipes_with_invalid_page():
    """Test retrieving recipes with an invalid page number."""
    page = -1
    response = requests.get(f"{BASE_URL}/?page={page}")
    assert response.status_code == 200

def test_find_recipe_invalid_id_format():
    response = requests.get(f"{BASE_URL}/invalid-id")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_find_recipe_non_existent_id():
    non_existent_id = "000000000000000000000000"
    response = requests.get(f"{BASE_URL}/{non_existent_id}")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_list_recipes_by_ingredient_special_characters():
    ingredient = "@$%^&*"
    response = requests.get(f"{BASE_URL}/search/{ingredient}")
    assert response.status_code == 200

def test_list_recipes_by_multiple_criteria():
    """Test searching recipes with various nutritional limits."""
    data = {
        "page": 1,
        "caloriesUp": 500.0,
        "fatUp": 30.0,
        "sugUp": 20.0,
        "proUp": 25.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 200
    response_data = response.json()
    assert "recipes" in response_data
    assert isinstance(response_data["recipes"], list)

def test_list_recipes_by_invalid_page():
    """Test for invalid page number (less than 1)."""
    data = {
        "page": 0,
        "caloriesUp": 500.0,
        "fatUp": 30.0,
        "sugUp": 20.0,
        "proUp": 25.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 422

def test_list_recipes_by_high_calories():
    """Test for calories upper limit exceeding allowed range."""
    data = {
        "page": 1,
        "caloriesUp": 1500.0,
        "fatUp": 30.0,
        "sugUp": 20.0,
        "proUp": 25.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 422

def test_list_recipes_by_high_fat():
    """Test for fat upper limit exceeding allowed range."""
    data = {
        "page": 1,
        "caloriesUp": 500.0,
        "fatUp": 200.0,
        "sugUp": 20.0,
        "proUp": 25.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 422

def test_list_recipes_by_zero_limits():
    """Test for edge case where all limits are at the minimum."""
    data = {
        "page": 1,
        "caloriesUp": 0.0,
        "fatUp": 0.0,
        "sugUp": 0.0,
        "proUp": 0.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 200
    response_data = response.json()
    assert "recipes" in response_data
    assert isinstance(response_data["recipes"], list)

def test_list_recipes_by_nonexistent_page():
    """Test for a page that does not exist (assuming less than 100 pages)."""
    data = {
        "page": 100,
        "caloriesUp": 500.0,
        "fatUp": 30.0,
        "sugUp": 20.0,
        "proUp": 25.0
    }
    response = requests.post(f"{BASE_URL}/search2/", json=data)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["recipes"] == []

def test_recipe_nutritional_count():
    """Test retrieving the nutritional count of a recipe."""
    recipe_id = 46
    response = requests.get(f"{BASE_URL}/{recipe_id}/nutrition")
    assert response.status_code == 200
    data = response.json()
    assert "calories" in data
    assert "fat" in data
    assert "sugar" in data
    assert "protein" in data

def test_recipe_nutritional_count_invalid_id():
    """Test retrieving the nutritional count of a recipe with an invalid ID."""
    invalid_recipe_id = "invalid-id"
    response = requests.get(f"{BASE_URL}/{invalid_recipe_id}/nutrition")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_recipe_nutritional_count_non_existent_id():
    """Test retrieving the nutritional count of a non-existent recipe."""
    non_existent_id = "000000000000000000000000"
    response = requests.get(f"{BASE_URL}/{non_existent_id}/nutrition")
    assert response.status_code == 404
    assert "detail" in response.json()



def test_get_recipe_by_invalid_id():
    """Test retrieving a recipe by an invalid ID."""
    invalid_id = 99999  # Assuming this ID doesn't exist
    response = requests.get(f"{BASE_URL}/recipes/{invalid_id}/")
    assert response.status_code == 404


def test_update_recipe_invalid_id():
    """Test updating a recipe with an invalid ID."""
    invalid_id = 99999  # Assuming this ID doesn't exist
    updated_data = {
        "name": "Should Not Work"
    }
    response = requests.put(f"{BASE_URL}/recipes/{invalid_id}/", json=updated_data)
    assert response.status_code == 404

def test_delete_recipe_invalid_id():
    """Test deleting a recipe with an invalid ID."""
    invalid_id = 99999  # Assuming this ID doesn't exist
    response = requests.delete(f"{BASE_URL}/recipes/{invalid_id}/")
    assert response.status_code == 404

def test_valid_query_and_context():
    """Test with both valid query and context."""
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json={
        "query": "What are some quick breakfast options?",
        "context": "Looking for vegetarian options."
    })
    assert response.status_code == 200
    assert "response" in response.json()

def test_valid_query_invalid_context():
    """Test with valid query and invalid context."""
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json={
        "query": "What are some quick breakfast options?",
        "context": ""  # empty context is invalid
    })
    assert response.status_code == 500
    assert "detail" in response.json()

def test_invalid_query_valid_context():
    """Test with invalid query and valid context."""
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json={
        "query": "",  # empty query is invalid
        "context": "Looking for vegetarian options."
    })
    assert response.status_code == 500
    assert "detail" in response.json()

def test_invalid_query_and_context():
    """Test with both invalid query and context."""
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json={
        "query": "",
        "context": ""
    })
    assert response.status_code == 500
    assert "detail" in response.json()

@pytest.mark.parametrize("query, expected_status", [
    ("easy dinner recipes", 200),
    ("vegan breakfast options", 200),
    ("gluten-free desserts", 200),
    ("quick snacks", 200),
    ("low carb meals for dinner", 200),
    ("high protein vegan meals", 200),
    ("what can I cook with potatoes and chicken", 200),
    ("desserts with less sugar", 200),
    ("healthy smoothies", 200),
    ("Italian pasta dishes", 200),
    ("", 500),  # Empty query should ideally return a bad request or custom handled response
    (" ", 500),  # Query with just a space
    ("123456", 500),  # Numeric query, should return 500
    ("!@#$%^&*()", 500),  # Special characters, should return 500
    ("very very long query " * 10, 200),  # Long query
    ("dinner ideas without specifying ingredients", 200),
    ("non-existent cuisine recipes", 200),
    ("quick meals under 30 minutes", 200),
    ("how to make a cake", 200),
    ("recipes with chicken", 200)
])
def test_recommend_recipes(query, expected_status):
    """Test recommending recipes based on various queries."""
    response = requests.post(f"{BASE_URL}/recommend-recipes/", json={"query": query})
    assert response.status_code == expected_status, f"Failed for query: {query}"
    time.sleep(1)  # Pause for 1 second between each test case to avoid rate limiting from groq

# Test for saving a meal plan
def test_save_meal_plan():
    entry = {
        "day": 1,
        "recipe": {
            "name": "Pasta Primavera",
            "instructions": "Boil pasta, add veggies, mix with sauce."
        }
    }
    response = requests.post(f"{BASE_URL}/meal-plan/", json=entry)
    assert response.status_code == 200
    assert "message" in response.json()
    assert response.json()["message"] == "Meal plan saved successfully."
# Test for retrieving the meal plan
def test_get_meal_plan():
    response = requests.get(f"{BASE_URL}/meal-plan/")
    assert response.status_code == 200
    meal_plan = response.json()
    assert isinstance(meal_plan, list)
    assert len(meal_plan) == 7
    assert any(entry["recipe"] is not None for entry in meal_plan)

def test_add_new_recipe():
    """Test to add new recipe"""
    recipe_data = {
        "name": "Test Test",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A delicious and moist chocolate cake recipe.",
        "images": [
            "https://example.com/chocolate_cake.jpg"
        ],
        "category": "Dessert",
        "tags": ["Chocolate", "Cake", "Dessert"],
        "ingredientQuantities": ["2 cups", "1 cup", "3", "1/2 cup"],
        "ingredients": ["flour", "sugar", "eggs", "cocoa powder"],
        "rating": "5",
        "calories": "450",
        "fat": "20",
        "saturatedFat": "10",
        "cholesterol": "80",
        "sodium": "300",
        "carbs": "50",
        "fiber": "5",
        "sugar": "30",
        "protein": "6",
        "servings": "8",
        "instructions": [
            "Preheat oven to 350°F (175°C).",
            "Mix dry ingredients together.",
            "Add wet ingredients and mix until smooth.",
            "Bake for 30 minutes or until a toothpick comes out clean."
        ]
    }
    
    response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    assert response.status_code == 201
    response_data = response.json()
    recipe_id = response_data.get("_id")
    
    assert "name" in response_data
    assert response_data["name"] == recipe_data["name"]
    assert "id" in response_data or "_id" in response_data
    
    delete_response = requests.delete(f"{BASE_URL}/delete-recipe/{recipe_id}")
    assert delete_response.status_code == 200
    
def test_search_recipe_by_name_exact():
    """Test searching for a recipe by exact name (case & whitespace insensitive)."""
    search_name = "bestchocolatecake"  # after trimming spaces and lowering case
    response = requests.get(f"{BASE_URL}/search-name/{search_name}")
    assert response.status_code == 200
    recipes = response.json()
    assert isinstance(recipes, list)
    assert any(
        recipe["name"].replace(" ", "").lower() == search_name for recipe in recipes
    )


def test_search_recipe_by_name_case_insensitive():
    """Test searching for a recipe with different casing and extra spaces."""
    search_name = "  BeSt   ChoCoLaTe  CaKe  "  # mixed case with extra spaces
    processed_search = search_name.lower().replace(" ", "")
    response = requests.get(f"{BASE_URL}/search-name/{processed_search}")
    assert response.status_code == 200
    recipes = response.json()
    assert isinstance(recipes, list)
    assert any(
        recipe["name"].replace(" ", "").lower() == processed_search for recipe in recipes
    )
    
def test_search_recipe_by_name_not_found():
    """Test searching for a non-existent recipe by name."""
    search_name = "nonexistentrecipe"
    response = requests.get(f"{BASE_URL}/search-name/{search_name}")
    assert response.status_code == 500
    assert "detail" in response.json()
    assert response.json()["detail"] == f"An error occurred while searching for the recipe."


def test_search_recipe_by_name_special_characters():
    """Test searching for a recipe with special characters (should not match)."""
    search_name = "!@#$%^&*()_+"
    response = requests.get(f"{BASE_URL}/search-name/{search_name}")
    assert response.status_code == 500
    assert "detail" in response.json()
    
def test_delete_recipe_valid_id():
    """Test deleting a recipe with a valid ID"""
    new_recipe = {
        "name": "Test Recipe for Deletion",
        "cookTime": "20M",
        "prepTime": "10M",
        "totalTime": "30M",
        "description": "Temporary recipe for deletion test.",
        "images": [],
        "category": "Test",
        "tags": ["Test"],
        "ingredientQuantities": ["1", "2"],
        "ingredients": ["test ingredient 1", "test ingredient 2"],
        "rating": "5",
        "calories": "100",
        "fat": "1",
        "saturatedFat": "0.5",
        "cholesterol": "0",
        "sodium": "10",
        "carbs": "20",
        "fiber": "1",
        "sugar": "5",
        "protein": "2",
        "servings": "1",
        "instructions": ["Step 1", "Step 2"]
    }
    
    # Add the recipe 
    add_response = requests.post(f"{BASE_URL}/add-recipe/", json=new_recipe)
    assert add_response.status_code == 201
    recipe_id = add_response.json().get("_id")
    
    # Delete the recipe 
    delete_response = requests.delete(f"{BASE_URL}/delete-recipe/{recipe_id}")
    assert delete_response.status_code == 200
    assert "message" in delete_response.json()
    
    # Verify deletion 
    verify_response = requests.get(f"{BASE_URL}/{recipe_id}")
    assert verify_response.status_code == 404

def test_delete_recipe_invalid_id():
    """Test deleting a recipe with a non-existent ID."""
    non_existent_id = "00000000-0000-0000-0000-000000000000"
    response = requests.delete(f"{BASE_URL}/delete-recipe/{non_existent_id}")
    assert response.status_code == 500
    assert "detail" in response.json()

"""
This is where Meseker's tests start 
"""

def test_search2_valid_input():
    """ Test searching for recipes within a calorie range."""
    response = requests.get(f"{BASE_URL}/search2/chicken,200,500")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search2_invalid_calorie_range():
    """ Test searching for recipes with an invalid calorie range."""
    response = requests.get(f"{BASE_URL}/search2/chicken,500,200")
    assert response.status_code == 400  # Assuming the API validates calorie range

def test_search2_missing_ingredient():
    """ Test searching for recipes with a missing ingredient."""
    response = requests.get(f"{BASE_URL}/search2/,100,300")
    assert response.status_code == 400  # Assuming ingredient is required

def test_search2_out_of_bounds_calories():
    """ Test searching for recipes with out-of-bounds calorie values."""
    response = requests.get(f"{BASE_URL}/search2/beef,-50,1000")
    assert response.status_code == 400

def test_search2_non_existent_ingredient():
    """ Test searching for recipes with a non-existent ingredient."""
    response = requests.get(f"{BASE_URL}/search2/unicorn,100,300")
    assert response.status_code == 200
    assert response.json() == []

def test_search_name_valid():
    response = requests.get(f"{BASE_URL}/search-name/Spaghetti%20Bolognese")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_name_non_existent():
    response = requests.get(f"{BASE_URL}/search-name/Dragon%20Stew")
    assert response.status_code == 404

def test_search_name_special_characters():
    response = requests.get(f"{BASE_URL}/search-name/Pasta@123")
    assert response.status_code == 404

def test_search_name_case_insensitive():
    response = requests.get(f"{BASE_URL}/search-name/spAGhetti%20bOLOGnese")
    assert response.status_code == 200

def test_search_name_empty():
    response = requests.get(f"{BASE_URL}/search-name/")
    assert response.status_code == 400

def test_add_recipe_valid():
    recipe_data = {
        "name": "Test Recipe",
        "category": "Dessert",
        "ingredients": ["sugar", "flour"],
        "instructions": ["Mix", "Bake"]
    }
    response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    assert response.status_code == 201
    assert "name" in response.json()

def test_add_recipe_missing_fields():
    recipe_data = {"name": "Incomplete Recipe"}
    response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    assert response.status_code == 400

def test_add_recipe_duplicate():
    recipe_data = {
        "name": "Duplicate Recipe",
        "category": "Dessert",
        "ingredients": ["sugar", "flour"],
        "instructions": ["Mix", "Bake"]
    }
    # Add the recipe once
    requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    
    # Attempt to add again
    response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    assert response.status_code == 400

def test_add_recipe_invalid_data_type():
    recipe_data = {"name": "Invalid Recipe", "ingredients": "not-a-list"}
    response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    assert response.status_code == 400

def test_add_recipe_empty_payload():
    response = requests.post(f"{BASE_URL}/add-recipe/", json={})
    assert response.status_code == 400

def test_delete_recipe_valid_id():
    # Add a recipe first to get a valid ID
    recipe_data = {
        "name": "Recipe to Delete",
        "category": "Main Course",
        "ingredients": ["chicken", "spices"],
        "instructions": ["Cook chicken", "Add spices"]
    }
    
    add_response = requests.post(f"{BASE_URL}/add-recipe/", json=recipe_data)
    recipe_id = add_response.json().get("_id")

    # Delete the recipe
    delete_response = requests.delete(f"{BASE_URL}/delete-recipe/{recipe_id}")
    
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == f"Recipe with ID {recipe_id} has been deleted successfully."

def test_delete_recipe_non_existent_id():
    invalid_id = "00000000-0000-0000-0000-000000000000"
    response = requests.delete(f"{BASE_URL}/delete-recipe/{invalid_id}")
    
    assert response.status_code == 404

def test_delete_recipe_invalid_id_format():
    invalid_id = "invalid-id"
    response = requests.delete(f"{BASE_URL}/delete-recipe/{invalid_id}")
    
    assert response.status_code == 400

def test_delete_recipe_unauthorized():
   # Assuming authentication is required for deletion
   invalid_token_headers = {"Authorization": "Bearer invalid-token"}
   recipe_id = "valid-id"
   delete_response = requests.delete(
       f"{BASE_URL}/delete-recipe/{recipe_id}", headers=invalid_token_headers)
   
   assert delete_response.status_code == 403

def test_stress_test_search_routes():
   ingredients_list = [f"ingredient_{i}" for i in range(100)]
   data = {"ingredients": ingredients_list, "page": 1}
   
   # Stress testing /search/
   search_response = requests.post(f"{BASE_URL}/search/", json=data)
   assert search_response.status_code == 200
   
   # Stress testing /search2/
   data.update({"caloriesUp": 1000, "fatUp": 50, "sugUp": 30, "proUp": 20})
   search2_response = requests.post(f"{BASE_URL}/search2/", json=data)
   assert search2_response.status_code == 200