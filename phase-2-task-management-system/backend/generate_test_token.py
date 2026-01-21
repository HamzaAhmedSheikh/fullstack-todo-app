#!/usr/bin/env python
"""
Generate a test JWT token for API testing
This token can be used with curl to test protected endpoints
"""
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from uuid import uuid4

# Generate RSA key pair
private_key = rsa.generate_private_key(
    public_exponent=65537,
    key_size=2048,
)
public_key = private_key.public_key()

# Create a test user ID
user_id = str(uuid4())

# Create JWT payload
payload = {
    "sub": user_id,
    "email": "test@example.com",
    "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    "iat": datetime.now(timezone.utc),
}

# Encode with RS256
private_key_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

token = jwt.encode(payload, private_key_pem, algorithm="RS256", headers={"kid": "test-key-id"})

print("=" * 80)
print("TEST JWT TOKEN GENERATED")
print("=" * 80)
print()
print(f"User ID: {user_id}")
print(f"Email: test@example.com")
print(f"Token expires: {payload['exp'].isoformat()}")
print()
print("JWT Token:")
print(token)
print()
print("=" * 80)
print("USAGE WITH CURL:")
print("=" * 80)
print()
print(f'export USER_ID="{user_id}"')
print(f'export TOKEN="{token}"')
print()
print('# GET all tasks')
print('curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/$USER_ID/tasks')
print()
print('# CREATE a task')
print('curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\')
print('  -d \'{"title": "Test Task", "description": "Test Description"}\' \\')
print('  http://localhost:8000/api/$USER_ID/tasks')
print()
print("NOTE: This token will only work if you mock the JWT verification in your tests.")
print("For production, get tokens from the frontend Better Auth flow.")
print("=" * 80)
