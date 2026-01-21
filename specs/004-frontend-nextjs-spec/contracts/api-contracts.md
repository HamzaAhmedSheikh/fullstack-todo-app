# API Contracts: Task Management Backend Integration

**Feature**: 004-frontend-nextjs-spec
**Date**: 2026-01-06
**Backend Spec**: 002-fullstack-task-management

## Overview

This document defines the REST API contracts between the Next.js frontend and the FastAPI backend. All endpoints follow RESTful conventions with JWT authentication via Better Auth.

## Base Configuration

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;  // e.g., "http://localhost:8000"

// Auth headers automatically attached to all requests
interface AuthHeaders {
  Authorization: `Bearer ${jwt_token}`;
  'Content-Type': 'application/json';
}
```

## API Endpoints

### 1. Authentication Endpoints

#### POST /auth/signup
**Description**: Register a new user account.

**Request**:
```typescript
interface SignupRequest {
  email: string;      // Valid email format
  password: string;   // Min 8 characters
}
```

**Response (200 OK)**:
```typescript
interface SignupResponse {
  user: {
    id: string;       // UUID - User identifier
    email: string;    // User email
  };
  session: {
    token: string;    // JWT token
    expires_at: string;  // ISO timestamp
  };
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format or password too short
- `409 Conflict`: Email already registered
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
await api.post('/auth/signup', { email, password });
// Redirect to /dashboard on success
```

---

#### POST /auth/signin
**Description**: Authenticate an existing user.

**Request**:
```typescript
interface SigninRequest {
  email: string;      // Valid email format
  password: string;
}
```

**Response (200 OK)**:
```typescript
interface SigninResponse {
  user: {
    id: string;
    email: string;
  };
  session: {
    token: string;
    expires_at: string;
  };
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid email or password (same message for security)
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
await api.post('/auth/signin', { email, password });
// Redirect to /dashboard on success
```

---

#### POST /auth/logout
**Description**: End user session.

**Headers**: Authorization required

**Response (200 OK)**:
```typescript
interface LogoutResponse {
  message: string;  // "Logged out successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token

**Frontend Usage**:
```typescript
await api.post('/auth/logout');
// Clear local session, redirect to /signin
```

---

### 2. Task Endpoints

All task endpoints require authentication via JWT token in `Authorization` header.

#### GET /api/{user_id}/tasks
**Description**: Fetch all tasks for a user.

**Path Parameters**:
- `user_id` (string): UUID of the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK)**:
```typescript
interface GetTasksResponse {
  tasks: Task[];
}

interface Task {
  id: string;              // UUID
  user_id: string;         // UUID
  title: string;           // Max 200 chars
  description: string;     // Max 500 chars, optional
  completed: boolean;
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: user_id doesn't match token claims
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
const { tasks } = await api.get<Task[]>(`/api/${user_id}/tasks`);
// Sort by created_at descending if not already sorted
```

---

#### POST /api/{user_id}/tasks
**Description**: Create a new task.

**Path Parameters**:
- `user_id` (string): UUID of the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```typescript
interface CreateTaskRequest {
  title: string;           // Required, 1-200 chars
  description?: string;    // Optional, 0-500 chars
}
```

**Response (201 Created)**:
```typescript
interface CreateTaskResponse {
  task: Task;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (title too long/empty)
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: user_id doesn't match token claims
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
const { task } = await api.post<Task>(`/api/${user_id}/tasks`, {
  title,
  description,
});
// Optimistic update: Add to local state, then replace with server response
```

---

#### PUT /api/{user_id}/tasks/{task_id}
**Description**: Update an existing task.

**Path Parameters**:
- `user_id` (string): UUID of the authenticated user
- `task_id` (string): UUID of the task to update

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```typescript
interface UpdateTaskRequest {
  title: string;           // Required, 1-200 chars
  description: string;     // Optional, 0-500 chars
}
```

**Response (200 OK)**:
```typescript
interface UpdateTaskResponse {
  task: Task;
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: user_id doesn't match token claims or task doesn't belong to user
- `404 Not Found`: Task doesn't exist
- `409 Conflict`: Concurrent update (optimistic locking)
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
const { task } = await api.put<Task>(
  `/api/${user_id}/tasks/${taskId}`,
  { title, description }
);
// Update local state with new task data
```

---

#### DELETE /api/{user_id}/tasks/{task_id}
**Description**: Delete a task.

**Path Parameters**:
- `user_id` (string): UUID of the authenticated user
- `task_id` (string): UUID of the task to delete

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response (204 No Content)**:
Empty response body

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: user_id doesn't match token claims or task doesn't belong to user
- `404 Not Found`: Task doesn't exist
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
await api.delete(`/api/${user_id}/tasks/${taskId}`);
// Optimistic update: Remove from local state with fade-out animation
// On 404: Already removed, no action needed
```

---

#### PATCH /api/{user_id}/tasks/{task_id}/complete
**Description**: Toggle task completion status.

**Path Parameters**:
- `user_id` (string): UUID of the authenticated user
- `task_id` (string): UUID of the task

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```typescript
interface ToggleCompletionRequest {
  completed: boolean;  // New completion status
}
```

**Response (200 OK)**:
```typescript
interface ToggleCompletionResponse {
  task: Task;
}
```

**Error Responses**:
- `400 Bad Request`: Invalid completed value
- `401 Unauthorized**: Invalid or expired token
- `403 Forbidden**: user_id doesn't match token claims or task doesn't belong to user
- `404 Not Found`: Task doesn't exist
- `409 Conflict`: Concurrent update (optimistic locking)
- `500 Internal Server Error`: Server error

**Frontend Usage**:
```typescript
// Optimistic update: Update local state immediately
const { task } = await api.patch<Task>(
  `/api/${user_id}/tasks/${taskId}/complete`,
  { completed: !currentStatus }
);
// On success: Keep optimistic state
// On failure: Revert to previous state, show error toast
```

---

## Error Response Format

All error responses follow this format:

```typescript
interface ErrorResponse {
  message: string;      // User-friendly error message
  detail?: string;      // Optional technical details (development only)
  error?: string;       // Optional error code
}
```

**Examples**:
```json
// 401 Unauthorized
{
  "message": "Invalid or expired token"
}

// 403 Forbidden
{
  "message": "Access denied"
}

// 404 Not Found
{
  "message": "Task not found"
}

// 409 Conflict
{
  "message": "Task was updated by another session. Please refresh and try again"
}

// 500 Internal Server Error
{
  "message": "Internal server error"
}
```

---

## Authentication Flow

### JWT Token Management

**Token Storage** (managed by Better Auth):
1. HTTP-only cookie (primary, more secure)
2. localStorage fallback if cookies unavailable

**Token Attachment**:
```typescript
// lib/api.ts
const getAuthHeaders = async () => {
  const session = await getSession();  // Better Auth function
  return {
    Authorization: `Bearer ${session?.token}`,
    'Content-Type': 'application/json',
  };
};
```

**Session Refresh**:
- Better Auth handles token refresh automatically
- Frontend uses `getSession()` to get current session
- On 401: Redirect to `/signin`, clear session

**User ID Extraction**:
```typescript
// From JWT claims
const user_id = session?.user?.id;  // From Better Auth session object
```

---

## Request/Response Examples

### Signup Flow

```typescript
// Request
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

// Success Response (200 OK)
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-01-13T10:00:00Z"
  }
}

// Error Response (409 Conflict)
{
  "message": "Email already registered"
}
```

### Create Task Flow

```typescript
// Request
POST /api/550e8400-e29b-41d4-a716-446655440000/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter"
}

// Success Response (201 Created)
{
  "task": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, butter",
    "completed": false,
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T10:00:00Z"
  }
}
```

### Toggle Task Completion Flow

```typescript
// Request
PATCH /api/550e8400-e29b-41d4-a716-446655440000/tasks/660e8400-e29b-41d4-a716-446655440001/complete
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "completed": true
}

// Success Response (200 OK)
{
  "task": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, butter",
    "completed": true,
    "created_at": "2026-01-06T10:00:00Z",
    "updated_at": "2026-01-06T10:05:00Z"
  }
}
```

---

## CORS Configuration

Backend must allow requests from frontend origin:

```typescript
// Backend CORS headers (FastAPI example)
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

**Environment Variable**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Development
NEXT_PUBLIC_API_URL=https://api.example.com  # Production
```

---

## Rate Limiting

**Status**: Not specified in backend spec for Phase II

**Future Consideration**:
- Rate limit API requests to prevent abuse
- Implement backoff strategy on 429 Too Many Requests
- Display user-friendly message on rate limit exceeded

---

## Retries and Timeouts

**Retry Strategy**:
```typescript
interface RetryConfig {
  maxRetries: 3;           // Max retry attempts
  retryDelay: 1000;        // Delay between retries (ms)
  retryableStatuses: [408, 429, 500, 502, 503, 504];
}
```

**Timeout Configuration**:
```typescript
interface TimeoutConfig {
  connectionTimeout: 10000;   // 10 seconds
  requestTimeout: 30000;      // 30 seconds
}
```

**Retry Logic**:
- Network errors: Retry up to 3 times
- 5xx errors: Retry up to 3 times
- 4xx errors: Do not retry (user error)
- Show retry button in UI for manual retry

---

## Summary

**Total Endpoints**: 9
- Authentication: 3 (signup, signin, logout)
- Task CRUD: 5 (list, create, update, delete, toggle completion)
- All endpoints require JWT authentication except signup

**Authentication**: Better Auth JWT (HTTP-only cookies preferred)

**Response Format**: JSON with consistent error structure

**Status Codes**:
- 2xx: Success (200, 201, 204)
- 4xx: Client error (400, 401, 403, 404, 409)
- 5xx: Server error (500)

**Optimistic Updates**: Supported for create, toggle, delete

**Version**: Based on backend spec 002-fullstack-task-management
