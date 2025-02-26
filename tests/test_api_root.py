import sys
import os
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


def full_recipe_mock(object_id):
    """Return a full recipe matching the Recipe model exactly."""
    return {
        "_id": str(object_id),  # ✅ Ensured it's a string, not ObjectId
        "name": "Chocolate Cake",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "Delicious chocolate cake.",
        "images": ["https://example.com/cake.jpg"],
        "category": "Dessert",
        "tags": ["chocolate", "cake"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ["flour", "sugar", "chocolate"],
        "rating": "5",
        "calories": "450",
        "fat": "20",
        "sugar": "30",
        "protein": "6",
        "servings": "8",
        "instructions": ["Mix ingredients", "Bake for 30 minutes"]
    }


def test_list_recipes_success(setup_db):
    """Test retrieving a list of recipes successfully with full model."""
    mocked_recipes = [full_recipe_mock(ObjectId()), full_recipe_mock(ObjectId())]

    # Properly mock the cursor with limit()
    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock  # Chain limit() call
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/")

    expected = [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes]

    assert response.status_code == 200



def test_find_recipe_success(setup_db):
    """Test retrieving a specific recipe by ID successfully (full model)."""
    object_id = ObjectId()
    mocked_recipe = full_recipe_mock(object_id)

    setup_db["recipes"].find_one.return_value = mocked_recipe

    client = TestClient(app)
    response = client.get(f"/recipe/{str(object_id)}")

    expected_recipe = {**mocked_recipe, "_id": str(object_id)}

    assert response.status_code == 200


def test_find_recipe_invalid_id(setup_db):
    """Test retrieving a recipe with an invalid ID format."""
    invalid_id = "invalid_id_string"
    client = TestClient(app)
    response = client.get(f"/recipe/{invalid_id}")

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid ID format"

    


def test_find_recipe_not_found(setup_db):
    """Test retrieving a recipe by ID that doesn't exist."""
    object_id = ObjectId()
    setup_db["recipes"].find_one.return_value = None

    client = TestClient(app)
    response = client.get(f"/recipe/{str(object_id)}")

    assert response.status_code == 404
    