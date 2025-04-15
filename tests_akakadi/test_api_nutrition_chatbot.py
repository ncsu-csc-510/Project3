import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))

from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from main import app  

client = TestClient(app)


@pytest.fixture
def setup_chatbot():
    """Fixture to mock the chatbot and avoid actual API calls."""
    app.chat_client = MagicMock() 
    yield app.chat_client


@pytest.fixture
def nutrition_query_payload():
    """Sample valid nutrition query payload."""
    return {
        "weight": 70,          # kg
        "height": 175,         # cm
        "age": 30,
        "gender": "male",
        "activity_level": "moderate",
        "goal": "maintain weight"
    }


def test_get_nutrition_recommendations_success(setup_chatbot, nutrition_query_payload):
    """ Test successful nutrition recommendations with mocked chatbot response."""

    # Mock chatbot response
    mock_chat_response = MagicMock()
    mock_chat_response.choices = [MagicMock(message=MagicMock(content="Here is your personalized diet plan."))]
    setup_chatbot.chat.completions.create.return_value = mock_chat_response

    response = client.post("/nutrition-chatbot/", json=nutrition_query_payload)

    assert response.status_code == 200
    data = response.json()

    # 🔍 Check for calculated TDEE and macronutrients
    assert data["recommended_calories"] > 0
    assert data["recommended_protein_g"] > 0
    assert data["recommended_fat_g"] > 0
    assert data["recommended_sugar_g"] > 0


def test_get_nutrition_recommendations_invalid_input(setup_chatbot):
    """ Test with invalid payload (missing fields)."""
    invalid_payload = {"weight": 70, "height": 175}  # Missing age, gender, etc.

    response = client.post("/nutrition-chatbot/", json=invalid_payload)
    assert response.status_code == 422  


def test_get_nutrition_recommendations_invalid_types(setup_chatbot):
    """Test with incorrect data types (e.g., string instead of number)."""
    invalid_payload = {
        "weight": "seventy",   # Should be numeric
        "height": 175,
        "age": "thirty",       # Should be numeric
        "gender": "male",
        "activity_level": "moderate",
        "goal": "maintain weight"
    }

    response = client.post("/nutrition-chatbot/", json=invalid_payload)
    assert response.status_code == 422  # FastAPI validation error


def test_get_nutrition_recommendations_empty_payload(setup_chatbot):
    """Test with completely empty payload."""
    response = client.post("/nutrition-chatbot/", json={})
    assert response.status_code == 422

def test_get_nutrition_recommendations_high_values(setup_chatbot):
    """Test with very high but valid values (e.g., bodybuilders)."""
    payload = {
        "weight": 200,
        "height": 220,
        "age": 35,
        "gender": "male",
        "activity_level": "high",
        "goal": "gain weight"
    }

    mock_chat_response = MagicMock()
    mock_chat_response.choices = [MagicMock(message=MagicMock(content="Bulk mode activated."))]
    setup_chatbot.chat.completions.create.return_value = mock_chat_response

    response = client.post("/nutrition-chatbot/", json=payload)

    assert response.status_code == 200
    assert "recommended_calories" in response.json()
