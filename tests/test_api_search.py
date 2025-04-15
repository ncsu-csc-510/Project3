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
    """Fixture to mock the database and cursor behavior."""
    app.database = MagicMock()
    mock_collection = MagicMock()
    app.database.__getitem__.return_value = mock_collection

    mock_cursor = MagicMock()
    mock_cursor.limit.return_value = mock_cursor
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.__iter__.return_value = iter([])

    mock_collection.find.return_value = mock_cursor
    mock_collection.count_documents.return_value = 0
    yield app.database


def full_recipe_mock(object_id, name, ingredients, rating=5):
    """Helper function to return a full recipe with all fields filled."""
    return {
        "_id": str(object_id),  # ✅ Convert ObjectId to str
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
        "rating": str(rating),
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
        "instructions": ["Step 1", "Step 2"]
    }


# ----------------------------------------------
# Test Cases for GET /search/{ingredient}
# ----------------------------------------------

def test_search_recipes_single_ingredient_success(setup_db):
    """Test retrieving recipes with a single ingredient."""
    mocked_recipes = [
        {**full_recipe_mock(ObjectId(), "Chocolate Cake", ["flour", "sugar", "chocolate"]), "_id": str(ObjectId())},
        {**full_recipe_mock(ObjectId(), "Brownie", ["sugar", "chocolate", "butter"]), "_id": str(ObjectId())}
    ]

    # Properly mock cursor iteration
    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/chocolate")

    # Ensure _id is stringified
    expected = [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes]

    assert response.status_code == 200
    assert response.json() == expected
    setup_db["recipes"].find.assert_called_once_with({"ingredients": {"$in": ["chocolate"]}})


def test_search_recipes_single_ingredient_no_match(setup_db):
    """Test when no recipes match the given ingredient."""
    setup_db["recipes"].find.return_value.__iter__.return_value = iter([])

    client = TestClient(app)
    response = client.get("/recipe/search/vanilla")

    assert response.status_code == 200
    assert response.json() == []
    setup_db["recipes"].find.assert_called_once_with({"ingredients": {"$in": ["vanilla"]}})


def test_search_recipes_case_insensitive(setup_db):
    """Test ingredient search with case insensitivity."""
    # Convert ObjectId to str to match Pydantic model expectations
    mocked_recipe = full_recipe_mock(str(ObjectId()), "Vanilla Cake", ["vanilla", "flour"])

    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter([mocked_recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/VANILLA")

    expected = [{**mocked_recipe, "_id": str(mocked_recipe["_id"])}]

    assert response.status_code == 200
    assert response.json() == expected


# ----------------------------------------------
# Test Cases for POST /search/ (Multiple Ingredients)
# ----------------------------------------------

def test_search_recipes_multiple_ingredients_success(setup_db):
    """Test retrieving recipes matching multiple ingredients."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Veggie Pizza", ["flour", "cheese", "tomato"]),
        full_recipe_mock(ObjectId(), "Tomato Pasta", ["pasta", "tomato", "olive oil"])
    ]

    cursor_mock = MagicMock()
    cursor_mock.sort.return_value = cursor_mock
    cursor_mock.skip.return_value = cursor_mock
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)

    setup_db["recipes"].find.return_value = cursor_mock
    setup_db["recipes"].count_documents.return_value = 2

    client = TestClient(app)
    payload = {"ingredients": ["tomato"], "page": 1}
    response = client.post("/recipe/search/", json=payload)

    expected = {
        "recipes": [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes],
        "page": 1,
        "count": 2
    }

    assert response.status_code == 200
    assert response.json() == expected


def test_search_recipes_multiple_ingredients_pagination(setup_db):
    """Test pagination with multiple ingredient search."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Recipe 1", ["egg", "milk"]),
        full_recipe_mock(ObjectId(), "Recipe 2", ["egg", "milk"])
    ]

    cursor_mock = MagicMock()
    cursor_mock.sort.return_value = cursor_mock
    cursor_mock.skip.return_value = cursor_mock
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock
    setup_db["recipes"].count_documents.return_value = 20  # total 20 recipes

    client = TestClient(app)
    payload = {"ingredients": ["egg", "milk"], "page": 2}
    response = client.post("/recipe/search/", json=payload)

    expected = {
        "recipes": [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes],
        "page": 2,
        "count": 20
    }

    assert response.status_code == 200
    assert response.json() == expected


def test_search_recipes_by_multiple_ingredients_invalid_payload(setup_db):
    """Test search with invalid payload format."""
    client = TestClient(app)
    payload = {"ingredients": "milk"}  # Invalid: should be a list
    response = client.post("/recipe/search/", json=payload)

    assert response.status_code == 422  # Unprocessable entity


def test_search_recipes_by_multiple_ingredients_missing_field(setup_db):
    """Test search with missing ingredients field in payload."""
    client = TestClient(app)
    payload = {"page": 1}  # Missing 'ingredients'
    response = client.post("/recipe/search/", json=payload)

    assert response.status_code == 422  

def test_get_single_ingredient_recipes_success(setup_db):
    """Test retrieving recipes by a single ingredient successfully."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Garlic Bread", ["flour", "garlic", "butter"]),
        full_recipe_mock(ObjectId(), "Garlic Shrimp", ["shrimp", "garlic", "lemon"])
    ]

    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/garlic")

    expected = [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes]

    assert response.status_code == 200
    assert response.json() == expected
    setup_db["recipes"].find.assert_called_once_with({"ingredients": {"$in": ["garlic"]}})


def test_get_single_ingredient_recipes_no_results(setup_db):
    """Test retrieving recipes when no results match the given ingredient."""
    setup_db["recipes"].find.return_value.__iter__.return_value = iter([])

    client = TestClient(app)
    response = client.get("/recipe/search/basil")

    assert response.status_code == 200
    assert response.json() == []
    setup_db["recipes"].find.assert_called_once_with({"ingredients": {"$in": ["basil"]}})


def test_get_single_ingredient_case_insensitive(setup_db):
    """Test searching with case-insensitive ingredient names."""
    mocked_recipe = full_recipe_mock(str(ObjectId()), "Basil Pesto Pasta", ["basil", "pasta", "olive oil"])

    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter([mocked_recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/BASIL")

    expected = [{**mocked_recipe, "_id": str(mocked_recipe["_id"])}]

    assert response.status_code == 200
    assert response.json() == expected


# ----------------------------------------------
# ✅ NEW TEST CASES FOR POST /recipe/search/ (Multiple Ingredients)
# ----------------------------------------------

def test_post_multiple_ingredients_search_success(setup_db):
    """Test searching recipes by multiple ingredients with successful results."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Avocado Toast", ["bread", "avocado", "egg"]),
        full_recipe_mock(ObjectId(), "Avocado Smoothie", ["avocado", "banana", "milk"])
    ]

    cursor_mock = MagicMock()
    cursor_mock.sort.return_value = cursor_mock
    cursor_mock.skip.return_value = cursor_mock
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)

    setup_db["recipes"].find.return_value = cursor_mock
    setup_db["recipes"].count_documents.return_value = 2

    client = TestClient(app)
    payload = {"ingredients": ["avocado"], "page": 1}
    response = client.post("/recipe/search/", json=payload)

    expected = {
        "recipes": [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes],
        "page": 1,
        "count": 2
    }

    assert response.status_code == 200
    assert response.json() == expected


def test_post_multiple_ingredients_pagination_success(setup_db):
    """Test pagination functionality with multiple ingredients."""
    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Omelette", ["egg", "cheese"]),
        full_recipe_mock(ObjectId(), "Scrambled Eggs", ["egg", "butter"])
    ]

    cursor_mock = MagicMock()
    cursor_mock.sort.return_value = cursor_mock
    cursor_mock.skip.return_value = cursor_mock
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock
    setup_db["recipes"].count_documents.return_value = 10  # Total recipes = 10

    client = TestClient(app)
    payload = {"ingredients": ["egg", "cheese"], "page": 2}
    response = client.post("/recipe/search/", json=payload)

    expected = {
        "recipes": [{**recipe, "_id": str(recipe["_id"])} for recipe in mocked_recipes],
        "page": 2,
        "count": 10
    }

    assert response.status_code == 200
    assert response.json() == expected


def test_post_multiple_ingredients_invalid_payload_type(setup_db):
    """Test invalid data type for ingredients field in payload."""
    client = TestClient(app)
    payload = {"ingredients": "avocado"}  # Should be a list, not string
    response = client.post("/recipe/search/", json=payload)

    assert response.status_code == 422  # Unprocessable entity due to validation error


def test_post_multiple_ingredients_missing_field(setup_db):
    """Test missing 'ingredients' field in the request payload."""
    client = TestClient(app)
    payload = {"page": 1}  # Missing 'ingredients'
    response = client.post("/recipe/search/", json=payload)

    assert response.status_code == 422  # Validation error for missing field


def test_post_multiple_ingredients_empty_list(setup_db):
    """Test searching with an empty ingredients list in the payload."""
    client = TestClient(app)
    payload = {"ingredients": [], "page": 1}  # Empty list should return empty results
    response = client.post("/recipe/search/", json=payload)

    assert response.status_code == 200
    assert response.json() == {"recipes": [], "page": 1, "count": 0}

def test_search_recipes_with_duplicate_ingredients_in_recipe(setup_db):
    """Recipes that list the same ingredient more than once should still match normally."""
    mocked_recipe = full_recipe_mock(ObjectId(), "Repeat Sugar Cake", ["sugar", "flour", "sugar"])

    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter([mocked_recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/sugar")

    expected = [{**mocked_recipe, "_id": str(mocked_recipe["_id"])}]
    assert response.status_code == 200
    assert response.json() == expected


def test_search_recipes_with_special_characters(setup_db):
    """Ensure special characters in ingredient names do not break search."""
    mocked_recipe = full_recipe_mock(ObjectId(), "Spicy Chili", ["jalapeño", "beef", "tomato"])

    cursor_mock = MagicMock()
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter([mocked_recipe])
    setup_db["recipes"].find.return_value = cursor_mock

    client = TestClient(app)
    response = client.get("/recipe/search/jalapeño")

    expected = [{**mocked_recipe, "_id": str(mocked_recipe["_id"])}]
    assert response.status_code == 200
    assert response.json() == expected


def test_search_recipes_large_number_of_ingredients(setup_db):
    """Test payload with many ingredients to verify pagination and matching work well."""
    many_ingredients = [f"ingredient{i}" for i in range(1, 50)]  # 49 ingredients

    mocked_recipes = [
        full_recipe_mock(ObjectId(), "Everything Stew", many_ingredients[:10])
    ]

    cursor_mock = MagicMock()
    cursor_mock.sort.return_value = cursor_mock
    cursor_mock.skip.return_value = cursor_mock
    cursor_mock.limit.return_value = cursor_mock
    cursor_mock.__iter__.return_value = iter(mocked_recipes)
    setup_db["recipes"].find.return_value = cursor_mock
    setup_db["recipes"].count_documents.return_value = 1

    client = TestClient(app)
    payload = {"ingredients": many_ingredients, "page": 1}
    response = client.post("/recipe/search/", json=payload)

    expected = {
        "recipes": [{**mocked_recipes[0], "_id": str(mocked_recipes[0]["_id"])}],
        "page": 1,
        "count": 1
    }

    assert response.status_code == 200
    assert response.json() == expected


def test_search_recipes_empty_result_for_uncommon_ingredient(setup_db):
    """Uncommon or fake ingredient should return an empty list."""
    setup_db["recipes"].find.return_value.__iter__.return_value = iter([])

    client = TestClient(app)
    response = client.get("/recipe/search/unobtanium")

    assert response.status_code == 200
    assert response.json() == []

    
    