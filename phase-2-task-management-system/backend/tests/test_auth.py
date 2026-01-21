"""
Test JWT Verification
"""
import pytest
from unittest.mock import Mock, patch
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.utils.auth import verify_jwt_token


@pytest.fixture
def rsa_keys():
    """Generate RSA key pair for testing"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()

    return {
        "private": private_key,
        "public": public_key,
    }


@pytest.fixture
def valid_token(rsa_keys):
    """Generate a valid JWT token for testing"""
    payload = {
        "sub": "test-user-123",
        "email": "test@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }

    # Encode with RS256
    private_key_pem = rsa_keys["private"].private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    token = jwt.encode(payload, private_key_pem, algorithm="RS256", headers={"kid": "test-key-id"})
    return token


def test_verify_valid_token(valid_token, rsa_keys):
    """
    Test JWT verification with valid token
    """
    # Mock the JWK client
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        user_info = verify_jwt_token(valid_token)

        assert "user_id" in user_info
        assert "email" in user_info
        assert user_info["user_id"] == "test-user-123"
        assert user_info["email"] == "test@example.com"


def test_verify_expired_token(rsa_keys):
    """
    Test JWT verification with expired token
    """
    # Create expired token
    payload = {
        "sub": "test-user-123",
        "email": "test@example.com",
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),  # Expired 1 hour ago
        "iat": datetime.now(timezone.utc) - timedelta(hours=2),
    }

    private_key_pem = rsa_keys["private"].private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    expired_token = jwt.encode(payload, private_key_pem, algorithm="RS256")

    # Mock the JWK client
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        with pytest.raises(ValueError, match="Invalid token"):
            verify_jwt_token(expired_token)


def test_verify_invalid_signature():
    """
    Test JWT verification with invalid signature
    """
    # Create token with wrong signature
    invalid_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIn0.invalid_signature"

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.side_effect = jwt.PyJWTError("Invalid signature")

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        with pytest.raises(ValueError, match="Invalid token"):
            verify_jwt_token(invalid_token)


def test_verify_token_missing_user_id(rsa_keys):
    """
    Test JWT verification with token missing user_id
    """
    # Create token without sub or user_id
    payload = {
        "email": "test@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }

    private_key_pem = rsa_keys["private"].private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    token = jwt.encode(payload, private_key_pem, algorithm="RS256")

    # Mock the JWK client
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        with pytest.raises(ValueError, match="Missing user_id in token"):
            verify_jwt_token(token)


def test_verify_token_with_user_id_claim(rsa_keys):
    """
    Test JWT verification with user_id claim instead of sub
    """
    payload = {
        "user_id": "test-user-456",
        "email": "test2@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }

    private_key_pem = rsa_keys["private"].private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    token = jwt.encode(payload, private_key_pem, algorithm="RS256")

    # Mock the JWK client
    mock_signing_key = Mock()
    mock_signing_key.key = rsa_keys["public"]

    mock_jwk_client = Mock()
    mock_jwk_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.utils.auth.get_cached_jwk_client", return_value=mock_jwk_client):
        user_info = verify_jwt_token(token)

        assert user_info["user_id"] == "test-user-456"
        assert user_info["email"] == "test2@example.com"
