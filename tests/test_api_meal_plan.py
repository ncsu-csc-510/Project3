import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from main import app


@pytest.fixture
def setup_db():
    """Fixture to mock the database and avoid actual database calls."""
    app.database = MagicMock()
    yield app.database

def test_save_meal_plan_success(setup_db):
    """Test saving a meal plan for a specific day successfully."""
    meal_plan_data = {
        "day": 2,
        "recipe": {"name": "Pasta", "calories": "500"}
    }

    # Mock the update_one response
    setup_db["meal_plans"].update_one.return_value = MagicMock(matched_count=1, upserted_id=None)

    client = TestClient(app)
    response = client.post("/meal-plan/", json=meal_plan_data)

    # Assertions
    assert response.status_code == 200
    assert response.json()["message"] == "Meal plan saved successfully."
    setup_db["meal_plans"].update_one.assert_called_once_with(
        {"day": meal_plan_data["day"]},
        {"$set": {"recipe": meal_plan_data["recipe"]}},
        upsert=True
    )

def test_get_meal_plan_success(setup_db):
    """Test retrieving the meal plan for the week successfully."""
    # Mocked meal plan entries
    mocked_meal_plan = [
        {"_id": "1", "day": 0, "recipe": {"name": "Pasta"}},
        {"_id": "2", "day": 1, "recipe": {"name": "Salad"}}
    ]

    # Mock the find response
    setup_db["meal_plans"].find.return_value = mocked_meal_plan

    client = TestClient(app)
    response = client.get("/meal-plan/")

    # Expected full plan with missing days as None
    expected_response = [
        {"_id": "1", "day": 0, "recipe": {"name": "Pasta"}},
        {"_id": "2", "day": 1, "recipe": {"name": "Salad"}},
        {"2": None},
        {"3": None},
        {"4": None},
        {"5": None},
        {"6": None}
    ]

    assert response.status_code == 200
    assert response.json() == expected_response
    setup_db["meal_plans"].find.assert_called_once_with({})


def test_save_meal_plan_failure(setup_db):
    """Test failure scenario when saving a meal plan."""
    meal_plan_data = {"day": 3, "recipe": {"name": "Burger", "calories": "700"}}

    # Simulate a database exception
    setup_db["meal_plans"].update_one.side_effect = Exception("Database error")

    client = TestClient(app)
    response = client.post("/meal-plan/", json=meal_plan_data)

    assert response.status_code == 500
    assert response.json()["detail"] == "An error occurred while saving the meal plan."


def test_get_meal_plan_failure(setup_db):
    """Test failure scenario when retrieving the meal plan."""
    # Simulate a database exception
    setup_db["meal_plans"].find.side_effect = Exception("Database error")

    client = TestClient(app)
    response = client.get("/meal-plan/")

    assert response.status_code == 500
    assert response.json()["detail"] == "An error occurred while retrieving the meal plan."
