import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from bson import ObjectId  
from main import app


@pytest.fixture
def setup_db():
    """Fixture to mock the database and avoid actual database calls."""
    app.database = MagicMock()
    app.database["recipes"].insert_one.return_value.inserted_id = ObjectId()  # Mock insert
    yield app.database

def test_add_recipe_success(setup_db):
    """Test successful recipe addition with mocked database."""
    recipe_data = {
        "name": "Chocolate Cake",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A rich chocolate cake recipe.",
        "images": ["https://example.com/chocolate_cake.jpg"],
        "category": "Dessert",
        "tags": ["Chocolate", "Cake"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ["flour", "sugar"],
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

    # Mock the find_one return value after insertion
    inserted_id = ObjectId()
    setup_db["recipes"].insert_one.return_value.inserted_id = inserted_id
    setup_db["recipes"].find_one.return_value = {**recipe_data, "_id": str(inserted_id)}

    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)

    assert response.status_code == 201
    assert response.json()["name"] == recipe_data["name"]
    assert "_id" in response.json()
    assert response.json()["_id"] == str(inserted_id)

    assert setup_db["recipes"].insert_one.called
    assert setup_db["recipes"].find_one.called

def test_add_recipe_missing_top_level_fields(setup_db):
    """Test missing top-level required fields (name)."""
    incomplete_recipe = {
        "name": "",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A rich chocolate cake recipe.",
        "images": ["https://example.com/chocolate_cake.jpg"],
        "category": "Dessert",
        "tags": ["Chocolate", "Cake"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ["flour", "sugar"],
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
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert response.json()["detail"] == "Required fields missing"


def test_add_recipe_missing_nested_fields(setup_db):
    """Test missing nested required fields like instructions."""
    incomplete_recipe = {
        "name": "Chocolate Cake",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A rich chocolate cake recipe.",
        "images": ["https://example.com/chocolate_cake.jpg"],
        "category": "Dessert",
        "tags": ["Chocolate", "Cake"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ["flour", "sugar"],
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
        "instructions": []
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert "Missing required fields: instructions" in response.json()["detail"]


def test_add_recipe_invalid_data_type(setup_db):
    """Test invalid data type for ingredients (should be a list)."""
    recipe_data = {
        "name": "Invalid Recipe",
        "category": "Dessert",
        "ingredients": "flour, sugar",  # Invalid: should be a list
        "instructions": ["Mix and bake."]
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)
    assert response.status_code == 422  # FastAPI's default for validation errors


def test_add_recipe_empty_payload(setup_db):
    """Test adding a recipe with an empty payload."""
    incomplete_recipe = {
        "name": "",
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "A rich chocolate cake recipe.",
        "images": ["https://example.com/chocolate_cake.jpg"],
        "category": "Dessert",
        "tags": ["Chocolate", "Cake"],
        "ingredientQuantities": ["2 cups", "1 cup"],
        "ingredients": ["flour", "sugar"],
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
        "servings": "",
        "instructions": []
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert "Required fields missing" in response.json()["detail"]


def test_add_recipe_no_payload(setup_db):
    """Test adding a recipe with no payload provided."""
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/")
    assert response.status_code == 422  # Validation error (Unprocessable Entity)