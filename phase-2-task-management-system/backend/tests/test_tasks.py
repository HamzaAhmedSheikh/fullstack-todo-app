"""
Test Protected Task Endpoints
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from uuid import uuid4
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

from app.main import app


client = TestClient(app)


@pytest.fixture
def rsa_keys():
    """Generate RSA key pair for testing"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()
    return {"private": private_key, "public": public_key}


def generate_token(user_id: str, email: str, rsa_keys: dict) -> str:
    """Generate a valid JWT token for testing"""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }

    private_key_pem = rsa_keys["private"].private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    return jwt.encode(payload, private_key_pem, algorithm="RS256", headers={"kid": "test-key-id"})


def test_get_tasks_without_token():
    """
    Test that accessing tasks without token returns 401

    Given: No Authorization header
    When: GET /api/{user_id}/tasks
    Then: 401 Unauthorized
    """
    user_id = str(uuid4())
    response = client.get(f"/api/{user_id}/tasks")

    assert response.status_code == 401
    response_data = response.json()
    assert "detail" in response_data


def test_get_tasks_with_valid_token(rsa_keys):
    """
    Test accessing tasks with valid token

    Given: Valid JWT token in Authorization header
    When: GET /api/{user_id}/tasks
    Then: 200 OK with tasks data
    """
    user_id = str(uuid4())
    valid_token = generate_token(user_id, "test@example.com", rsa_keys)

    # Mock the JWK client to accept our test token
    from unittest.mock import Mock
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        response = client.get(
            f"/api/{user_id}/tasks",
            headers={"Authorization": f"Bearer {valid_token}"}
        )

        assert response.status_code == 200
        response_data = response.json()
        assert isinstance(response_data, list)  # Returns list of tasks


def test_user_id_mismatch(rsa_keys):
    """
    Test that user cannot access another user's tasks

    Given: Valid JWT token for user A
    When: Attempting to access user B's tasks
    Then: 403 Forbidden
    """
    user_a_id = str(uuid4())
    user_b_id = str(uuid4())

    token_user_a = generate_token(user_a_id, "usera@example.com", rsa_keys)

    # Mock the JWK client
    from unittest.mock import Mock
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        # Try to access user B's tasks with user A's token
        response = client.get(
            f"/api/{user_b_id}/tasks",
            headers={"Authorization": f"Bearer {token_user_a}"}
        )

        assert response.status_code == 403
        response_data = response.json()
        assert "detail" in response_data
        assert "your own" in response_data["detail"].lower()
