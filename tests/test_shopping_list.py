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
    # Mocking the database
    app.database = MagicMock()
    app.database.list_collection_names.return_value = []  # Mock empty collection
    app.database["shopping-list"].find.return_value = []  # Mock empty shopping list
    app.database["shopping-list"].insert_many.return_value = None  # Mock insert
    yield app.database  # Use the mock database in tests

def test_get_shopping_list(setup_db):
    """Test to fetch shopping list."""
    client = TestClient(app)
    response = client.get("/shopping-list")
    assert response.status_code == 200
    assert response.json() == {"shopping_list": []}

def test_update_shopping_list(setup_db):
    """Test to update shopping list."""
    client = TestClient(app)
    response = client.post("/shopping-list/update", json=[{
        "name": "Apple",
        "quantity": 5,
        "unit": "kg",
        "checked": False
    }])
    assert response.status_code == 200
    assert response.json()["message"] == "Shopping list updated successfully"

def test_update_existing_item(setup_db):
    """Test updating an existing item in the shopping list."""
    # Mock existing item in database with a valid ObjectId
    app.database["shopping-list"].find.return_value = [{
        "_id": ObjectId("60b8d2950d0a2c8b75a3b9f9"),  # Use a valid ObjectId
        "name": "Apple", "quantity": 5, "unit": "kg", "checked": False
    }]
    
    # Mock the update response
    app.database["shopping-list"].update_one.return_value.modified_count = 1
    
    client = TestClient(app)
    response = client.put("/shopping-list/60b8d2950d0a2c8b75a3b9f9", json={
        "name": "Apple",
        "quantity": 10,
        "unit": "kg",
        "checked": True
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Item updated successfully"

# def test_update_nonexistent_item(setup_db):
#     """Test updating a non-existent item in the shopping list."""
#     client = TestClient(app)
    
#     # Generate a valid ObjectId for the test (simulate a non-existent item)
#     non_existent_item_id = str(ObjectId())  # Random valid ObjectId
    
#     response = client.put(f"/shopping-list/{non_existent_item_id}", json={
#         "name": "Banana",
#         "quantity": 3,
#         "unit": "kg",
#         "checked": False
#     })
    
#     assert response.status_code == 404  # Expect a 404 since the item does not exist
#     assert response.json() == {"detail": "Item not found"}

def test_delete_item(setup_db):
    """Test deleting an item from the shopping list."""
    # Mock existing item in database with a valid ObjectId
    app.database["shopping-list"].find.return_value = [{
        "_id": ObjectId("60b8d2950d0a2c8b75a3b9f9"),  # Use a valid ObjectId
        "name": "Apple", "quantity": 5, "unit": "kg", "checked": False
    }]
    
    # Mock the delete response
    app.database["shopping-list"].delete_one.return_value.deleted_count = 1
    
    client = TestClient(app)
    response = client.delete("/shopping-list/60b8d2950d0a2c8b75a3b9f9")
    assert response.status_code == 200
    assert response.json()["message"] == "Item with ID 60b8d2950d0a2c8b75a3b9f9 deleted successfully"

# def test_delete_nonexistent_item(setup_db):
#     """Test deleting a non-existent item from the shopping list."""
#     client = TestClient(app)
    
#     # Clear the collection to simulate an empty database
#     collection = app.database["shopping-list"]
#     collection.delete_many({})  # Clear the collection
    
#     # Generate a valid ObjectId to simulate a non-existent item
#     non_existent_item_id = str(ObjectId())  # Random valid ObjectId
    
#     # Make the delete request
#     response = client.delete(f"/shopping-list/{non_existent_item_id}")
    
#     # Assert 404 error since the item doesn't exist
#     assert response.status_code == 404
#     assert response.json() == {"detail": "Item not found"}
 
 
def test_update_shopping_list_with_duplicates(setup_db):
    """Test trying to add duplicate items to the shopping list."""
    # Mock existing item in database with a valid ObjectId
    app.database["shopping-list"].find.return_value = [{
        "_id": ObjectId("60b8d2950d0a2c8b75a3b9f9"),  # Use a valid ObjectId
        "name": "Apple", "quantity": 5, "unit": "kg", "checked": False
    }]
    
    client = TestClient(app)
    response = client.post("/shopping-list/update", json=[{
        "name": "Apple",
        "quantity": 5,
        "unit": "kg",
        "checked": False
    }])
    assert response.status_code == 400
    assert response.json()["detail"] == "No new items to add."