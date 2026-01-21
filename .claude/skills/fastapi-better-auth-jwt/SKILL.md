---
name: fastapi-better-auth-jwt
description: Build secure FastAPI backends with Better Auth JWT integration. Use when creating REST APIs with JWT authentication, implementing user authorization, securing endpoints, or integrating FastAPI with Next.js Better Auth. Handles token verification, query-level data isolation, and production-ready security patterns.
---

# FastAPI Backend with Better Auth JWT Integration

Expert guidance for building secure FastAPI applications with JWT-based authentication, specifically integrating with Better Auth from Next.js frontends.

## Core Architecture Principles

### Authentication vs Authorization
- **Authentication** (Frontend): Better Auth verifies who the user is
- **Authorization** (Backend): FastAPI verifies what they can access via JWT
- **Stateless Design**: Backend verifies tokens without maintaining session state
- **Zero Trust**: Never trust frontend-provided user IDs

### Security-First Design
All authorization happens at the database query level. User IDs from JWT tokens are used to filter data—never accept user IDs from request parameters or body.

## Implementation Pattern

### JWT Authentication Dependency

Create a `get_current_user()` dependency that:

```python
from fastapi import Depends, HTTPException, Header
import jwt
from typing import Optional

def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Extract and verify JWT token, return authenticated user_id."""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>" format
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # Verify token using shared secret
        payload = jwt.decode(
            token, 
            BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        
        # Extract user_id from 'sub' claim
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
            
        return user_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
```

### Route Protection Strategy

Apply `Depends(get_current_user)` to EVERY protected endpoint:

```python
@app.get("/api/tasks")
def get_tasks(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # CORRECT: Filter by authenticated user
    tasks = db.query(Task).filter(Task.user_id == current_user).all()
    return tasks

@app.post("/api/tasks")
def create_task(task: TaskCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # CORRECT: Force user_id to authenticated user
    new_task = Task(**task.dict(), user_id=current_user)
    db.add(new_task)
    db.commit()
    return new_task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    # CORRECT: Verify ownership before deletion
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"status": "deleted"}
```

## Database Security Patterns

### Query-Level Isolation

**CORRECT Pattern:**
```python
# Always filter by authenticated user
tasks = db.query(Task).filter(Task.user_id == current_user).all()
```

**WRONG Pattern:**
```python
# NEVER accept user_id from request
tasks = db.query(Task).filter(Task.user_id == request_user_id).all()
```

### Ownership Verification for Updates/Deletes

1. Query with BOTH resource ID AND user_id filter
2. Return 404 if not found (security through obscurity)
3. Never assume frontend has verified ownership

```python
# Verify ownership in single query
resource = db.query(Resource).filter(
    Resource.id == resource_id,
    Resource.user_id == current_user
).first()

if not resource:
    raise HTTPException(status_code=404, detail="Resource not found")
```

## Better Auth Integration

### Shared Secret Configuration

Both frontend and backend must use the SAME secret:

**.env (Backend)**
```bash
BETTER_AUTH_SECRET=your-secret-min-32-characters-cryptographically-random
DATABASE_URL=postgresql://user:pass@host/db
FRONTEND_URL=http://localhost:3000
```

**.env.local (Frontend - Next.js)**
```bash
BETTER_AUTH_SECRET=your-secret-min-32-characters-cryptographically-random
```

### Expected JWT Token Structure

```json
{
  "sub": "user_123",        // User ID (primary identifier)
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1699564800,        // Issued at timestamp
  "exp": 1700169600         // Expiration timestamp
}
```

### Token Verification Algorithm

- **Always use HS256** (HMAC-SHA256) to match Better Auth default
- Handle `jwt.ExpiredSignatureError` separately for better UX
- Provide clear error messages without exposing sensitive details

## API Design Standards

### Endpoint Structure

```
GET    /api/resources          # List user's resources
POST   /api/resources          # Create resource (user_id auto-assigned)
GET    /api/resources/{id}     # Get specific resource (if owned)
PUT    /api/resources/{id}     # Update resource (if owned)
DELETE /api/resources/{id}     # Delete resource (if owned)
```

**Key Rules:**
- Base URL: `/api/`
- Resource naming: Plural nouns
- NO user_id in URLs or parameters
- Authorization via token only

### HTTP Status Codes

- **200 OK**: Successful GET/PUT
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **401 Unauthorized**: Invalid/missing token
- **403 Forbidden**: Authenticated but not allowed (rare)
- **404 Not Found**: Resource doesn't exist OR access denied

### Response Patterns

```python
from pydantic import BaseModel
from datetime import datetime

class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == current_user).all()
    return tasks
```

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Specific origin in production
    allow_credentials=True,
    allow_methods=["*"],  # Restrict in production: ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],  # Restrict in production: ["Authorization", "Content-Type"]
)
```

## Database Models Pattern

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # ALWAYS indexed
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Composite index for common queries
    __table_args__ = (
        Index('ix_tasks_user_id_created_at', 'user_id', 'created_at'),
    )
```

**Key Requirements:**
- Every resource table has `user_id` foreign key
- `user_id` is NEVER nullable
- Add index on `user_id` for query performance
- Include timestamps (`created_at`, `updated_at`)

## Common Security Mistakes to Avoid

### ❌ Never Do This

```python
# WRONG: Accepting user_id from request
@app.get("/api/tasks")
def get_tasks(user_id: str, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return tasks

# WRONG: Fetching all then filtering in Python
@app.get("/api/tasks")
def get_tasks(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    all_tasks = db.query(Task).all()
    user_tasks = [t for t in all_tasks if t.user_id == current_user]
    return user_tasks

# WRONG: Skipping ownership check on DELETE
@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
    return {"status": "deleted"}

# WRONG: Using different secrets
# Backend: SECRET_KEY="abc123"
# Frontend: BETTER_AUTH_SECRET="xyz789"
```

## Project File Structure

```
backend/
├── main.py              # FastAPI app & routes
├── dependencies.py      # get_current_user, get_db
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic request/response models
├── database.py          # DB connection setup
├── config.py            # Environment variables
├── .env                 # BETTER_AUTH_SECRET, DATABASE_URL
└── pyproject.toml       # uv dependencies (fastapi, uvicorn, sqlalchemy, pyjwt, python-dotenv)
```

## Environment Variables Validation

```python
import os
from dotenv import load_dotenv

load_dotenv()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET must be set in environment")
if len(BETTER_AUTH_SECRET) < 32:
    raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in environment")
```

## Debugging Common Issues

### Issue: "Invalid token"
**Cause**: Secret key mismatch between frontend and backend
**Solution**: Verify both .env files use identical `BETTER_AUTH_SECRET`

### Issue: "Token expired"
**Cause**: Token lifetime too short or clock skew
**Solution**: Check Better Auth token expiration config, ensure server clocks synced

### Issue: "Authorization header missing"
**Cause**: Frontend not attaching token to requests
**Solution**: Verify fetch/axios includes: `headers: { Authorization: "Bearer ${token}" }`

### Issue: User can see other users' data
**Cause**: Missing user_id filter in database query
**Solution**: ALWAYS filter by `current_user` in every query

## Production Checklist

- [ ] JWT verification using `get_current_user()` dependency
- [ ] All protected routes use `Depends(get_current_user)`
- [ ] Database queries filter by `user_id`
- [ ] Ownership verification on UPDATE/DELETE
- [ ] CORS configured for production domains only
- [ ] Environment variables validated on startup
- [ ] Pydantic models for request/response
- [ ] Proper HTTP status codes
- [ ] Database indexes on `user_id` columns
- [ ] HTTPS enforced in production
- [ ] Error messages don't expose sensitive data
- [ ] Rate limiting on auth endpoints
- [ ] Logging configured (no sensitive data)
- [ ] Health check endpoint implemented

## Testing Approach

```python
# Test with curl
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/tasks

# Test invalid token
curl -H "Authorization: Bearer invalid_token" \
     http://localhost:8000/api/tasks
# Should return 401 Unauthorized

# Test missing token
curl http://localhost:8000/api/tasks
# Should return 401 Unauthorized

# Verify token at jwt.io
# Paste token and BETTER_AUTH_SECRET to decode and verify signature
```

## Request Lifecycle Flow

```
1. User action in Next.js UI
   ↓
2. Frontend attaches JWT token: Authorization: Bearer <token>
   ↓
3. FastAPI receives request
   ↓
4. get_current_user() extracts & verifies token
   ↓
5. Route handler receives authenticated user_id
   ↓
6. Database query filtered by user_id
   ↓
7. Response returns only user's data
   ↓
8. Frontend receives and displays data

ERROR FLOW:
Invalid/Missing Token → 401 → Frontend redirects to login
```

## Why Backend Authorization Matters

**Q: Why not just check in frontend?**
**A:** Frontend is controlled by the user. Anyone can:
- Open browser DevTools and modify JavaScript
- Send direct API requests bypassing frontend
- Use tools like Postman to craft malicious requests

**Backend is the ONLY trusted security boundary.**

## Advanced: Refresh Token Handling

When token expires during use:
1. Backend returns 401 Unauthorized
2. Frontend catches error
3. Frontend requests new token from Better Auth
4. Frontend retries original request with new token
5. Better Auth handles refresh tokens automatically

## Performance Optimization

```python
# Add indexes for common queries
__table_args__ = (
    Index('ix_tasks_user_created', 'user_id', 'created_at'),
    Index('ix_tasks_user_completed', 'user_id', 'completed'),
)

# Use pagination for large datasets
@app.get("/api/tasks")
def get_tasks(
    skip: int = 0, 
    limit: int = 100,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task)\
        .filter(Task.user_id == current_user)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return tasks

# Use connection pooling
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

## Dependency Management with uv

```toml
# pyproject.toml
[project]
name = "fastapi-backend"
version = "0.1.0"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "pyjwt>=2.8.0",
    "python-dotenv>=1.0.0",
    "psycopg2-binary>=2.9.9",  # for PostgreSQL
]

[tool.uv]
dev-dependencies = [
    "pytest>=7.4.0",
    "httpx>=0.25.0",  # for testing FastAPI
]
```

Install dependencies:
```bash
uv pip install -e .
```

Run the application:
```bash
uv run uvicorn main:app --reload
```

## Security Hardening for Production

1. **Use HTTPS**: Encrypt tokens in transit
2. **Rotate secrets**: Change `BETTER_AUTH_SECRET` periodically
3. **Short expiration**: 1-7 days max for tokens
4. **Rate limiting**: Prevent brute force attacks
5. **Audit logging**: Log authentication failures
6. **CORS restrictions**: Specific domains only
7. **Input validation**: Use Pydantic for all requests
8. **SQL injection protection**: Use ORM parameterized queries

## Additional Resources

For complete implementation examples and more details:
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [JWT Specification](https://jwt.io/introduction)
