# Quickstart: JWT Verification API

## Overview
The JWT Verification API provides a simple and secure way to verify JWT tokens in your applications. This API is built with FastAPI and provides endpoints for token verification with configurable parameters.

## Getting Started

### Prerequisites
- Python 3.13+
- pip package manager

### Installation
1. Clone the repository
2. Navigate to the backend/fastapi-better-auth-jwt directory
3. Install dependencies:
```bash
pip install fastapi uvicorn pyjwt python-jose[cryptography] python-multipart
```

### Running the API
Start the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Testing the API
Verify a JWT token by making a POST request to `/api/v1/auth/verify`:
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }'
```

## Configuration
The API can be configured through environment variables:
- `JWT_SECRET_KEY`: Secret key for JWT verification (required)
- `JWT_ALGORITHM`: Default algorithm for JWT verification (default: "HS256")
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 30)

## Integration with Existing FastAPI Applications
To integrate the JWT verification functionality into an existing FastAPI application:

1. Copy the auth module to your project
2. Import the authentication dependencies
3. Use the JWTBearer class as a dependency in your protected routes

Example:
```python
from fastapi import Depends
from auth.jwt import JWTBearer

async def get_current_user(token: str = Depends(JWTBearer())):
    # Verify the token and return user info
    return decode_token(token)
```