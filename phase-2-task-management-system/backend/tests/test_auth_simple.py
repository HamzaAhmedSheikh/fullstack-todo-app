"""
Test JWT Authentication (TDD - Write tests FIRST)

These tests will FAIL initially, then we implement to make them pass.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
import jwt
import os
from datetime import datetime, timedelta

# Test client
client = TestClient(app)

# Test secret (matches BETTER_AUTH_SECRET in .env)
TEST_SECRET = os.getenv("BETTER_AUTH_SECRET", "test-secret-key-min-32-characters-long")


def create_test_jwt(user_id: str, expired: bool = False) -> str:
    """Helper to create test JWT tokens"""
    exp_time = datetime.utcnow() - timedelta(hours=1) if expired else datetime.utcnow() + timedelta(hours=1)

    payload = {
        "sub": user_id,  # Standard JWT claim for user ID
        "exp": exp_time,
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, TEST_SECRET, algorithm="HS256")
    return token


# RED PHASE - These tests will FAIL until we implement the code

def test_health_endpoint_exists():
    """Test 1: Health endpoint should exist"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_protected_endpoint_without_token_returns_401():
    """Test 2: Accessing protected endpoint without token should return 401"""
    response = client.get("/api/test-user-123/tasks")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_protected_endpoint_with_valid_token_returns_success():
    """Test 3: Valid JWT token should allow access"""
    token = create_test_jwt("test-user-123")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/test-user-123/tasks", headers=headers)
    # Should not return 401 (authentication passed)
    assert response.status_code != 401


def test_protected_endpoint_with_invalid_token_returns_401():
    """Test 4: Invalid JWT token should return 401"""
    headers = {"Authorization": "Bearer invalid-token-string"}

    response = client.get("/api/test-user-123/tasks", headers=headers)
    assert response.status_code == 401


def test_protected_endpoint_with_expired_token_returns_401():
    """Test 5: Expired JWT token should return 401"""
    token = create_test_jwt("test-user-123", expired=True)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/test-user-123/tasks", headers=headers)
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()


def test_protected_endpoint_with_mismatched_user_id_returns_403():
    """Test 6: JWT user_id not matching path user_id should return 403"""
    token = create_test_jwt("user-a")  # Token for user-a
    headers = {"Authorization": f"Bearer {token}"}

    # Try to access user-b's tasks with user-a's token
    response = client.get("/api/user-b/tasks", headers=headers)
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower() or "cannot access" in response.json()["detail"].lower()


def test_jwt_extraction_returns_correct_user_id():
    """Test 7: JWT should correctly extract user_id"""
    token = create_test_jwt("my-user-id-123")
    headers = {"Authorization": f"Bearer {token}"}

    # This will pass if user_id matches
    response = client.get("/api/my-user-id-123/tasks", headers=headers)
    assert response.status_code != 403  # Should not be forbidden
