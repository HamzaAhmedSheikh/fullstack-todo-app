# Backend Integration Guide: JWT Authentication

This document explains how the Next.js frontend integrates with the FastAPI backend using JWT (JSON Web Token) authentication with Better Auth.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  Next.js        │         │   FastAPI        │
│  Frontend       │ ◄─────► │   Backend        │
│  (Port 3000)    │   JWT   │   (Port 8000)    │
└─────────────────┘         └──────────────────┘

1. User signs up/in → Backend issues JWT
2. Frontend stores JWT (Better Auth client)
3. Frontend makes API calls with JWT in header
4. Backend verifies JWT and extracts user_id
5. Backend filters data by user_id
```

## Authentication Flow

### 1. User Registration (Signup)

**Frontend:**
```typescript
// src/lib/auth.ts
export async function signUp(email: string, password: string) {
  const response = await authClient.signUp.email({
    email,
    password,
    name: email.split("@")[0],
  });
  // Returns: { user: {...}, token: "jwt-token-here" }
}
```

**Backend Endpoint:**
- `POST http://localhost:8000/api/auth/signup`
- Request: `{ "email": "user@example.com", "password": "password123" }`
- Response: `{ "user": { "id": "uuid", "email": "...", "name": "..." }, "token": "jwt..." }`

### 2. User Sign In

**Frontend:**
```typescript
// src/lib/auth.ts
export async function signIn(email: string, password: string) {
  const response = await authClient.signIn.email({
    email,
    password,
  });
  // Returns: { user: {...}, token: "jwt-token-here" }
}
```

**Backend Endpoint:**
- `POST http://localhost:8000/api/auth/signin`
- Request: `{ "email": "user@example.com", "password": "password123" }`
- Response: `{ "user": { "id": "uuid", "email": "...", "name": "..." }, "token": "jwt..." }`

### 3. Session Management

**Frontend:**
```typescript
// src/lib/auth.ts
export async function getSession() {
  const response = await authClient.getSession();
  // Returns: { user: {...}, session: { token: "...", expiresAt: Date } }
}
```

**Backend Endpoint:**
- `GET http://localhost:8000/api/auth/session`
- Headers: `Authorization: Bearer <jwt-token>`
- Response: `{ "user": { "id": "uuid", "email": "...", "name": "..." }, "session": {...} }`

## JWT Token Structure

### Token Claims

The JWT token issued by the backend contains these claims:

```json
{
  "sub": "user-uuid-here",      // Subject: User ID (for data isolation)
  "email": "user@example.com",   // User email
  "name": "Username",            // User name
  "iat": 1704067200,            // Issued at timestamp
  "exp": 1704672000,            // Expiration timestamp (7 days)
  "iss": "http://localhost:8000", // Issuer: Backend URL
  "aud": "http://localhost:3000"  // Audience: Frontend URL
}
```

### Token Verification (Backend)

The backend verifies the JWT using the shared secret:

```python
# Backend: Verify JWT
import jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,  # Shared secret
            algorithms=["HS256"],
            audience=settings.FRONTEND_URL,
            issuer=settings.BACKEND_URL
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## API Request Flow

### How Frontend Sends Authenticated Requests

```typescript
// src/lib/api.ts
async function getAuthHeaders() {
  const session = await getSession();
  const token = getToken(session);  // Extract JWT from session

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`  // Attach JWT to header
  };
}

// Example: Fetch user's tasks
const tasks = await api.get(`/api/users/${userId}/tasks`);
// Request includes: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### How Backend Handles Authenticated Requests

```python
# Backend: Extract and verify JWT from Authorization header
from fastapi import Depends, HTTPException, Header

async def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.split(" ")[1]  # Extract token from "Bearer <token>"
    payload = verify_token(token)
    user_id = payload["sub"]  # Extract user_id from 'sub' claim

    return user_id

# Use in endpoint:
@app.get("/api/users/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user)
):
    # Verify user_id matches authenticated user
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    # Filter tasks by user_id
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return tasks
```

## Environment Variables

### Frontend (.env.local)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
# Note: Frontend does NOT need BETTER_AUTH_SECRET
# Authentication is handled entirely by backend
BETTER_AUTH_URL=http://localhost:3000
```

### Backend (.env)

```bash
# JWT Configuration
BETTER_AUTH_SECRET=<your-secret-key-here>  # Must match frontend (if frontend issues tokens)

# Alternatively, if backend issues tokens:
JWT_SECRET_KEY=<your-secret-key-here>      # Backend's own secret for JWT signing
JWT_ALGORITHM=HS256                        # Signing algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=10080          # 7 days

# CORS Configuration
FRONTEND_URL=http://localhost:3000         # Allow requests from frontend
```

**CRITICAL:** The backend must use the SAME secret key to sign and verify JWT tokens.

## Security Considerations

### 1. User Data Isolation

Every backend endpoint MUST:
- Extract `user_id` from JWT `sub` claim
- Verify `user_id` in URL matches authenticated user
- Filter all database queries by `user_id`

**Example:**
```python
# WRONG: No user verification
@app.get("/api/users/{user_id}/tasks")
async def get_tasks(user_id: str):
    return db.query(Task).filter(Task.user_id == user_id).all()

# CORRECT: Verify authenticated user matches requested user
@app.get("/api/users/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Access denied")

    return db.query(Task).filter(Task.user_id == user_id).all()
```

### 2. Token Expiration

- Frontend: JWTs expire after 7 days
- Backend: Verify `exp` claim during token verification
- Frontend: Handles 401 Unauthorized → clears session → redirects to signin

### 3. Error Handling

**Backend Response Codes:**
- `401 Unauthorized`: Token missing, expired, or invalid
- `403 Forbidden`: User doesn't have access to resource
- `404 Not Found`: Resource doesn't exist

**Frontend Handling:**
```typescript
// src/lib/api.ts
async function handleApiError(response: Response) {
  if (response.status === 401) {
    // Clear session and redirect to signin
    await signOut();
    window.location.href = "/signin";
  }
  // ... handle other errors
}
```

## JWKS Endpoint (Optional)

If using RS256 (asymmetric) instead of HS256 (symmetric), the backend should expose a JWKS endpoint:

**Backend Endpoint:**
- `GET http://localhost:8000/api/auth/jwks`
- Response:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-id-123",
      "n": "public-key-modulus...",
      "e": "AQAB",
      "alg": "RS256"
    }
  ]
}
```

This allows other services to verify JWT tokens without sharing the private key.

## Testing the Integration

### 1. Test Signup

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Expected response:
# {
#   "user": {"id": "uuid", "email": "test@example.com", "name": "test"},
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }
```

### 2. Test Protected Endpoint

```bash
# Get token from signup/signin response
TOKEN="eyJhbGciOiJIUzI1NiIs..."
USER_ID="uuid-from-signup-response"

# Fetch user's tasks
curl -X GET http://localhost:8000/api/users/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# { "tasks": [...] }
```

### 3. Test Invalid Token

```bash
curl -X GET http://localhost:8000/api/users/$USER_ID/tasks \
  -H "Authorization: Bearer invalid-token"

# Expected response:
# { "detail": "Invalid token" }  # 401 Unauthorized
```

## Implementation Checklist

### Backend (FastAPI)

- [ ] Install PyJWT: `pip install pyjwt[crypto]`
- [ ] Set `BETTER_AUTH_SECRET` or `JWT_SECRET_KEY` in `.env`
- [ ] Implement JWT signing on signup/signin
- [ ] Implement JWT verification middleware
- [ ] Extract `user_id` from JWT `sub` claim
- [ ] Add user verification to all protected endpoints
- [ ] Filter all database queries by `user_id`
- [ ] Handle 401/403 errors appropriately
- [ ] (Optional) Implement JWKS endpoint for RS256

### Frontend (Next.js)

- [X] Configure Better Auth client with backend URL
- [X] Implement signup/signin/session functions
- [X] Configure API client to attach JWT to requests
- [X] Handle 401 Unauthorized → clear session → redirect
- [X] Extract user_id from session for API calls
- [ ] Test end-to-end authentication flow

## Troubleshooting

### Issue: "401 Unauthorized" on every request

**Cause:** JWT token not being sent or backend can't verify it

**Solutions:**
1. Check that `Authorization: Bearer <token>` header is included
2. Verify backend receives the header: `print(request.headers)`
3. Check shared secret matches on both frontend and backend
4. Verify token hasn't expired: decode JWT and check `exp` claim

### Issue: Users can see other users' data

**Cause:** Backend not filtering by `user_id`

**Solutions:**
1. Extract `user_id` from JWT `sub` claim in every endpoint
2. Add `user_id` filter to all database queries
3. Verify `user_id` in URL matches authenticated user

### Issue: "Failed to initialize database adapter"

**Cause:** Better Auth trying to use server-side features on frontend

**Solution:**
- Frontend should ONLY use Better Auth client (`createAuthClient`)
- Backend handles all authentication logic
- Remove any Better Auth server configuration from frontend

## Summary

| Component | Responsibility |
|-----------|---------------|
| **Frontend** | Store JWT, attach to requests, handle session expiry |
| **Backend** | Issue JWT, verify JWT, extract user_id, filter data |
| **Shared Secret** | Used by backend to sign and verify JWT tokens |
| **JWT Token** | Contains user_id (sub claim) for data isolation |

The frontend and backend communicate using JWT tokens, with the backend enforcing user data isolation by verifying the authenticated user's ID matches the requested resource owner.
