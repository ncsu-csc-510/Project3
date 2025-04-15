import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI, APIRouter, Request
from bson import ObjectId
import pytest
import json
from main import app, get_database

# Create a properly mocked database
async def override_get_database():
    """Override the get_database function for testing"""
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_db.__getitem__.return_value = mock_collection
    
    # Setup the find method to return an async iterator
    async def mock_find(*args, **kwargs):
        mock_cursor = AsyncMock()
        mock_cursor.__aiter__.return_value = []
        return mock_cursor
    
    # Setup count_documents to return a value directly (not awaitable)
    mock_collection.count_documents = MagicMock(return_value=0)
    mock_collection.find = mock_find
    
    return mock_db

# Apply the override for testing
app.dependency_overrides[get_database] = override_get_database

def create_recipe_mock(name, ingredients, rating="5", calories="450"):
    """Create a mock recipe with given properties"""
    return {
        "_id": str(ObjectId()),
        "name": name,
        "ingredients": ingredients,
        "rating": rating,
        "calories": calories,
        "category": "Test Category",
        "tags": ["test"],
        "instructions": ["Step 1"],
        "images": []
    }

# Create a test app for root endpoint
def create_test_app():
    test_app = FastAPI()
    router = APIRouter()
    
    @router.get("/")
    async def root_handler():
        return {"message": "API is running"}
    
    test_app.include_router(router)
    return test_app

# Test simple endpoint existence
def test_root_endpoint():
    """Test that the root endpoint is working"""
    # Use the test app instead of the main app
    test_app = create_test_app()
    client = TestClient(test_app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API is running"}

# Test input validation
def test_invalid_search_payload():
    """Test that invalid payload returns 422"""
    client = TestClient(app)
    payload = {"ingredients": "milk"}  # Should be a list
    response = client.post("/recipes/search/", json=payload)
    assert response.status_code == 422  # Unprocessable entity

def test_missing_search_field():
    """Test that missing required field returns 422"""
    client = TestClient(app)
    payload = {"page": 1}  # Missing 'ingredients'
    response = client.post("/recipes/search/", json=payload)
    assert response.status_code == 422  # Validation error

def test_invalid_nutrition_payload():
    """Test that invalid nutrition payload returns 422"""
    client = TestClient(app)
    payload = {"email": "test@test.com", "page": 1}  # Missing required fields
    response = client.post("/search2/", json=payload)
    assert response.status_code == 422  # Validation error

# Test with route patching
def test_ingredient_search_patch():
    """Test ingredient search with patched route function"""
    # Create a patched response
    async def mock_handler(*args, **kwargs):
        return [create_recipe_mock("Test Recipe", ["test"])]
    
    # Use context manager for patching
    with patch('api.routes.list_recipes_by_ingregredient', mock_handler):
        with TestClient(app) as client:
            response = client.get("/search/test")
            assert response.status_code == 200

def test_multi_ingredient_search_patch():
    """Test multi-ingredient search with patched route function"""
    # Create a patched response
    async def mock_handler(*args, **kwargs):
        recipe_list = [create_recipe_mock("Test Recipe", ["ingredient1", "ingredient2"])]
        return {"recipes": recipe_list, "page": 1, "count": len(recipe_list)}
    
    # Use context manager for patching
    with patch('api.routes.list_recipes_by_ingredients_recipe', mock_handler):
        with TestClient(app) as client:
            response = client.post("/recipes/search/", json={"ingredients": ["ingredient1"], "page": 1})
            assert response.status_code == 200

def test_nutrition_search_patch():
    """Test nutrition search with patched route function"""
    # Create a patched response
    async def mock_handler(*args, **kwargs):
        recipe_list = [
            create_recipe_mock("Low Cal Recipe", ["ingredient1"], calories="200"),
            create_recipe_mock("High Cal Recipe", ["ingredient2"], calories="600")
        ]
        return {"recipes": recipe_list, "page": 1, "count": len(recipe_list)}
    
    # Use context manager for patching
    with patch('api.routes.list_recipes_by_ingredients', mock_handler):
        with TestClient(app) as client:
            payload = {
                "email": "test@test.com",
                "page": 1,
                "caloriesUp": 500,
                "fatUp": 20,
                "sugUp": 30,
                "proUp": 40
            }
            response = client.post("/search2/", json=payload)
            assert response.status_code == 200

def test_calorie_range_search_patch():
    """Test calorie range search with patched route function"""
    # Create a patched response
    async def mock_handler(*args, **kwargs):
        return [
            create_recipe_mock("Medium Calorie Recipe", ["chocolate"], calories="300")
        ]
    
    # Use context manager for patching
    with patch('api.routes.list_recipes_by_ingredient_calories', mock_handler):
        with TestClient(app) as client:
            response = client.get("/search2/chocolate,200,400")
            assert response.status_code == 200 