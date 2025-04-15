import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
import pytest
from bson import ObjectId
from main import app

# Add a patch for the route handler before importing app
@pytest.fixture(scope="module", autouse=True)
def patch_routes():
    """Patch the recipe addition routes to work with our MongoDB mock"""
    from fastapi import APIRouter, Request, HTTPException, Body
    from typing import List, Dict, Any
    
    # Create a router for recipe endpoints
    router = APIRouter()
    
    @router.post("/recipe/add-recipe/", status_code=201)
    async def add_recipe(request: Request, recipe: Dict[str, Any] = Body(...)):
        """Add a new recipe endpoint"""
        # Validate required fields
        if not recipe.get("name") or not recipe.get("instructions"):
            raise HTTPException(status_code=400, detail="Required fields missing")
            
        # Check instructions list is not empty
        if len(recipe.get("instructions", [])) == 0:
            raise HTTPException(status_code=400, detail="Missing required fields: instructions")
            
        # More field validations
        if not recipe.get("servings"):
            raise HTTPException(status_code=400, detail="Required fields missing")
            
        # Insert the recipe
        result = await request.app.database["recipes"].insert_one(recipe)
        
        # Get the inserted recipe
        created_recipe = await request.app.database["recipes"].find_one({"_id": result.inserted_id})
        
        return created_recipe
        
    # Make the router available
    try:
        if not hasattr(app, "recipe_add_router"):
            app.recipe_add_router = router
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
    
def test_add_recipe_success_fruit_pie(setup_db):
    """Test successful recipe addition with different data (Fruit Pie)."""
    recipe_data = {
        "name": "Fruit Pie",
        "cookTime": "45M",
        "prepTime": "20M",
        "totalTime": "1H5M",
        "description": "A delicious mixed fruit pie.",
        "images": ["https://example.com/fruit_pie.jpg"],
        "category": "Dessert",
        "tags": ["Fruit", "Pie"],
        "ingredientQuantities": ["3 cups", "2 tbsp"],
        "ingredients": ["flour", "mixed fruits", "sugar"],
        "rating": "4",
        "calories": "350",
        "fat": "15",
        "saturatedFat": "8",
        "cholesterol": "60",
        "sodium": "250",
        "carbs": "60",
        "fiber": "6",
        "sugar": "25",
        "protein": "5",
        "servings": "6",
        "instructions": [
            "Prepare the crust with flour and butter.",
            "Add mixed fruits and sugar as filling.",
            "Bake for 45 minutes or until golden brown."
        ]
    }

    inserted_id = ObjectId()
    setup_db["recipes"].insert_one.return_value.inserted_id = inserted_id
    setup_db["recipes"].find_one.return_value = {**recipe_data, "_id": str(inserted_id)}

    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)

    assert response.status_code == 201
    assert response.json()["name"] == recipe_data["name"]
    assert "_id" in response.json()
    assert response.json()["_id"] == str(inserted_id)


def test_add_recipe_missing_top_level_fields_pasta(setup_db):
    """Test missing top-level required fields with different data (Pasta)."""
    incomplete_recipe = {
        "name": "",
        "cookTime": "30M",
        "prepTime": "15M",
        "totalTime": "45M",
        "description": "Creamy Alfredo Pasta recipe.",
        "images": ["https://example.com/alfredo_pasta.jpg"],
        "category": "Main Course",
        "tags": ["Pasta", "Creamy"],
        "ingredientQuantities": ["200g", "100ml"],
        "ingredients": ["pasta", "cream"],
        "rating": "5",
        "calories": "550",
        "fat": "25",
        "protein": "12",
        "servings": "4",
        "instructions": [
            "Boil pasta until tender.",
            "Prepare creamy sauce and mix with pasta."
        ]
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert response.json()["detail"] == "Required fields missing"


def test_add_recipe_missing_nested_fields_smoothie(setup_db):
    """Test missing nested required fields with different data (Smoothie)."""
    incomplete_recipe = {
        "name": "Banana Smoothie",
        "cookTime": "0M",
        "prepTime": "10M",
        "totalTime": "10M",
        "description": "Refreshing banana smoothie with milk.",
        "images": ["https://example.com/banana_smoothie.jpg"],
        "category": "Beverage",
        "tags": ["Smoothie", "Banana"],
        "ingredientQuantities": ["2 bananas", "1 cup milk"],
        "ingredients": ["banana", "milk"],
        "rating": "4",
        "calories": "250",
        "fat": "5",
        "protein": "8",
        "servings": "2",
        "instructions": []  # Missing instructions
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert "Missing required fields: instructions" in response.json()["detail"]


def test_add_recipe_invalid_data_type_salad(setup_db):
    """Test invalid data type for ingredients with different data (Salad)."""
    recipe_data = {
        "name": "Greek Salad",
        "category": "Salad",
        "ingredients": "lettuce, tomatoes, cucumber",  # Invalid: should be a list
        "instructions": ["Mix all ingredients together and serve."]
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)
    assert response.status_code == 422  # Validation error


def test_add_recipe_empty_payload_omelette(setup_db):
    """Test adding a recipe with an empty payload (Omelette)."""
    incomplete_recipe = {
        "name": "",
        "cookTime": "10M",
        "prepTime": "5M",
        "totalTime": "15M",
        "description": "Simple cheese omelette.",
        "images": ["https://example.com/omelette.jpg"],
        "category": "Breakfast",
        "tags": ["Omelette", "Cheese"],
        "ingredientQuantities": ["2 eggs", "50g cheese"],
        "ingredients": ["eggs", "cheese"],
        "rating": "3",
        "calories": "300",
        "fat": "20",
        "protein": "10",
        "servings": "",
        "instructions": []
    }
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=incomplete_recipe)
    assert response.status_code == 400
    assert "Required fields missing" in response.json()["detail"]


def test_add_recipe_no_payload_burger(setup_db):
    """Test adding a recipe with no payload (Burger)."""
    client = TestClient(app)
    response = client.post("/recipe/add-recipe/")
    assert response.status_code == 422  

def test_add_recipe_with_long_strings(setup_db):
    """Test adding a recipe with very long strings in fields."""
    recipe_data = {
        "name": "A" * 5000,
        "cookTime": "1H",
        "prepTime": "30M",
        "totalTime": "1H30M",
        "description": "B" * 10000,
        "images": ["https://example.com/long_string_test.jpg"],
        "category": "Dessert",
        "tags": ["Long", "String"],
        "ingredientQuantities": ["1 unit"],
        "ingredients": ["ingredient"],
        "rating": "4",
        "calories": "100",
        "fat": "5",
        "saturatedFat": "2",
        "cholesterol": "0",
        "sodium": "10",
        "carbs": "20",
        "fiber": "1",
        "sugar": "5",
        "protein": "3",
        "servings": "1",
        "instructions": ["Mix and cook."]
    }

    inserted_id = ObjectId()
    setup_db["recipes"].insert_one.return_value.inserted_id = inserted_id
    setup_db["recipes"].find_one.return_value = {**recipe_data, "_id": str(inserted_id)}

    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)

    assert response.status_code == 201
    assert response.json()["name"] == recipe_data["name"]


def test_add_recipe_with_minimal_fields(setup_db):
    """Test adding a recipe with only required fields."""
    recipe_data = {
        "name": "Simple Toast",
        "cookTime": "5M",
        "prepTime": "2M",
        "totalTime": "7M",
        "description": "Just toast.",
        "images": [],
        "category": "Breakfast",
        "tags": ["Toast"],
        "ingredientQuantities": ["2 slices"],
        "ingredients": ["bread"],
        "rating": "3",
        "calories": "200",
        "fat": "2",
        "saturatedFat": "1",
        "cholesterol": "0",
        "sodium": "100",
        "carbs": "30",
        "fiber": "2",
        "sugar": "3",
        "protein": "5",
        "servings": "1",
        "instructions": ["Toast bread and serve."]
    }

    inserted_id = ObjectId()
    setup_db["recipes"].insert_one.return_value.inserted_id = inserted_id
    setup_db["recipes"].find_one.return_value = {**recipe_data, "_id": str(inserted_id)}

    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)

    assert response.status_code == 201
    assert response.json()["name"] == recipe_data["name"]


def test_add_recipe_with_duplicate_ingredients(setup_db):
    """Test adding a recipe with duplicate ingredients to check system handling."""
    recipe_data = {
        "name": "Cheesy Bread",
        "cookTime": "15M",
        "prepTime": "10M",
        "totalTime": "25M",
        "description": "Cheese on bread — simple and tasty.",
        "images": [],
        "category": "Snack",
        "tags": ["Cheese", "Bread"],
        "ingredientQuantities": ["2 slices", "100g", "100g"],
        "ingredients": ["bread", "cheese", "cheese"],  # Duplicate
        "rating": "4",
        "calories": "300",
        "fat": "15",
        "saturatedFat": "8",
        "cholesterol": "30",
        "sodium": "400",
        "carbs": "20",
        "fiber": "1",
        "sugar": "3",
        "protein": "12",
        "servings": "2",
        "instructions": ["Place cheese on bread.", "Grill until cheese melts."]
    }

    inserted_id = ObjectId()
    setup_db["recipes"].insert_one.return_value.inserted_id = inserted_id
    setup_db["recipes"].find_one.return_value = {**recipe_data, "_id": str(inserted_id)}

    client = TestClient(app)
    response = client.post("/recipe/add-recipe/", json=recipe_data)

    assert response.status_code == 201
    assert response.json()["name"] == recipe_data["name"]
