# Data Model: Dark Mode Frontend UI

**Feature**: [spec.md](./spec.md)
**Date**: 2026-01-14

## Entity Definitions

### Todo Item

**Description**: A task containing title, description, status, priority, and optional due date. Each todo belongs to exactly one user.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string | Yes | UUID format | Unique identifier for the todo |
| title | string | Yes | 1-200 characters | Display title of the todo |
| description | string | No | 0-1000 characters | Optional detailed description |
| status | enum | Yes | pending, completed | Current state of the todo |
| priority | enum | Yes | low, medium, high | Importance level of the todo |
| due_date | string \| null | No | ISO 8601 date or null | Optional due date for the todo |
| created_at | string | Yes | ISO 8601 datetime | Timestamp when todo was created |
| updated_at | string | Yes | ISO 8601 datetime | Timestamp when todo was last modified |
| user_id | string | Yes | UUID format | ID of the user who owns this todo |

**Validation Rules**:
- Title must not be empty
- Title length: 1-200 characters
- Description length: 0-1000 characters (if provided)
- due_date must be in the future (or present, optional)
- Status transitions: pending → completed (one-way), completed cannot revert to pending
- Priority is immutable after creation (unless editing entire todo)

**State Transitions**:

```
pending → completed
  (User marks todo as complete)
```

**Example**:
```json
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
```

---

### User

**Description**: An authenticated person with a name displayed in the navbar who owns and manages their own todos.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string | Yes | UUID format | Unique identifier for the user |
| name | string | Yes | 1-100 characters | Display name (shown in navbar) |
| email | string | Yes | Valid email format | User's email address (for auth) |

**Validation Rules**:
- Name must not be empty
- Name length: 1-100 characters
- Email must be valid format (RFC 5322)
- Name is truncated with ellipsis in navbar if > 30 characters

**Example**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Alex Johnson",
  "email": "alex@example.com"
}
```

---

### Notification

**Description**: A temporary message displayed to provide feedback on user actions (success, error, info).

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string | Yes | Auto-generated | Internal identifier for the notification |
| type | enum | Yes | success, error, info | Type of notification |
| message | string | Yes | 1-200 characters | Human-readable message |
| duration | number | Yes | 3000-5000 ms | Auto-dismiss duration |

**Validation Rules**:
- Message must not be empty
- Message length: 1-200 characters
- Duration: 3000-5000ms (3-5 seconds) per spec
- Multiple notifications stack without overlapping

**Example**:
```json
{
  "id": "toast_001",
  "type": "success",
  "message": "Todo created successfully",
  "duration": 4000
}
```

---

## Relationships

```
User (1) ────── (∞) Todo Item
  │ owns
  │

Todo Item (1) ────── (1) Priority
Todo Item (1) ────── (1) Status
```

**Explanation**:
- One user can have many todos (1-100 per spec)
- Each todo belongs to exactly one user
- Priority and Status are enums, not entities

---

## Component State Models

### Navbar Component

**State**:
```typescript
interface NavbarState {
  username: string;         // From current user session
  isAuthenticated: boolean;   // True after successful auth
  isMobileMenuOpen: boolean; // For mobile hamburger menu (optional)
}
```

**Props**:
```typescript
interface NavbarProps {
  onLogout: () => void;      // Logout handler
  username?: string;          // Optional (fallback to session)
}
```

---

### Todo List Component

**State**:
```typescript
interface TodoListState {
  todos: TodoItem[];          // Array of todos (max 100)
  isLoading: boolean;          // Loading state for skeleton
  error: string | null;        // Error message if any
}
```

**Props**:
```typescript
interface TodoListProps {
  onCreate: (todo: Partial<TodoItem>) => void;     // Add todo handler
  onUpdate: (id: string, todo: Partial<TodoItem>) => void; // Edit handler
  onDelete: (id: string) => void;                 // Delete handler
  onComplete: (id: string) => void;                // Complete handler
}
```

---

### Todo Item Component

**State**:
```typescript
interface TodoItemState {
  isHovered: boolean;        // For showing/hiding action buttons
  isExpanded: boolean;       // For showing full title/description
}
```

**Props**:
```typescript
interface TodoItemProps {
  todo: TodoItem;            // The todo item data
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}
```

---

### Todo Form Component (Add/Edit Modal)

**State**:
```typescript
interface TodoFormState {
  title: string;              // Form field
  description: string;        // Form field
  priority: Priority;          // Form field
  dueDate: string | null;     // Form field (ISO date)
  isSubmitting: boolean;       // Submitting state
  validationErrors: { [field: string]: string }; // Validation errors
}
```

**Props**:
```typescript
interface TodoFormProps {
  mode: 'create' | 'edit';   // Form mode
  initialData?: TodoItem;       // Pre-fill data for edit mode
  onSubmit: (data: Partial<TodoItem>) => void;
  onCancel: () => void;
}
```

---

### Empty State Component

**State**:
```typescript
interface EmptyStateState {
  // No state, purely presentational
}
```

**Props**:
```typescript
interface EmptyStateProps {
  onCreateTodo: () => void;     // CTA button handler
}
```

---

### Loading State Component

**State**:
```typescript
interface LoadingStateState {
  // No state, purely presentational
}
```

**Props**:
```typescript
interface LoadingStateProps {
  count: number;               // Number of skeleton items to show (3-5)
}
```

---

## TypeScript Type Definitions

**Export from**: `frontend/src/lib/types.ts`

```typescript
// Enums
export enum TodoStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

// Entity Interfaces
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

// Component Props Interfaces
export interface NavbarProps {
  onLogout: () => void;
  username?: string;
}

export interface TodoListProps {
  onCreate: (todo: Partial<TodoItem>) => void;
  onUpdate: (id: string, todo: Partial<TodoItem>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export interface TodoItemProps {
  todo: TodoItem;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export interface TodoFormProps {
  mode: 'create' | 'edit';
  initialData?: TodoItem;
  onSubmit: (data: Partial<TodoItem>) => void;
  onCancel: () => void;
}

export interface EmptyStateProps {
  onCreateTodo: () => void;
}

export interface LoadingStateProps {
  count?: number;
}
```

---

## Data Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Interacts
       ▼
┌─────────────────────────────────────────────┐
│           Frontend UI Layer            │
│  ┌───────────────────────────────────┐ │
│  │  Components (React/Next.js)      │ │
│  │  - Navbar, TodoList, TodoItem    │ │
│  │  - TodoForm, EmptyState, Loading │ │
│  └───────────────┬───────────────────┘ │
│                  │                     │
│  ┌───────────────▼───────────────────┐ │
│  │  State (React Hooks)              │ │
│  │  - useTodos()                    │ │
│  │  - useToast()                    │ │
│  └───────────────┬───────────────────┘ │
└──────────────────┼───────────────────────┘
                   │
                   │ API Calls (axios)
                   ▼
┌─────────────────────────────────────────────┐
│       Backend REST API                   │
│  (Authenticated via JWT)                │
└─────────────────────────────────────────────┘
```
