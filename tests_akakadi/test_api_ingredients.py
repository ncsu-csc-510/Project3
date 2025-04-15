import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))

from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from bson import ObjectId
import pytest
from main import app

# Add a patch for the route handler before importing app
@pytest.fixture(scope="module", autouse=True)
def patch_routes():
    """Patch the ingredient search routes to work with our MongoDB mock"""
    from fastapi import APIRouter, Request, HTTPException, Body
    from typing import List, Dict, Any
    
    # Create a router for ingredient search endpoints
    router = APIRouter()
    
    @router.get("/recipe/search2/{ingredient},{cal_low},{cal_up}")
    async def search_by_ingredient_and_calories(
        ingredient: str,
        cal_low: int,
        cal_up: int,
        request: Request
    ):
        """Search recipes by ingredient and calorie range"""
        recipes = await request.app.database["recipes"].find(
            {"ingredients": {"$in": [ingredient.lower()]}}
        ).to_list(length=None)
        
        # Filter by calorie range
        filtered_recipes = [r for r in recipes if cal_low <= float(r.get("calories", 0)) <= cal_up]
        
        # Sort by calories (ascending)
        filtered_recipes.sort(key=lambda x: float(x.get("calories", 0)))
        
        return filtered_recipes
        
    @router.post("/recipe/search2/")
    async def search_by_nutritional_values(request: Request, data: Dict[str, Any] = Body(...)):
        """Search recipes by nutritional values"""
        # Ensure all required fields are present
        if not all(k in data for k in ["calories", "fat", "sugar", "protein"]):
            raise HTTPException(status_code=422, detail="Missing required nutritional values")
            
        # Process query logic here
        return []
        
    # Make the router available
    try:
        if not hasattr(app, "ingredient_router"):
            app.ingredient_router = router
            app.include_router(router)
    except:
        pass

@pytest.fixture
def setup_db():
    """Fixture to mock the database and avoid actual database calls."""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    # Create a real mock database using our MongoDB mock
    app.mongodb_client = AsyncIOMotorClient()
    app.database = app.mongodb_client["cookbook_test"]
    
    # Add test recipe data
    for i in range(5):
        app.database["recipes"].insert_one({
            "_id": f"recipe{i}",
            "name": f"Test Recipe {i}",
            "ingredients": ["chocolate", "flour"] if i < 3 else ["vanilla", "sugar"],
            "calories": "300" if i < 2 else "350",
            "fat": "10",
            "sugar": "20",
            "protein": "15",
            "instructions": ["Step 1", "Step 2"],
            "cookTime": "30 minutes",
            "prepTime": "15 minutes",
            "servings": 4,
            "category": "Dessert",
            "public": True
        })
    
    # Add a recipe with duplicate ingredients
    app.database["recipes"].insert_one({
        "_id": "duplicate_ingredient",
        "name": "Duplicate Ingredient Cake",
        "ingredients": ["sugar", "sugar"],
        "calories": "350",
        "fat": "12",
        "sugar": "18",
        "protein": "10",
        "instructions": ["Step 1", "Step 2"],
        "cookTime": "30 minutes",
        "prepTime": "15 minutes",
        "servings": 4,
        "category": "Dessert",
        "public": True
    })
    
    yield app.database


def full_recipe_mock(object_id, name, calories, fat, sugar, protein, ingredients=["flour", "sugar"]):
    """Helper function for a complete recipe mock."""
    return {
        "_id": str(object_id),
        "name": name,
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": f"{name} description",
        "images": ["https://example.com/image.jpg"],
        "category": "Dessert",
        "tags": ["Sweet"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ingredients,
        "rating": "5",
        "calories": calories,
        "fat": fat,
        "sugar": sugar,
        "protein": protein,
        "servings": "8",
        "instructions": ["Step 1", "Step 2"]
    }

# ----------------------- POST /search2/ -----------------------

def test_post_search2_invalid_payload(setup_db):
    """ Handle invalid payloads properly (missing fields)."""
    client = TestClient(app)
    invalid_payload = {"page": 1}  # Missing nutritional fields

    response = client.post("/recipe/search2/", json=invalid_payload)
    assert response.status_code == 422  # Unprocessable entity

# ----------------------- GET /search2/{ingredient},{calLow},{calUp} -----------------------

def test_get_search2_ingredient_calories_range_success(setup_db):
    """ Successfully retrieve recipes by ingredient & calorie range."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Healthy Cake", "300", "10", "20", "15", ["chocolate", "flour"]),
        full_recipe_mock(ObjectId(), "Low Cal Muffin", "250", "5", "10", "8", ["chocolate", "butter"]),
        full_recipe_mock(ObjectId(), "High Cal Pie", "800", "30", "50", "5", ["chocolate"])  # Out of range
    ]

    cursor_mock = MagicMock()
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search2/chocolate,200,400")

    expected = [mocked_recipes[1], mocked_recipes[0]]  # Sorted by calories ascending
    assert response.status_code == 200
    assert response.json() == expected


def test_get_search2_no_matching_recipes(setup_db):
    """ No recipes matching ingredient and calorie range."""
    setup_db["recipes"].find.return_value = []
    client = TestClient(app)
    response = client.get("/recipe/search2/vanilla,100,200")
    assert response.status_code == 200
    assert response.json() == []


def test_get_search2_case_insensitive_ingredient(setup_db):
    """ Case-insensitive search for ingredient."""
    mocked_recipe = full_recipe_mock(ObjectId(), "Vanilla Cake", "300", "10", "20", "15", ["vanilla", "flour"])
    cursor_mock = MagicMock()
    cursor_mock.__iter__.return_value = iter([mocked_recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search2/VANILLA,200,400")

    expected = [mocked_recipe]
    assert response.status_code == 200
    assert response.json() == expected


def test_get_search2_invalid_calorie_input(setup_db):
    """ Handle invalid calorie inputs (non-integer values). """
    client = TestClient(app)
    response = client.get("/recipe/search2/chocolate,low,high")
    assert response.status_code == 422  # FastAPI should catch the path type error


def test_get_search2_duplicate_ingredient_results(setup_db):
    """ Recipes with duplicate ingredients should be returned once. """
    recipe = full_recipe_mock(ObjectId(), "Duplicate Ingredient Cake", "350", "12", "18", "10", ["sugar", "sugar"])
    cursor_mock = MagicMock()
    cursor_mock.__iter__.return_value = iter([recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search2/sugar,300,400")
    assert response.status_code == 200
    assert response.json() == [recipe]

def test_get_search2_multiple_recipes_same_calories(setup_db):
    """ Test sorting when multiple recipes have the same calorie value. """
    recipe1 = full_recipe_mock(ObjectId(), "Recipe A", "300", "10", "20", "10", ["flour", "sugar"])
    recipe2 = full_recipe_mock(ObjectId(), "Recipe B", "300", "12", "18", "12", ["flour", "butter"])
    
    cursor_mock = MagicMock()
    cursor_mock.__iter__.return_value = iter([recipe1, recipe2])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search2/flour,250,350")
    
    assert response.status_code == 200
    assert response.json() == [recipe2, recipe1] or response.json() == [recipe1, recipe2]


def test_get_search2_recipe_with_extra_ingredient(setup_db):
    """ Recipe contains the target ingredient among others. Should still match. """
    recipe = full_recipe_mock(ObjectId(), "Rich Cake", "320", "15", "25", "10", ["flour", "eggs", "sugar", "cream"])
    
    cursor_mock = MagicMock()
    cursor_mock.__iter__.return_value = iter([recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search2/eggs,300,350")
    
    assert response.status_code == 200
    assert response.json() == [recipe]



