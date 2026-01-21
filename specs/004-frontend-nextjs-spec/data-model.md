# Data Model: Next.js Frontend Task Management

**Feature**: 004-frontend-nextjs-spec
**Date**: 2026-01-06
**Status**: Complete

## Overview

This document defines the data models, entities, validation rules, and state transitions used in the Next.js frontend application. These models mirror the backend API contracts while providing TypeScript type safety for the frontend.

## Core Entities

### 1. User Session

Represents the authenticated user session managed by Better Auth.

```typescript
interface UserSession {
  // JWT claims extracted from session
  user_id: string;      // UUID - User identifier
  email: string;         // User email address
  token?: string;        // JWT token (if accessible via Better Auth)
  expires_at: string;    // ISO timestamp - Token expiration (7 days default)
}

// Session state in AuthContext
interface AuthState {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Session actions
interface AuthActions {
  signup: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

**Validation Rules**:
- Email: Must match standard email regex
- Password: Minimum 8 characters
- Session: Invalid on 401 Unauthorized response

**State Transitions**:
```
Initial → Loading → [Success: Authenticated] → [Expire: Unauthenticated]
          ↘ [Error: Unauthenticated]
```

### 2. Task

Represents a task in the UI, matching the backend Task model.

```typescript
interface Task {
  // From backend API
  id: string;              // UUID - Unique task identifier
  user_id: string;         // UUID - Owner of the task
  title: string;           // Required, max 200 chars, trimmed
  description: string;     // Optional, max 500 chars, trimmed, can be empty
  completed: boolean;      // Completion status
  created_at: string;      // ISO timestamp - Creation time
  updated_at: string;      // ISO timestamp - Last update time
}

// Task creation payload (POST /api/{user_id}/tasks)
interface CreateTaskInput {
  title: string;           // Required, 1-200 chars after trim
  description?: string;    // Optional, 0-500 chars after trim
}

// Task update payload (PUT /api/{user_id}/tasks/{task_id})
interface UpdateTaskInput {
  title: string;           // Required, 1-200 chars after trim
  description: string;     // Optional, 0-500 chars after trim
}

// Task completion toggle (PATCH /api/{user_id}/tasks/{task_id}/complete)
interface ToggleTaskCompletionInput {
  completed: boolean;      // New completion status
}
```

**Validation Rules**:
- `title`: Required, trimmed whitespace, 1-200 characters
- `description`: Optional, trimmed whitespace, 0-500 characters
- `id`: UUID format (v4)
- `user_id`: UUID format (v4), matches current session user_id

**State Transitions**:
```
Created → [Edit] → Updated → [Toggle Complete] → Completed
          ↘ [Delete] → Deleted
```

### 3. Task List State

State for managing the user's task list in the TaskContext.

```typescript
interface TaskState {
  tasks: Task[];                    // Array of tasks, sorted by created_at (newest first)
  loading: boolean;                 // Fetching tasks
  error: string | null;             // Error message
  selectedTask: Task | null;        // Currently selected task for editing
  isCreateModalOpen: boolean;       // Create modal visibility
  isEditModalOpen: boolean;         // Edit modal visibility
}

interface TaskActions {
  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  selectTask: (task: Task | null) => void;
}
```

**Sorting Rules**:
- Default: Sort by `created_at` descending (newest first)
- Client-side sorting if backend doesn't return sorted data

### 4. API Error

Structured error response from backend API.

```typescript
interface ApiError {
  message: string;      // User-friendly error message
  status: number;       // HTTP status code
  code?: string;        // Optional error code
  details?: unknown;    // Optional additional error details
}

// API Response wrapper
type ApiResponse<T> = T | ApiError;
```

**Error Categories**:
- **401 Unauthorized**: Session expired, invalid token
- **403 Forbidden**: Access denied (wrong user)
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Concurrent update (optimistic locking)
- **500 Server Error**: Backend failure
- **Network Error**: Connection failed, timeout

## UI State Models

### 1. Form State

Generic form state for signup, signin, create, and edit forms.

```typescript
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'email' | 'password' | 'text' | 'textarea';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  validate?: (value: string) => string | null; // Returns error message or null
}
```

### 2. Modal State

State for modal dialogs (create, edit, delete confirmation).

```typescript
interface ModalState {
  isOpen: boolean;
  isClosing: boolean;  // For animation
  data?: unknown;      // Modal-specific data (e.g., task being edited)
}

interface ConfirmationDialogState extends ModalState {
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

### 3. Toast State

State for toast notifications (managed by Sonner).

```typescript
type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;  // Default: 3000ms
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### 4. Loading State

State for loading indicators and skeletons.

```typescript
interface LoadingState {
  isLoading: boolean;
  delay?: number;  // Delay before showing spinner (for perceived performance)
  error?: string;
}

// Skeleton state (for task list)
interface SkeletonState {
  count: number;     // Number of skeleton items to show
}
```

## Relationships

### User → Tasks (One-to-Many)
- One `UserSession` can have many `Task` entities
- Foreign key: `Task.user_id` references `UserSession.user_id`
- Frontend validation: Only fetch/update tasks where `user_id` matches current session

### Task → Comments (Future)
- Not implemented in Phase II
- Relationship reserved for future extension

## Validation Constraints

### Client-Side Validation Rules

| Entity | Field | Constraints | Error Message |
|--------|-------|-------------|---------------|
| UserSession | email | Valid email format | "Please enter a valid email" |
| UserSession | password | Min 8 characters | "Password must be at least 8 characters" |
| Task | title | Required, trimmed, 1-200 chars | "Title is required" / "Title must be 200 characters or less" |
| Task | description | Optional, trimmed, 0-500 chars | "Description must be 500 characters or less" |
| Task | user_id | UUID format, matches session | N/A (server-side) |

### Input Sanitization

1. **Whitespace Handling**:
   - Trim leading/trailing whitespace from `title` and `description`
   - Treat whitespace-only strings as empty (invalid for title)

2. **Character Encoding**:
   - Preserve emojis and special characters
   - Do NOT sanitize on client-side (backend responsibility)
   - UTF-8 encoding for all API requests

3. **Length Enforcement**:
   - Title: Truncate at 200 characters with counter showing "200/200"
   - Description: Truncate at 500 characters with counter

## State Management Architecture

### Context Providers

```typescript
// AuthContext Provider
// Location: /lib/context/AuthContext.tsx
// Provides: AuthState + AuthActions
// Scope: Wraps entire application in root layout
// Lifecycle: Persists across route changes

// TaskContext Provider
// Location: /lib/context/TaskContext.tsx
// Provides: TaskState + TaskActions
// Scope: Wraps dashboard routes only (protected routes)
// Lifecycle: Re-fetches on mount, updates on mutations
```

### Custom Hooks

```typescript
// hooks/useAuth.ts
// Usage: const { user, loading, signin, signup, logout } = useAuth()
// Purpose: Consume AuthContext

// hooks/useTasks.ts
// Usage: const { tasks, loading, createTask, deleteTask } = useTasks()
// Purpose: Consume TaskContext

// hooks/useToast.ts
// Usage: const toast = useToast()
// Purpose: Toast notifications (wraps Sonner)

// hooks/useForm.ts (optional)
// Usage: const { values, errors, handleSubmit, handleChange } = useForm()
// Purpose: Generic form state management
```

## API Client Types

### Request Types

```typescript
interface ApiClientConfig {
  baseUrl: string;           // NEXT_PUBLIC_API_URL
  getAuthHeaders: () => Record<string, string>;  // Attach JWT
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;         // API path (e.g., `/api/${user_id}/tasks`)
  body?: unknown;           // Request payload
  headers?: Record<string, string>;
}
```

### Response Types

```typescript
interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body: unknown): Promise<T>;
  put<T>(endpoint: string, body: unknown): Promise<T>;
  patch<T>(endpoint: string, body: unknown): Promise<T>;
  delete(endpoint: string): Promise<void>;
}
```

## Optimistic Updates

For operations requiring immediate UI feedback:

### Task Creation
- Add new task to local state immediately
- API call in background
- On success: Keep optimistic task, replace with server response
- On failure: Remove optimistic task, show error toast

### Task Completion Toggle
- Update task.completed in local state immediately
- API call in background
- On success: Keep optimistic state
- On failure: Revert to previous state, show error toast

### Task Deletion
- Remove task from local state with fade-out animation
- API call in background
- On success: Task remains removed
- On failure: Restore task, show error toast

## Virtual Scrolling Data

For large task lists (1000+ tasks):

```typescript
interface VirtualListItem {
  index: number;      // Item index in array
  size?: number;      // Estimated height for dynamic sizing
  data: Task;         // Actual task data
}

interface VirtualListProps {
  items: Task[];
  renderItem: (task: Task, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside viewport (default: 3)
}
```

## Type Export Summary

All types are exported from `/lib/types.ts` for reuse across the application:

```typescript
// User & Auth
export type { UserSession, AuthState, AuthActions };

// Task Entities
export type { Task, CreateTaskInput, UpdateTaskInput, ToggleTaskCompletionInput };

// State Management
export type { TaskState, TaskActions, FormState, ModalState };

// API
export type { ApiError, ApiResponse, ApiClient, RequestOptions };

// UI
export type { ToastOptions, LoadingState, ConfirmationDialogState };
```

## Validation Summary

✅ All entities have TypeScript interfaces
✅ All fields have validation rules defined
✅ State transitions documented
✅ Relationships clear (User → Tasks)
✅ Client-side validation matches backend constraints
✅ Optimistic update patterns defined
✅ API contract types aligned with backend spec
