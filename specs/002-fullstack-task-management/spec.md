# Feature Specification: Full-Stack Task Management System (Phase II)

**Feature Branch**: `002-fullstack-task-management`
**Created**: 2025-12-19
**Status**: Draft
**Input**: User description: "Phase II: Todo Full-Stack Web Application (Backend-Focused Spec) - Transform the existing single-user console todo application into a modern, multi-user web application with persistent storage, authentication using Better Auth-issued JWTs, RESTful API design, secure task CRUD operations, per-user data isolation, and PostgreSQL persistence via Neon Serverless. Backend implemented using Python FastAPI with SQLModel ORM."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Authentication (Priority: P1)

As a new user, I want to register an account and authenticate so that I can access my personal task management system. This is the foundational capability that enables multi-user support and data isolation.

**Why this priority**: Authentication is the gateway to all other functionality. Without user accounts, there's no way to isolate data or provide personalized task management. This must work before any task operations are meaningful.

**Independent Test**: A user can register via the frontend, receive a JWT from Better Auth, and use that JWT to make authenticated API calls to the backend.

**Acceptance Scenarios**:

1. **Given** I am a new user on the registration page, **When** I provide valid credentials (email, password), **Then** my account is created and I receive a JWT token for authentication.
2. **Given** I have valid credentials, **When** I log in through Better Auth, **Then** I receive a signed JWT containing my user identity.
3. **Given** I have a valid JWT, **When** I make an API request with the token in the Authorization header, **Then** the backend verifies the token and grants access.
4. **Given** I make an API request without a JWT, **When** the backend processes the request, **Then** I receive HTTP 401 Unauthorized.
5. **Given** I provide an expired or invalid JWT, **When** the backend verifies the token, **Then** I receive HTTP 401 Unauthorized.

---

### User Story 2 - Create and View Personal Tasks (Priority: P2)

As an authenticated user, I want to create new tasks and view only my own tasks so that I can manage my personal todo list independently from other users.

**Why this priority**: Creating and viewing tasks is the core value proposition of the application. Once authenticated, users must be able to immediately add tasks and see their list. This is the MVP of task management functionality.

**Independent Test**: An authenticated user can POST a new task to `/api/{user_id}/tasks`, then GET `/api/{user_id}/tasks` to verify the task appears only in their own list.

**Acceptance Scenarios**:

1. **Given** I am authenticated with user_id=123, **When** I POST a task to `/api/123/tasks` with title and description, **Then** the task is created with a UUID and stored with my user_id as the owner.
2. **Given** I have created 5 tasks, **When** I GET `/api/123/tasks`, **Then** I receive a JSON array containing only my 5 tasks, not tasks from other users.
3. **Given** I am authenticated as user_id=123, **When** I attempt to GET `/api/456/tasks` (another user's tasks), **Then** I receive HTTP 403 Forbidden because the user_id in the URL doesn't match my authenticated identity.
4. **Given** I create a task with only a title, **When** the backend processes the request, **Then** the task is created successfully with an empty description.
5. **Given** I have no tasks, **When** I GET `/api/123/tasks`, **Then** I receive an empty JSON array `[]`.

---

### User Story 3 - Update and Delete My Tasks (Priority: P3)

As an authenticated user, I want to update or delete my existing tasks so that I can keep my task list accurate and remove completed or irrelevant items.

**Why this priority**: Once users can create and view tasks, the natural next step is to modify or remove them. This completes the basic CRUD operations and enables ongoing task management.

**Independent Test**: An authenticated user can PUT updates to `/api/{user_id}/tasks/{task_id}` and DELETE `/api/{user_id}/tasks/{task_id}`, with ownership verification enforced.

**Acceptance Scenarios**:

1. **Given** I own task with id=abc-123, **When** I PUT an update to `/api/123/tasks/abc-123` with a new title, **Then** the task title is updated and the response confirms the change.
2. **Given** I own task with id=abc-123, **When** I DELETE `/api/123/tasks/abc-123`, **Then** the task is permanently removed from the database.
3. **Given** user_id=456 owns task with id=xyz-789, **When** I (user_id=123) attempt to PUT `/api/123/tasks/xyz-789`, **Then** I receive HTTP 403 Forbidden because I don't own that task.
4. **Given** user_id=456 owns task with id=xyz-789, **When** I (user_id=123) attempt to DELETE `/api/123/tasks/xyz-789`, **Then** I receive HTTP 403 Forbidden.
5. **Given** I attempt to update a non-existent task, **When** I PUT `/api/123/tasks/invalid-id`, **Then** I receive HTTP 404 Not Found.

---

### User Story 4 - Toggle Task Completion Status (Priority: P3)

As an authenticated user, I want to mark tasks as complete or incomplete so that I can track my progress and maintain an up-to-date view of what's pending.

**Why this priority**: Completion toggling is essential for task management workflows, but can be implemented after basic CRUD. It provides immediate user value for tracking progress.

**Independent Test**: An authenticated user can PATCH `/api/{user_id}/tasks/{task_id}/complete` to toggle status, with the operation being idempotent.

**Acceptance Scenarios**:

1. **Given** I own a pending task with id=abc-123, **When** I PATCH `/api/123/tasks/abc-123/complete`, **Then** the task status changes to completed.
2. **Given** I own a completed task with id=abc-123, **When** I PATCH `/api/123/tasks/abc-123/complete`, **Then** the task status changes back to pending.
3. **Given** I toggle task completion multiple times, **When** each PATCH request is processed, **Then** the operation is idempotent and the final state is deterministic.
4. **Given** user_id=456 owns task with id=xyz-789, **When** I (user_id=123) attempt to PATCH `/api/123/tasks/xyz-789/complete`, **Then** I receive HTTP 403 Forbidden.
5. **Given** I attempt to toggle completion on a non-existent task, **When** I PATCH `/api/123/tasks/invalid-id/complete`, **Then** I receive HTTP 404 Not Found.

---

### User Story 5 - Retrieve Specific Task Details (Priority: P4)

As an authenticated user, I want to retrieve the full details of a specific task by ID so that I can view or edit individual task information.

**Why this priority**: While less critical than listing all tasks, fetching individual tasks supports detailed views and edit workflows in the frontend.

**Independent Test**: An authenticated user can GET `/api/{user_id}/tasks/{task_id}` to retrieve a single task's full details.

**Acceptance Scenarios**:

1. **Given** I own task with id=abc-123, **When** I GET `/api/123/tasks/abc-123`, **Then** I receive a JSON object with the task's id, title, description, status, and timestamps.
2. **Given** user_id=456 owns task with id=xyz-789, **When** I (user_id=123) attempt to GET `/api/123/tasks/xyz-789`, **Then** I receive HTTP 403 Forbidden.
3. **Given** I attempt to retrieve a non-existent task, **When** I GET `/api/123/tasks/invalid-id`, **Then** I receive HTTP 404 Not Found.

---

### Edge Cases

- **Authentication Edge Cases**:
  - What happens when a JWT is malformed or uses wrong signing algorithm?
  - How does the backend handle JWTs with missing user identity claims?
  - What happens when a JWT's user_id claim doesn't match the URL path parameter?
  - How does JWKS cache refresh work when public keys are rotated? → Cache refreshes on TTL expiry or verification failure

- **Data Validation Edge Cases**:
  - What happens when task title exceeds maximum length?
  - How does the system handle special characters, emojis, or SQL injection attempts in titles/descriptions?
  - What happens when POST/PUT requests are missing required fields?

- **Ownership & Authorization Edge Cases**:
  - What happens when a user tries to access `/api/{user_id}/tasks` with mismatched user_id in JWT vs URL?
  - How does the system handle UUID collisions (extremely rare but theoretically possible)?

- **Database Edge Cases**:
  - What happens when the Neon database connection fails?
  - How does the system handle concurrent updates to the same task? → Optimistic locking with HTTP 409 Conflict response
  - What happens during database migration failures?

- **Data Persistence Edge Cases**:
  - What happens when backend restarts - do tasks persist correctly?
  - How does the system handle tasks created before vs after schema migrations?

- **Rate Limiting Edge Cases**:
  - What happens when a user exceeds rate limit? → HTTP 429 with Retry-After header
  - How does rate limiting interact with authentication failures (do failed auth attempts count toward limit)?

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST verify JWT tokens on every API request using RS256 signature verification with public keys fetched from Better Auth's JWKS endpoint (`/.well-known/jwks.json`)
- **FR-002**: System MUST cache JWKS public keys in-memory with 1-hour TTL to avoid fetching on every request
- **FR-003**: System MUST refresh JWKS cache when TTL expires or when JWT verification fails with current cached keys
- **FR-004**: System MUST extract user identity from verified JWT tokens
- **FR-005**: System MUST return HTTP 401 for requests without valid JWT tokens
- **FR-006**: System MUST return HTTP 403 when authenticated user_id doesn't match the user_id in the URL path
- **FR-007**: System MUST enforce task ownership on all CRUD operations (user can only access their own tasks)

#### Task CRUD Operations
- **FR-008**: System MUST support creating tasks with title (required, max 200 chars) and description (optional, max 500 chars)
- **FR-009**: System MUST generate UUIDs for task identifiers (not sequential integers)
- **FR-010**: System MUST associate each task with exactly one owner (user_id from JWT)
- **FR-011**: System MUST support listing all tasks for authenticated user via GET `/api/{user_id}/tasks`
- **FR-012**: System MUST support retrieving single task details via GET `/api/{user_id}/tasks/{id}`
- **FR-013**: System MUST support updating task title and description via PUT `/api/{user_id}/tasks/{id}`
- **FR-014**: System MUST support deleting tasks via DELETE `/api/{user_id}/tasks/{id}`
- **FR-015**: System MUST support toggling task completion via PATCH `/api/{user_id}/tasks/{id}/complete`

#### Data Validation
- **FR-016**: System MUST validate task titles are non-empty and max 200 characters
- **FR-017**: System MUST validate task descriptions are max 500 characters (empty allowed)
- **FR-018**: System MUST sanitize user input to prevent SQL injection attacks
- **FR-019**: System MUST validate UUIDs in path parameters and return HTTP 400 for invalid formats

#### Concurrency Control
- **FR-020**: System MUST implement optimistic locking using a version field on Task entity
- **FR-021**: System MUST increment version field on every task update (title, description, or completion status change)
- **FR-022**: System MUST return HTTP 409 Conflict when PUT/PATCH request includes outdated version number
- **FR-023**: System MUST include current version in all task response payloads to enable client-side conflict detection

#### Data Persistence
- **FR-024**: System MUST use Neon Serverless PostgreSQL for data persistence
- **FR-025**: System MUST use SQLModel as the ORM layer
- **FR-026**: System MUST use Alembic for database schema migrations
- **FR-027**: System MUST persist tasks across backend restarts
- **FR-028**: System MUST maintain referential integrity between users and tasks

#### API Response Format
- **FR-029**: System MUST return JSON responses for all API endpoints
- **FR-030**: System MUST use standard HTTP status codes (200, 201, 400, 401, 403, 404, 409, 429, 500)
- **FR-031**: System MUST return error responses in consistent JSON format with `message` field
- **FR-032**: System MUST return task objects with fields: `id`, `user_id`, `title`, `description`, `completed`, `version`, `created_at`, `updated_at`

#### Environment & Configuration
- **FR-033**: System MUST read database connection string from environment variable `DATABASE_URL`
- **FR-034**: System MUST read Better Auth JWKS endpoint URL from environment variable `BETTER_AUTH_JWKS_URL`
- **FR-035**: System MUST read CORS allowed origins from environment variable `CORS_ORIGINS`
- **FR-036**: System MUST NOT hardcode secrets or credentials in source code

#### Integration Requirements
- **FR-037**: System MUST be compatible with Next.js 16+ frontend clients
- **FR-038**: System MUST support CORS for configured frontend origins
- **FR-039**: System MUST run as a standalone FastAPI application on configured port

#### Observability & Logging
- **FR-040**: System MUST emit structured JSON logs for all requests, errors, and authentication events
- **FR-041**: System MUST include correlation ID (request ID) in all log entries for request tracing
- **FR-042**: System MUST log authentication failures with user_id (if extractable) and reason (expired, invalid signature, missing token)
- **FR-043**: System MUST log authorization failures (HTTP 403) with attempted resource and authenticated user_id
- **FR-044**: System MUST log database connection errors and query failures without exposing sensitive data
- **FR-045**: System MUST include timestamp, log level, correlation ID, user_id (if authenticated), endpoint, and HTTP status in all request logs

#### Rate Limiting & Abuse Protection
- **FR-046**: System MUST implement per-user rate limiting of 100 requests per minute per authenticated user_id
- **FR-047**: System MUST return HTTP 429 Too Many Requests when rate limit is exceeded
- **FR-048**: System MUST include `Retry-After` header in HTTP 429 responses indicating seconds until limit resets
- **FR-049**: System MUST include rate limit information in response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **FR-050**: System MUST reset rate limit counters every 60 seconds (sliding window)

### Key Entities

- **User**: Represents a registered user account (managed by Better Auth on frontend). Key attributes from backend perspective: user_id (UUID extracted from JWT), used only for task ownership association.

- **Task**: Represents a single todo item. Key attributes:
  - `id` (UUID, primary key, auto-generated)
  - `user_id` (UUID, foreign key, extracted from JWT, owner of task)
  - `title` (string, required, max 200 chars)
  - `description` (string, optional, max 500 chars)
  - `completed` (boolean, default False)
  - `version` (integer, auto-incremented on each update, used for optimistic locking)
  - `created_at` (timestamp, auto-generated)
  - `updated_at` (timestamp, auto-updated)

### Technology Stack Constraints

- **Backend Framework**: FastAPI (Python 3.13+)
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Migration Tool**: Alembic
- **Authentication**: JWT verification (Better Auth-issued tokens)
- **Deployment Model**: Environment variable configuration only

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Multiple users can register independently and each user only sees their own tasks (verified by creating 2+ users, each creating tasks, and confirming data isolation)
- **SC-002**: All API endpoints requiring authentication return HTTP 401 when JWT is missing or invalid (100% enforcement)
- **SC-003**: All task CRUD operations enforce ownership, returning HTTP 403 when user_id mismatch occurs (100% enforcement)
- **SC-004**: Task data persists across backend restarts (verified by creating tasks, restarting FastAPI server, and confirming tasks still exist)
- **SC-005**: Backend can be deployed using only environment variables (no hardcoded configuration)
- **SC-006**: API integrates successfully with Next.js 16+ frontend (verified by successful end-to-end task operations from browser)
- **SC-007**: All test suites (unit, integration, contract) pass with 100% success rate
- **SC-008**: Backend responds to task list requests within 200ms for databases with <1000 tasks per user
- **SC-009**: API documentation is auto-generated via FastAPI's built-in OpenAPI/Swagger UI
- **SC-010**: Database schema can be initialized and migrated using Alembic without manual SQL
- **SC-011**: All request logs contain correlation IDs enabling end-to-end request tracing (verified by making request and finding matching correlation ID across all log entries)

### Definition of Done

A feature/user story is considered "done" when:
1. All acceptance scenarios pass
2. Unit tests exist and pass (TDD: Red → Green → Refactor)
3. Integration tests verify end-to-end flow
4. API contract tests verify request/response formats
5. Code follows PEP 8 and type hints are present
6. Ownership enforcement is verified
7. Changes are committed with descriptive messages
8. PHR is created for the implementation session

## Clarifications

### Session 2025-12-19

- Q: Should the backend create/manage user accounts or only verify JWTs? → A: Backend only verifies JWTs issued by Better Auth. User registration/management happens on frontend via Better Auth.
- Q: What database schema migration strategy should be used? → A: Use Alembic for all schema migrations. Migrations must be versioned and reversible.
- Q: Should task IDs be sequential integers or UUIDs? → A: UUIDs for tasks to avoid enumeration attacks and ensure global uniqueness in distributed systems.
- Q: Should the backend validate JWT signature or just decode it? → A: MUST verify signature using public keys from JWKS endpoint. Never trust unverified tokens.
- Q: What happens if user_id in JWT doesn't match user_id in URL path? → A: Return HTTP 403 Forbidden. This is a critical security enforcement point.
- Q: Should completed tasks be soft-deleted or hard-deleted? → A: Phase II uses hard deletion (permanent removal). Soft deletion is out of scope.
- Q: Should the backend support pagination for task lists? → A: Not required for Phase II. Return all tasks for authenticated user. Pagination is a Phase III optimization.
- Q: How should the backend handle database connection failures? → A: Return HTTP 500 with generic error message. Do not expose database details to clients.
- Q: How should the backend verify Better Auth-issued JWTs? → A: JWKS endpoint verification (RS256) - Backend fetches public keys from Better Auth's `/.well-known/jwks.json` endpoint for signature verification.
- Q: How should the backend handle concurrent updates to the same task? → A: Optimistic locking - Use version/timestamp field, return HTTP 409 Conflict if update attempted on stale data.
- Q: What logging/monitoring capabilities should the backend provide? → A: Structured logging with request tracing - JSON formatted logs with correlation IDs, authentication events, and error tracking.
- Q: Should the backend implement rate limiting? → A: Per-user rate limiting - Limit requests by authenticated user_id (100 requests per minute per user), return HTTP 429 Too Many Requests when exceeded.
- Q: How should the backend cache JWKS public keys? → A: In-memory cache with TTL - Cache public keys for 1 hour, refresh when expired or on verification failure.
