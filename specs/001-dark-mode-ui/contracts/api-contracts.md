# API Contracts: Dark Mode Frontend UI

**Feature**: [spec.md](./spec.md)
**Date**: 2026-01-14

## Overview

This document defines the REST API contracts between the frontend UI and the backend server. All endpoints require authentication via JWT Bearer token.

**Base URL**: `process.env.NEXT_PUBLIC_API_URL` or `/api` for same-origin
**Authentication**: Bearer token in `Authorization` header
**Content Type**: `application/json`
**Timeout**: 10 seconds

---

## Authentication

### GET /api/auth/me

**Purpose**: Get current authenticated user information

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK)**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Alex Johnson",
  "email": "alex@example.com"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions

**Usage in Frontend**: Called on page load to display username in navbar

---

### POST /api/auth/logout

**Purpose**: Invalidate current session (logout)

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: None

**Response (204 No Content)**: Empty body

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

**Usage in Frontend**: Called when logout button is clicked

---

## Todo CRUD Operations

### GET /api/todos

**Purpose**: Get all todos for the authenticated user

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**: None (returns all 1-100 todos)

**Response (200 OK)**:
```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implement dashboard UI",
      "description": "Create navbar, todo list, and action buttons",
      "status": "pending",
      "priority": "high",
      "due_date": "2026-01-20T00:00:00Z",
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z",
      "user_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  ]
}
```

**Response (200 OK - Empty List)**:
```json
{
  "todos": []
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token

**Usage in Frontend**: Called on page load to populate todo list

---

### POST /api/todos

**Purpose**: Create a new todo

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "New todo task",
  "description": "Optional description here",
  "priority": "medium",
  "due_date": "2026-01-25T00:00:00Z"
}
```

**Field Requirements**:
- `title`: Required, 1-200 characters
- `description`: Optional, 0-1000 characters
- `priority`: Required, one of: `low`, `medium`, `high`
- `due_date`: Optional, ISO 8601 date string

**Response (201 Created)**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655441000",
  "title": "New todo task",
  "description": "Optional description here",
  "status": "pending",
  "priority": "medium",
  "due_date": "2026-01-25T00:00:00Z",
  "created_at": "2026-01-14T11:00:00Z",
  "updated_at": "2026-01-14T11:00:00Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (missing/invalid fields)
- `401 Unauthorized`: Invalid or expired token

**Error Response Example (400)**:
```json
{
  "error": "Title is required",
  "details": {
    "field": "title",
    "message": "Title must be between 1 and 200 characters"
  }
}
```

**Usage in Frontend**: Called when user submits the "Add Todo" form

---

### PUT /api/todos/:id

**Purpose**: Update an existing todo

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters**:
- `id`: UUID of the todo to update

**Request Body** (all fields optional except at least one provided)**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high",
  "due_date": "2026-01-28T00:00:00Z"
}
```

**Field Requirements**:
- `title`: 1-200 characters if provided
- `description`: 0-1000 characters if provided
- `status`: One of `pending`, `completed` if provided
- `priority`: One of `low`, `medium`, `high` if provided
- `due_date`: ISO 8601 date string if provided

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "high",
  "due_date": "2026-01-28T00:00:00Z",
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T12:00:00Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User does not own this todo
- `404 Not Found`: Todo does not exist

**Usage in Frontend**:
- Called when user edits a todo via modal form
- Called when user clicks "Complete" button (sets status to completed)

---

### DELETE /api/todos/:id

**Purpose**: Delete a todo

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters**:
- `id`: UUID of the todo to delete

**Request Body**: None

**Response (204 No Content)**: Empty body

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: User does not own this todo
- `404 Not Found`: Todo does not exist

**Usage in Frontend**: Called when user confirms deletion of a todo

---

## Error Handling

### Standard Error Response Format

All error responses (except 401 logout redirect) follow this format:

```json
{
  "error": "Human-readable error message",
  "details": {
    "field": "optional field name",
    "message": "optional detailed message"
  }
}
```

### Error Code Reference

| Status Code | Type | Action |
|------------|------|--------|
| 400 | Validation Error | Display inline error message |
| 401 | Unauthorized | Clear session, redirect to sign-in |
| 403 | Forbidden | Display "Access denied" toast |
| 404 | Not Found | Display "Item not found" toast |
| 500 | Server Error | Display "Something went wrong" toast with retry option |

### Global Error Handling (Frontend)

**401/403 Handling**:
```typescript
// Automatically handled by axios interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
```

**Toast Notifications**:
- Success: Show for 3-5 seconds
- Error: Show for 5 seconds
- Multiple notifications: Stack without overlap

---

## Request/Response Examples

### Example 1: Create Todo Flow

**Request**:
```http
POST /api/todos HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Build navbar component",
  "description": "Implement logo, username, and logout button",
  "priority": "high",
  "due_date": "2026-01-18T00:00:00Z"
}
```

**Response**:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "770e8400-e29b-41d4-a716-446655442000",
  "title": "Build navbar component",
  "description": "Implement logo, username, and logout button",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-01-18T00:00:00Z",
  "created_at": "2026-01-14T13:00:00Z",
  "updated_at": "2026-01-14T13:00:00Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Example 2: Complete Todo Flow

**Request**:
```http
PUT /api/todos/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "completed"
}
```

**Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implement dashboard UI",
  "description": "Create navbar, todo list, and action buttons",
  "status": "completed",
  "priority": "high",
  "due_date": "2026-01-20T00:00:00Z",
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T13:30:00Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Example 3: Delete Todo Flow

**Request**:
```http
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```http
HTTP/1.1 204 No Content
```

---

## Integration Notes

### Debouncing Rapid Clicks

Per spec requirement FR-030, prevent duplicate operations by:
1. Setting `isSubmitting` state on first click
2. Disabling button while submitting
3. Re-enabling on success or error

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleComplete = async (id: string) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  try {
    await updateTodo(id, { status: TodoStatus.COMPLETED });
    toast({ message: "Todo completed", type: NotificationType.SUCCESS });
  } catch (error) {
    toast({ message: "Failed to complete todo", type: NotificationType.ERROR });
  } finally {
    setIsSubmitting(false);
  }
};
```

### Optimistic UI Updates

For better UX, consider optimistic updates (optional):
1. Update local state immediately
2. Call API
3. Rollback on error

### Loading States

Display skeleton screens while fetching:
- Initial load: Show 3-5 skeleton items
- CRUD operations: Show inline loading state on affected item

---

## Versioning

This document describes API version 1.0. Future versions will be documented separately.
