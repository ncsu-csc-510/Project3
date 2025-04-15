import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))

from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from bson import ObjectId
import pytest
from main import app


@pytest.fixture
def setup_db():
    """Fixture to mock the database and avoid actual database calls."""
    app.database = MagicMock()
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



