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
    """Helper function to return a full recipe with all fields filled"""
    return {
        "_id": object_id,
        "name": "Chocolate Cake",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A rich chocolate cake recipe.",
        "images": ["https://example.com/chocolate_cake.jpg"],
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


def test_list_recipes_success(setup_db):
    """Test retrieving a list of recipes successfully with full model."""
    mocked_recipes = [full_recipe_mock(ObjectId()), full_recipe_mock(ObjectId())]
    setup_db["recipes"].find.return_value = mocked_recipes

    client = TestClient(app)
    response = client.get("/recipe/")

    expected = [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes]

    assert response.status_code == 200
    assert response.json() == expected
    setup_db["recipes"].find.assert_called_once_with(limit=10)


def test_find_recipe_success(setup_db):
    """Test retrieving a specific recipe by ID successfully (full model)."""
    object_id = ObjectId()
    mocked_recipe = full_recipe_mock(object_id)

    setup_db["recipes"].find_one.return_value = mocked_recipe

    client = TestClient(app)
    response = client.get(f"/recipe/{str(object_id)}")

    expected_recipe = {**mocked_recipe, "_id": str(object_id)}

    assert response.status_code == 200
    assert response.json() == expected_recipe
    setup_db["recipes"].find_one.assert_called_once_with({"_id": object_id})


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
    assert response.json()["detail"] == f"Recipe with ID {str(object_id)} not found"
    setup_db["recipes"].find_one.assert_called_once_with({"_id": object_id})