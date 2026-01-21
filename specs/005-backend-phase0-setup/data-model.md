# Data Model: Backend Phase 0 - Task Management System

**Feature**: Backend Phase 0 - Verification and Initial Setup
**Date**: 2026-01-07
**Status**: Complete

## Overview

This document defines the data entities for the secure multi-user Todo API. The system manages tasks with strict user isolation enforced at the database query level.

---

## Entity: Task

**Purpose**: Represents a todo task owned by a single user

**SQLModel Definition**:
```python
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """
    Task entity for user's todo items

    Security: ALWAYS filter queries by user_id to ensure isolation
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)  # FK to users.id (managed by Better Auth)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | int | Primary Key, Auto-increment | Unique task identifier |
| `user_id` | str | Foreign Key, Indexed, NOT NULL | References users.id from Better Auth users table |
| `title` | str | Max 200 chars, NOT NULL | Task title/summary |
| `description` | str | Max 1000 chars, NULL | Optional detailed description |
| `completed` | bool | Default False | Task completion status |
| `created_at` | datetime | Auto-set on creation | Timestamp when task was created |
| `updated_at` | datetime | Auto-update on modification | Timestamp of last update |

### Indexes

- **Primary Index**: `id` (auto-created with primary key)
- **User Index**: `user_id` (CRITICAL for query performance on filtered queries)

### Constraints

- **Title Validation**: 1-200 characters, cannot be empty
- **Description Validation**: 0-1000 characters, optional
- **user_id Validation**: Must match authenticated user from JWT (enforced in application layer)
- **Completed Validation**: Boolean only (True/False)

### Relationships

- **User → Tasks**: One-to-Many
  - One user can have many tasks
  - Task.user_id → User.id (Foreign Key)
  - Cascade: When user is deleted, their tasks are deleted (handled by Better Auth)

---

## Entity: User (Reference Only)

**Purpose**: User accounts managed by Better Auth (NOT managed by this backend)

**Note**: This backend ONLY READS from the users table. Better Auth manages all user CRUD operations.

**Reference Schema** (for understanding only, not created by this backend):
```python
class User:
    """
    User entity managed by Better Auth

    Backend READ-ONLY: We only query this table, never INSERT/UPDATE/DELETE
    """
    id: str  # Primary Key (UUID or similar from Better Auth)
    email: str  # User's email address
    name: str  # User's display name
    # ... other fields managed by Better Auth
```

### Backend Usage

The backend interacts with User entity ONLY through:

1. **JWT Token**: Contains `user_id` (from `sub` claim)
2. **Query Filtering**: Filter tasks by `task.user_id` to match authenticated user
3. **Read-Only Queries**: May query users table for user details (name, email) but NEVER modify

**Example**:
```python
# ✅ ALLOWED: Read user info
user_id = get_current_user()  # From JWT
user = db.query(User).filter(User.id == user_id).first()

# ❌ FORBIDDEN: Create/Update/Delete users
# user = User(email="test@example.com")  # NEVER do this!
# db.add(user)  # Better Auth handles this
```

---

## Validation Rules

### Task Title

- **Min Length**: 1 character
- **Max Length**: 200 characters
- **Required**: Yes (cannot be NULL or empty)
- **Format**: Any UTF-8 string

**Valid Examples**:
- "Buy groceries"
- "Complete project report by Friday"
- "Call mom 🎂"

**Invalid Examples**:
- "" (empty string)
- NULL
- String longer than 200 characters

### Task Description

- **Min Length**: 0 characters (optional field)
- **Max Length**: 1000 characters
- **Required**: No (can be NULL)
- **Format**: Any UTF-8 string

**Valid Examples**:
- NULL (description omitted)
- "" (empty string, same as NULL)
- "Milk, eggs, bread, butter, orange juice"
- Long detailed description up to 1000 chars

### Task Completed

- **Type**: Boolean
- **Values**: True or False
- **Default**: False (new tasks are incomplete)
- **Required**: Yes (but auto-defaults to False)

### User ID

- **Type**: String (matches Better Auth user ID format)
- **Validation**: MUST match `sub` claim from JWT token
- **Security**: CRITICAL - enforced in application layer before every query

---

## State Transitions

### Task Lifecycle

```
┌─────────┐
│ Created │
│completed│
│ = False │
└────┬────┘
     │
     ▼
┌─────────────┐      PATCH /api/{user_id}/tasks/{id}/complete      ┌─────────┐
│  Incomplete │ ──────────────────────────────────────────────────▶│Complete │
│ completed   │                                                      │completed│
│  = False    │                                                      │ = True  │
└─────────────┘◀──────────────────────────────────────────────────┘─────────┘
                     PATCH /api/{user_id}/tasks/{id}/complete
                     (toggles state)

     │                                                                     │
     │                                                                     │
     ▼                                                                     ▼
  [DELETE]                                                             [DELETE]
```

**Valid Operations**:
1. **Create**: New task starts with `completed = False`
2. **Update**: Can change title, description, completed status via PUT
3. **Toggle Complete**: PATCH /complete toggles `completed` boolean
4. **Delete**: Remove task from database

---

## Query Patterns

### Security-First Query Pattern

**CRITICAL**: All task queries MUST filter by authenticated user_id

```python
from sqlmodel import Session, select
from app.models import Task

def get_user_tasks(user_id: str, db: Session):
    """
    Get all tasks for specific user

    SECURITY: ALWAYS filter by user_id
    """
    # ✅ CORRECT: Filtered by user_id
    statement = select(Task).where(Task.user_id == user_id)
    tasks = db.exec(statement).all()
    return tasks

    # ❌ FORBIDDEN: No user_id filter - exposes all users' tasks!
    # tasks = db.exec(select(Task)).all()
```

### Example Queries

**Get all tasks for user**:
```python
tasks = db.exec(
    select(Task)
    .where(Task.user_id == current_user)
).all()
```

**Get single task (with ownership check)**:
```python
task = db.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user)  # CRITICAL
).first()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Get incomplete tasks only**:
```python
incomplete_tasks = db.exec(
    select(Task)
    .where(Task.user_id == current_user)
    .where(Task.completed == False)
).all()
```

**Update task (with ownership check)**:
```python
# First verify ownership
task = db.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user)
).first()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")

# Then update
task.title = "Updated title"
task.updated_at = datetime.utcnow()
db.add(task)
db.commit()
```

**Delete task (with ownership check)**:
```python
task = db.exec(
    select(Task)
    .where(Task.id == task_id)
    .where(Task.user_id == current_user)
).first()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")

db.delete(task)
db.commit()
```

---

## Request/Response Schemas

### TaskCreate (POST request body)

```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    """Schema for creating a new task"""
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)

    class Config:
        schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        }
```

### TaskUpdate (PUT request body)

```python
class TaskUpdate(BaseModel):
    """Schema for updating an existing task"""
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool

    class Config:
        schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread, butter",
                "completed": False
            }
        }
```

### TaskResponse (API response)

```python
from datetime import datetime

class TaskResponse(BaseModel):
    """Schema for task API responses"""
    id: int
    user_id: str
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True  # Allow SQLModel → Pydantic conversion
        schema_extra = {
            "example": {
                "id": 1,
                "user_id": "user-123",
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2024-01-07T10:00:00Z",
                "updated_at": "2024-01-07T10:00:00Z"
            }
        }
```

---

## Database Migration

### Initial Migration (Phase 1)

```sql
-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Add foreign key to users table (managed by Better Auth)
-- Note: Better Auth should have already created the users table
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_user_id
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;  -- Delete tasks when user is deleted
```

### Automatic Timestamp Update (Optional)

```sql
-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update on task modification
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Summary

### Entities

1. **Task**: Core entity managed by this backend (full CRUD)
2. **User**: Reference entity managed by Better Auth (read-only)

### Key Constraints

- Title: 1-200 chars, required
- Description: 0-1000 chars, optional
- user_id: Foreign key to users.id, indexed
- completed: Boolean, defaults to False

### Security Model

- **Query Filtering**: ALWAYS filter by `user_id`
- **Path Validation**: Verify path `user_id` matches JWT `user_id`
- **Error Responses**: 403 Forbidden for user_id mismatch, 404 Not Found only after ownership verified

### Testing Focus

- User isolation: User A cannot access User B's tasks
- Validation: Title/description length constraints
- State transitions: Task lifecycle (create → update → toggle → delete)

**Ready for API Implementation**: Data model defined, validation rules clear, query patterns documented.
