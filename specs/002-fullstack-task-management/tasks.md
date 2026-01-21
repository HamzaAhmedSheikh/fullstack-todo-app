# Tasks: Full-Stack Task Management System (Phase II Backend)

**Feature**: `002-fullstack-task-management`
**Input**: Design documents from `/specs/002-fullstack-task-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are REQUIRED per TDD approach specified in user context. All tests follow Red → Green → Refactor methodology.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with backend focus:
- Backend: `backend/app/`, `backend/tests/`
- Configuration: `backend/.env`, `backend/alembic/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure: backend/app/{database,auth,routers,middleware,core}
- [X] T002 Initialize uv project in backend/ directory with Python 3.13+
- [X] T003 [P] Add core dependencies: fastapi, uvicorn[standard], sqlmodel, psycopg[binary], python-jose[cryptography], httpx, pydantic-settings
- [X] T004 [P] Add development dependencies: pytest, pytest-asyncio, black, mypy, ruff, alembic
- [X] T005 [P] Create .gitignore for Python, .env, IDE, and test artifacts
- [X] T006 Create .env.example template with DATABASE_URL, BETTER_AUTH_JWKS_URL, CORS_ORIGINS
- [X] T007 Create basic FastAPI app in backend/app/main.py with health check endpoint
- [X] T008 Configure environment settings in backend/app/core/config.py using Pydantic Settings

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [X] T009 Create async SQLAlchemy engine in backend/app/database/engine.py with Neon-optimized settings (pool_size=5, pool_recycle=300, pool_pre_ping=True)
- [X] T010 Implement async session factory in backend/app/database/session.py with get_db dependency
- [X] T011 Define Task SQLModel in backend/app/database/models.py with UUID id, user_id, title, description, completed, version, timestamps
- [X] T012 Add indexes to Task model: user_id (single) and (user_id, completed) composite
- [X] T013 Initialize Alembic with `alembic init alembic` in backend directory
- [X] T014 Configure Alembic env.py to use DATABASE_URL from settings and SQLModel metadata
- [ ] T015 Generate initial migration for Task table with `alembic revision --autogenerate -m "Create tasks table"` (⏸️ Requires DATABASE_URL)
- [ ] T016 Apply migration to Neon database with `alembic upgrade head` (⏸️ Requires DATABASE_URL)

### Authentication Foundation

- [X] T017 Implement JWKS cache in backend/app/auth/jwks.py with 1-hour TTL and refresh-on-failure
- [X] T018 Implement JWT verification in backend/app/auth/jwt_handler.py with RS256 signature validation
- [X] T019 Create get_current_user_id dependency in backend/app/auth/dependencies.py extracting user_id from JWT
- [X] T020 Add request ID middleware in backend/app/middleware/request_id.py generating correlation UUIDs
- [X] T021 Add structured logging middleware in backend/app/middleware/logging.py emitting JSON logs
- [X] T022 Register CORS, request ID, and logging middleware in backend/app/main.py

### Testing Infrastructure

- [X] T023 Create pytest configuration in backend/tests/conftest.py with async fixtures
- [X] T024 [P] Create test database session fixture using in-memory SQLite
- [X] T025 [P] Create test client fixture for FastAPI app
- [X] T026 [P] Create auth_headers fixture generating test JWTs with user_id

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable user registration and JWT-based authentication for multi-user task management

**Independent Test**: A user can register via frontend, receive a JWT from Better Auth, and use that JWT to make authenticated API calls to the backend

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD Red phase)**

- [ ] T027 [P] [US1] Unit test for verify_jwt with valid token in backend/tests/unit/auth/test_jwt_handler.py
- [ ] T028 [P] [US1] Unit test for verify_jwt with invalid token returning HTTP 401 in backend/tests/unit/auth/test_jwt_handler.py
- [ ] T029 [P] [US1] Unit test for verify_jwt with expired token returning HTTP 401 in backend/tests/unit/auth/test_jwt_handler.py
- [ ] T030 [P] [US1] Unit test for get_current_user_id extracting user_id from valid JWT in backend/tests/unit/auth/test_dependencies.py
- [ ] T031 [P] [US1] Integration test for missing JWT returning HTTP 401 in backend/tests/integration/test_auth_flow.py
- [ ] T032 [P] [US1] Integration test for malformed JWT returning HTTP 401 in backend/tests/integration/test_auth_flow.py

### Implementation for User Story 1

- [ ] T033 [US1] Verify JWKS cache fetches and caches public keys from BETTER_AUTH_JWKS_URL
- [ ] T034 [US1] Verify JWT handler extracts kid from header and retrieves public key from cache
- [ ] T035 [US1] Verify JWT handler performs RS256 signature verification and returns payload
- [ ] T036 [US1] Verify auth dependency extracts user_id from JWT "sub" or "user_id" claim
- [ ] T037 [US1] Add validation for missing user_id in JWT payload (HTTP 401)
- [ ] T038 [US1] Add validation for invalid UUID format in user_id claim (HTTP 401)
- [ ] T039 [US1] Verify all error cases return consistent JSON error format with request_id

### Refactor for User Story 1

- [ ] T040 [US1] Review and optimize JWKS caching logic for edge cases
- [ ] T041 [US1] Add comprehensive logging for authentication failures with reasons
- [ ] T042 [US1] Update OpenAPI docs with authentication requirements and examples

**Checkpoint**: At this point, JWT authentication should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create and View Personal Tasks (Priority: P2)

**Goal**: Allow authenticated users to create new tasks and view only their own tasks with per-user data isolation

**Independent Test**: An authenticated user can POST a new task to `/api/{user_id}/tasks`, then GET `/api/{user_id}/tasks` to verify the task appears only in their own list

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD Red phase)**

- [ ] T043 [P] [US2] Contract test for POST /api/{user_id}/tasks request/response schema in backend/tests/contract/test_tasks_contract.py
- [ ] T044 [P] [US2] Contract test for GET /api/{user_id}/tasks response schema in backend/tests/contract/test_tasks_contract.py
- [ ] T045 [P] [US2] Integration test for creating task with valid data returning HTTP 201 in backend/tests/integration/test_task_crud.py
- [ ] T046 [P] [US2] Integration test for listing user's own tasks in backend/tests/integration/test_task_crud.py
- [ ] T047 [P] [US2] Integration test for user_id mismatch (JWT vs URL) returning HTTP 403 in backend/tests/integration/test_task_crud.py
- [ ] T048 [P] [US2] Integration test for cross-user isolation (user A cannot see user B's tasks) in backend/tests/integration/test_task_crud.py

### Implementation for User Story 2

- [ ] T049 [P] [US2] Create TaskCreate Pydantic schema in backend/app/routers/tasks.py with title (1-200 chars), description (0-500 chars)
- [ ] T050 [P] [US2] Create TaskResponse Pydantic schema in backend/app/routers/tasks.py with all Task fields
- [ ] T051 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py with ownership enforcement
- [ ] T052 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py filtering by authenticated user_id
- [ ] T053 [US2] Add user_id path parameter validation (must match JWT user_id claim, else HTTP 403)
- [ ] T054 [US2] Add input validation for title (non-empty, max 200 chars) returning HTTP 422 on failure
- [ ] T055 [US2] Add input validation for description (max 500 chars) returning HTTP 422 on failure
- [ ] T056 [US2] Ensure UUID generation for task id and proper timestamps (created_at, updated_at)
- [ ] T057 [US2] Return empty array [] when user has no tasks

### Refactor for User Story 2

- [ ] T058 [US2] Extract ownership enforcement logic into reusable helper function
- [ ] T059 [US2] Add logging for task creation and listing operations with user_id
- [ ] T060 [US2] Update OpenAPI docs with task creation/listing examples

**Checkpoint**: At this point, creating and viewing tasks should work independently with full data isolation

---

## Phase 5: User Story 3 - Update and Delete My Tasks (Priority: P3)

**Goal**: Enable authenticated users to update or delete their existing tasks with ownership verification

**Independent Test**: An authenticated user can PUT updates to `/api/{user_id}/tasks/{task_id}` and DELETE `/api/{user_id}/tasks/{task_id}`, with ownership verification enforced

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD Red phase)**

- [ ] T061 [P] [US3] Contract test for PUT /api/{user_id}/tasks/{task_id} request/response schema in backend/tests/contract/test_tasks_contract.py
- [ ] T062 [P] [US3] Contract test for DELETE /api/{user_id}/tasks/{task_id} returning HTTP 204 in backend/tests/contract/test_tasks_contract.py
- [ ] T063 [P] [US3] Integration test for updating own task with valid data in backend/tests/integration/test_task_crud.py
- [ ] T064 [P] [US3] Integration test for deleting own task in backend/tests/integration/test_task_crud.py
- [ ] T065 [P] [US3] Integration test for updating another user's task returning HTTP 403 in backend/tests/integration/test_task_crud.py
- [ ] T066 [P] [US3] Integration test for deleting another user's task returning HTTP 403 in backend/tests/integration/test_task_crud.py
- [ ] T067 [P] [US3] Integration test for updating non-existent task returning HTTP 404 in backend/tests/integration/test_task_crud.py
- [ ] T068 [P] [US3] Integration test for optimistic locking conflict returning HTTP 409 in backend/tests/integration/test_task_crud.py

### Implementation for User Story 3

- [ ] T069 [P] [US3] Create TaskUpdate Pydantic schema in backend/app/routers/tasks.py with title, description, version
- [ ] T070 [US3] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/app/routers/tasks.py with optimistic locking
- [ ] T071 [US3] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/app/routers/tasks.py with ownership check
- [ ] T072 [US3] Add version field validation in PUT endpoint (check current version matches request version)
- [ ] T073 [US3] Increment version field and update updated_at timestamp on successful update
- [ ] T074 [US3] Return HTTP 409 Conflict when version mismatch detected (stale update attempt)
- [ ] T075 [US3] Return HTTP 404 Not Found when task_id doesn't exist or doesn't belong to user
- [ ] T076 [US3] Return HTTP 204 No Content on successful deletion
- [ ] T077 [US3] Validate UUID format for task_id path parameter (HTTP 400 on invalid)

### Refactor for User Story 3

- [ ] T078 [US3] Add logging for update and delete operations with user_id and task_id
- [ ] T079 [US3] Update OpenAPI docs with update/delete examples and error responses
- [ ] T080 [US3] Review error handling consistency across all task endpoints

**Checkpoint**: All basic CRUD operations (create, read, update, delete) should now be independently functional

---

## Phase 6: User Story 4 - Toggle Task Completion Status (Priority: P3)

**Goal**: Enable authenticated users to mark tasks as complete or incomplete for progress tracking

**Independent Test**: An authenticated user can PATCH `/api/{user_id}/tasks/{task_id}/complete` to toggle status, with the operation being idempotent

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD Red phase)**

- [ ] T081 [P] [US4] Contract test for PATCH /api/{user_id}/tasks/{task_id}/complete response schema in backend/tests/contract/test_tasks_contract.py
- [ ] T082 [P] [US4] Integration test for toggling pending task to completed in backend/tests/integration/test_task_crud.py
- [ ] T083 [P] [US4] Integration test for toggling completed task back to pending in backend/tests/integration/test_task_crud.py
- [ ] T084 [P] [US4] Integration test for idempotency (multiple toggles produce deterministic state) in backend/tests/integration/test_task_crud.py
- [ ] T085 [P] [US4] Integration test for toggling another user's task returning HTTP 403 in backend/tests/integration/test_task_crud.py
- [ ] T086 [P] [US4] Integration test for toggling non-existent task returning HTTP 404 in backend/tests/integration/test_task_crud.py

### Implementation for User Story 4

- [ ] T087 [US4] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/app/routers/tasks.py
- [ ] T088 [US4] Add ownership verification (user_id match check)
- [ ] T089 [US4] Toggle completed field: False → True or True → False
- [ ] T090 [US4] Increment version field on status change
- [ ] T091 [US4] Update updated_at timestamp
- [ ] T092 [US4] Return updated task with new completion status and version
- [ ] T093 [US4] Ensure idempotency (toggling multiple times produces deterministic results)

### Refactor for User Story 4

- [ ] T094 [US4] Add logging for completion toggle operations
- [ ] T095 [US4] Update OpenAPI docs with completion toggle examples

**Checkpoint**: Task completion toggling should work independently with proper state management

---

## Phase 7: User Story 5 - Retrieve Specific Task Details (Priority: P4)

**Goal**: Enable authenticated users to retrieve full details of a specific task by ID

**Independent Test**: An authenticated user can GET `/api/{user_id}/tasks/{task_id}` to retrieve a single task's full details

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (TDD Red phase)**

- [ ] T096 [P] [US5] Contract test for GET /api/{user_id}/tasks/{task_id} response schema in backend/tests/contract/test_tasks_contract.py
- [ ] T097 [P] [US5] Integration test for retrieving own task by ID in backend/tests/integration/test_task_crud.py
- [ ] T098 [P] [US5] Integration test for retrieving another user's task returning HTTP 403 in backend/tests/integration/test_task_crud.py
- [ ] T099 [P] [US5] Integration test for retrieving non-existent task returning HTTP 404 in backend/tests/integration/test_task_crud.py

### Implementation for User Story 5

- [ ] T100 [US5] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/app/routers/tasks.py
- [ ] T101 [US5] Add ownership verification (user_id match check)
- [ ] T102 [US5] Query task by id and user_id (ownership-scoped query)
- [ ] T103 [US5] Return HTTP 404 if task not found or doesn't belong to user
- [ ] T104 [US5] Return TaskResponse with all fields (id, user_id, title, description, completed, version, timestamps)

### Refactor for User Story 5

- [ ] T105 [US5] Update OpenAPI docs with single task retrieval examples

**Checkpoint**: All user stories should now be independently functional with complete CRUD operations

---

## Phase 8: Security Hardening & Rate Limiting

**Purpose**: Production-ready security controls and abuse protection

### Rate Limiting Implementation

- [ ] T106 [P] Implement RateLimitMiddleware in backend/app/middleware/rate_limit.py with sliding window algorithm
- [ ] T107 [P] Configure per-user rate limiting (100 requests per minute based on authenticated user_id)
- [ ] T108 [P] Add rate limit headers to responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- [ ] T109 Return HTTP 429 Too Many Requests when limit exceeded with Retry-After header
- [ ] T110 Register rate limit middleware in backend/app/main.py

### Security Headers & Error Handling

- [ ] T111 [P] Add security headers middleware: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- [ ] T112 [P] Create custom exception handlers in backend/app/core/exceptions.py for consistent error format
- [ ] T113 Add global exception handler for HTTPException returning JSON with request_id
- [ ] T114 Add global exception handler for ValidationError returning HTTP 422 with field details
- [ ] T115 Add global exception handler for database errors returning HTTP 500 without sensitive details
- [ ] T116 Register all exception handlers in backend/app/main.py

### Security Tests

- [ ] T117 [P] Integration test for rate limiting enforcement in backend/tests/integration/test_security.py
- [ ] T118 [P] Integration test for HTTP 429 response when limit exceeded in backend/tests/integration/test_security.py
- [ ] T119 [P] Integration test for security headers present in all responses in backend/tests/integration/test_security.py
- [ ] T120 [P] Integration test for consistent error response format in backend/tests/integration/test_security.py

---

## Phase 9: Observability & Monitoring

**Purpose**: Production-ready logging and request tracing

### Logging Enhancement

- [ ] T121 Add authentication failure logging with user_id (if extractable) and failure reason
- [ ] T122 Add authorization failure logging (HTTP 403) with attempted resource and authenticated user_id
- [ ] T123 Add database error logging without exposing sensitive data
- [ ] T124 Ensure all log entries include: timestamp, level, request_id, user_id, endpoint, HTTP status
- [ ] T125 Verify no sensitive data logged (JWT tokens, passwords, etc.)

### Observability Tests

- [ ] T126 [P] Unit test for request logging with correlation ID in backend/tests/unit/middleware/test_logging.py
- [ ] T127 [P] Unit test for authentication failure logging in backend/tests/unit/middleware/test_logging.py
- [ ] T128 [P] Unit test for JSON log format validation in backend/tests/unit/middleware/test_logging.py

---

## Phase 10: Testing & Quality Assurance

**Purpose**: Achieve comprehensive test coverage and validate all requirements

### Unit Tests

- [ ] T129 [P] Unit tests for Task model creation and field validation in backend/tests/unit/models/test_task.py
- [ ] T130 [P] Unit tests for version increment on update in backend/tests/unit/models/test_task.py
- [ ] T131 [P] Unit tests for JWKS cache fetch and TTL expiry in backend/tests/unit/auth/test_jwks.py
- [ ] T132 [P] Unit tests for JWKS cache refresh on verification failure in backend/tests/unit/auth/test_jwks.py
- [ ] T133 [P] Unit tests for input validation schemas (title/description limits) in backend/tests/unit/routers/test_task_schemas.py

### Integration Tests (Cross-Story Validation)

- [ ] T134 [P] End-to-end test for complete task lifecycle (create, read, update, toggle, delete) in backend/tests/integration/test_e2e_flow.py
- [ ] T135 [P] Multi-user isolation test (verify data never crosses user boundaries) in backend/tests/integration/test_multi_user.py
- [ ] T136 [P] Concurrent update test for optimistic locking conflicts in backend/tests/integration/test_concurrency.py
- [ ] T137 [P] Database persistence test (create tasks, restart app, verify tasks exist) in backend/tests/integration/test_persistence.py

### Performance Tests

- [ ] T138 [P] Performance test for task list response time (<200ms for <1000 tasks) in backend/tests/performance/test_latency.py
- [ ] T139 [P] Performance test for JWKS cache hit latency (<5ms) in backend/tests/performance/test_latency.py
- [ ] T140 [P] Database query optimization test (verify indexes used, no full table scans) in backend/tests/performance/test_queries.py

### Coverage & Quality Gates

- [ ] T141 Generate test coverage report with `pytest --cov=app --cov-report=html`
- [ ] T142 Verify test coverage ≥ 80% across all modules
- [ ] T143 Run mypy type checking and fix all type errors
- [ ] T144 Run black code formatting on entire codebase
- [ ] T145 Run ruff linting and fix all violations
- [ ] T146 Verify all 50 functional requirements (FR-001 to FR-050) satisfied

---

## Phase 11: Documentation & Deployment Readiness

**Purpose**: Production-ready documentation and deployment preparation

### API Documentation

- [ ] T147 [P] Add comprehensive endpoint descriptions to all routes with examples
- [ ] T148 [P] Document request/response schemas with field descriptions in Pydantic models
- [ ] T149 [P] Add authentication requirements to OpenAPI spec
- [ ] T150 [P] Include example requests/responses for all endpoints
- [ ] T151 Document all error responses (400, 401, 403, 404, 409, 422, 429, 500) with examples

### Project Documentation

- [ ] T152 Write comprehensive README.md in backend/ with project overview, setup, and usage instructions
- [ ] T153 Document all environment variables in .env.example with descriptions and examples
- [ ] T154 Create deployment checklist covering environment config, migrations, JWKS, CORS, rate limiting
- [ ] T155 Document Neon database setup and connection configuration
- [ ] T156 Document local development workflow with uv
- [ ] T157 Document testing strategy and how to run tests

### Deployment Validation

- [ ] T158 Create test deployment to verify environment variable configuration works
- [ ] T159 Test Alembic migrations on fresh Neon database
- [ ] T160 Verify JWKS endpoint is accessible from backend
- [ ] T161 Verify CORS origins configured correctly for frontend
- [ ] T162 Test complete user flow from registration → task CRUD with real JWT

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - Can proceed in parallel (if staffed) OR sequentially in priority order (P1 → P2 → P3 → P4)
- **Security Hardening (Phase 8)**: Can start after Foundational, benefits from user story context
- **Observability (Phase 9)**: Can start after Foundational, integrates with all phases
- **Testing (Phase 10)**: Depends on all user stories being complete
- **Documentation (Phase 11)**: Depends on all functionality being complete

### User Story Dependencies

- **User Story 1 (US1 - Authentication)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (US2 - Create/View Tasks)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (US3 - Update/Delete Tasks)**: Can start after Foundational (Phase 2) - Integrates with US2 but independently testable
- **User Story 4 (US4 - Toggle Completion)**: Can start after Foundational (Phase 2) - Integrates with US2/US3 but independently testable
- **User Story 5 (US5 - Get Single Task)**: Can start after Foundational (Phase 2) - Integrates with US2 but independently testable

### Within Each User Story (TDD Flow)

1. **Red**: Write tests FIRST, ensure they FAIL before implementation
2. **Green**: Implement minimum code to make tests PASS
3. **Refactor**: Clean up code, optimize, improve while keeping tests passing
4. Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T003, T004, T005, T006 can run in parallel
- **Foundational Phase**: T024, T025, T026 can run in parallel (test fixtures)
- **User Stories**: Once Foundational completes, US1, US2, US3, US4, US5 can all start in parallel (if team capacity allows)
- **Tests Within Story**: All tests marked [P] within a user story can run in parallel
- **Security Phase**: T106, T107, T108 and T111, T112 can run in parallel
- **Documentation Phase**: T147, T148, T149, T150 can run in parallel

---

## Parallel Example: User Story 2 (Create/View Tasks)

```bash
# Launch all tests for User Story 2 together (TDD Red phase):
Task T043: "Contract test for POST /api/{user_id}/tasks request/response schema"
Task T044: "Contract test for GET /api/{user_id}/tasks response schema"
Task T045: "Integration test for creating task with valid data returning HTTP 201"
Task T046: "Integration test for listing user's own tasks"
Task T047: "Integration test for user_id mismatch returning HTTP 403"
Task T048: "Integration test for cross-user isolation"

# Launch all schemas for User Story 2 together (TDD Green phase):
Task T049: "Create TaskCreate Pydantic schema"
Task T050: "Create TaskResponse Pydantic schema"

# Then implement endpoints sequentially:
Task T051: "Implement POST /api/{user_id}/tasks endpoint"
Task T052: "Implement GET /api/{user_id}/tasks endpoint"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. Complete Phase 4: User Story 2 (Create/View Tasks)
5. **STOP and VALIDATE**: Test authentication + basic task CRUD independently
6. Deploy/demo if ready - THIS IS MINIMUM VIABLE PRODUCT

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Authentication) → Test independently
3. Add User Story 2 (Create/View) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 (Update/Delete) → Test independently → Deploy/Demo
5. Add User Story 4 (Toggle) → Test independently → Deploy/Demo
6. Add User Story 5 (Get Single) → Test independently → Deploy/Demo
7. Add Security Hardening (Phase 8) → Deploy/Demo
8. Each increment adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication)
   - Developer B: User Story 2 (Create/View Tasks)
   - Developer C: User Story 3 (Update/Delete Tasks)
   - Developer D: User Story 4 (Toggle Completion)
   - Developer E: User Story 5 (Get Single Task)
3. Stories complete and integrate independently
4. Team reconvenes for Security, Testing, Documentation phases

---

## Success Criteria

### Functional Completeness
- ✅ All 5 user stories implemented and independently testable
- ✅ All 50 functional requirements (FR-001 to FR-050) satisfied
- ✅ All API endpoints match specification exactly
- ✅ Multi-user isolation verified with tests
- ✅ JWT authentication working with Better Auth JWKS

### Security & Authorization
- ✅ 100% authentication enforcement (no unprotected endpoints)
- ✅ 100% ownership enforcement (no cross-user access)
- ✅ Rate limiting active (100 req/min per user)
- ✅ JWKS RS256 verification working
- ✅ No secrets hardcoded in source code

### Data Integrity
- ✅ Optimistic locking prevents concurrent update data loss
- ✅ Concurrent updates detected (HTTP 409)
- ✅ Tasks persist across backend restarts
- ✅ Database constraints enforced

### Performance
- ✅ Task list (<1000 tasks) responds within 200ms
- ✅ JWKS cache hit latency <5ms
- ✅ Queries use indexes (verified in tests)

### Testing
- ✅ Test coverage ≥ 80%
- ✅ All user stories have unit, integration, and contract tests
- ✅ TDD methodology followed (Red → Green → Refactor)
- ✅ All edge cases covered

### Observability
- ✅ All requests logged with correlation ID
- ✅ Authentication/authorization failures logged with reasons
- ✅ Structured JSON logs emitted
- ✅ No sensitive data in logs

### Production Readiness
- ✅ Backend deployable with environment variables only
- ✅ Alembic migrations tested and reversible
- ✅ OpenAPI documentation complete
- ✅ README.md comprehensive
- ✅ Deployment checklist ready
- ✅ Neon cloud database connection stable

---

## Notes

- **[P]** tasks = different files, no dependencies, can run in parallel
- **[Story]** label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD REQUIRED**: Write tests FIRST (Red), then implement (Green), then refactor
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Total Tasks**: 162
**User Stories**: 5 (US1: P1, US2: P2, US3: P3, US4: P3, US5: P4)
**Parallel Opportunities**: 50+ tasks marked [P] can run in parallel within their phase
**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) = 60 tasks
**Estimated MVP Completion**: 8-12 hours of focused development
