import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../api')))
from fastapi.testclient import TestClient
import pytest
from bson import ObjectId  
from routes import app, users_db


client = TestClient(app)

@pytest.fixture
def clear_users_db():
    """Fixture to clear the users_db before each test"""
    users_db.clear()

def test_signup_user(clear_users_db):
    """Test case for user signup"""
    user_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }

    # Send a POST request to the /signup endpoint
    response = client.post("/signup", json=user_data)

    # Assert the response status code is 200 (success)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

    # Check that the user is actually added to users_db
    assert "testuser@example.com" in users_db
    assert users_db["testuser@example.com"] == "password123"

def test_signup_user_already_exists(clear_users_db):
    """Test case for attempting to signup an already existing user"""
    user_data = {
        "email": "testuser@example.com",
        "password": "password123"
    }

    # First signup should succeed
    client.post("/signup", json=user_data)

    # Attempt to signup again with the same email
    response = client.post("/signup", json=user_data)

    # Assert the response status code is 400 (bad request)
    assert response.status_code == 400
    assert response.json() == {"detail": "User already exists"}

def test_signup_empty_email(clear_users_db):
    user_data = {"email": "", "password": "password123"}
    response = client.post("/signup", json=user_data)
    assert response.status_code == 422 

def test_signup_empty_password(clear_users_db):
    user_data = {"email": "newuser@example.com", "password": ""}
    response = client.post("/signup", json=user_data)

    # Check if the response status code is 200 (success)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

    # Check that the user is still added to users_db (even with an empty password)
    assert "newuser@example.com" in users_db
    assert users_db["newuser@example.com"] == ""

def test_signup_missing_password(clear_users_db):
    user_data = {"email": "missingpassword@example.com"}
    response = client.post("/signup", json=user_data)
    assert response.status_code == 422

def test_signup_invalid_email_format(clear_users_db):
    user_data = {"email": "invalid-email", "password": "password123"}
    response = client.post("/signup", json=user_data)
    assert response.status_code == 422 

def test_signup_long_password(clear_users_db):
    user_data = {"email": "longpassword@example.com", "password": "a" * 129}
    response = client.post("/signup", json=user_data)

    # Check if the response status code is 200 (success)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

    # Check that the user is added to users_db
    assert "longpassword@example.com" in users_db
    assert users_db["longpassword@example.com"] == "a" * 129

def test_signup_and_login(clear_users_db):
    user_data = {"email": "validuser@example.com", "password": "password123"}
    client.post("/signup", json=user_data)

    # Attempt login with the same credentials
    login_data = {"email": "validuser@example.com", "password": "password123"}
    response = client.post("/login", json=login_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}

def test_signup_short_password(clear_users_db):
    user_data = {"email": "shortpass@example.com", "password": "12345"}
    response = client.post("/signup", json=user_data)

    # Check if the response status code is 200 (success)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

    # Check that the user is added to users_db
    assert "shortpass@example.com" in users_db
    assert users_db["shortpass@example.com"] == "12345"

def test_signup_without_special_characters(clear_users_db):
    user_data = {"email": "simpleuser@example.com", "password": "simplepassword"}
    response = client.post("/signup", json=user_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

def test_signup_with_special_characters(clear_users_db):
    user_data = {"email": "specialchars@example.com", "password": "password@123"}
    response = client.post("/signup", json=user_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Signup successful"}

def test_login_empty_email(clear_users_db):
    user_data = {"email": "", "password": "password123"}
    response = client.post("/login", json=user_data)
    assert response.status_code == 422  

def test_login_empty_password(clear_users_db):
    user_data = {"email": "testuser@example.com", "password": ""}
    response = client.post("/login", json=user_data)

    # Check if the response status code is 400 (Bad Request)
    assert response.status_code == 400
    assert response.json() == {"detail": "Incorrect email or password"}

def test_login_incorrect_password(clear_users_db):
    user_data = {"email": "testuser@example.com", "password": "wrongpassword"}
    response = client.post("/login", json=user_data)
    assert response.status_code == 400  # Incorrect email or password
    assert response.json() == {"detail": "Incorrect email or password"}

def test_login_unregistered_email(clear_users_db):
    user_data = {"email": "unregistered@example.com", "password": "password123"}
    response = client.post("/login", json=user_data)
    assert response.status_code == 400  # Incorrect email or password
    assert response.json() == {"detail": "Incorrect email or password"}

def test_login_after_signup(clear_users_db):
    signup_data = {"email": "newuser@example.com", "password": "password123"}
    client.post("/signup", json=signup_data)

    login_data = {"email": "newuser@example.com", "password": "password123"}
    response = client.post("/login", json=login_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}

def test_login_missing_password(clear_users_db):
    user_data = {"email": "newuser@example.com"}
    response = client.post("/login", json=user_data)
    assert response.status_code == 422  

def test_login_incorrect_password_length(clear_users_db):
    user_data = {"email": "newuser@example.com", "password": "short"}
    response = client.post("/login", json=user_data)
    assert response.status_code == 400  # Incorrect email or password
    assert response.json() == {"detail": "Incorrect email or password"}

def test_login_case_sensitive_email(clear_users_db):
    signup_data = {"email": "TestUser@Example.com", "password": "password123"}
    client.post("/signup", json=signup_data)

    login_data = {"email": "testuser@example.com", "password": "password123"}
    response = client.post("/login", json=login_data)
    assert response.status_code == 400  
    assert response.json() == {"detail": "Incorrect email or password"}

def test_login_after_password_update(clear_users_db):
    signup_data = {"email": "updatepassword@example.com", "password": "oldpassword"}
    client.post("/signup", json=signup_data)

  
    users_db["updatepassword@example.com"] = "newpassword"

    login_data = {"email": "updatepassword@example.com", "password": "newpassword"}
    response = client.post("/login", json=login_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}







