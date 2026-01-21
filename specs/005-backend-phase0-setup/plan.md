# Implementation Plan: Backend Phase 0 - Verification and Initial Setup

**Branch**: `005-backend-phase0-setup` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-backend-phase0-setup/spec.md`

## Summary

Phase 0 establishes the foundation for implementing a secure multi-user Todo API with FastAPI, SQLModel, and Neon PostgreSQL. This preparatory phase focuses on environment verification, dependency installation, comprehensive JWT security architecture documentation, and test-driven development foundation. No actual implementation occurs in Phase 0 - it serves to ensure developers understand the security model and have a properly configured environment before beginning Phase 1 implementation.

**Key Deliverables**:
- Verified backend development environment with all dependencies installed
- Comprehensive CLAUDE.md documenting JWT verification, user isolation, and TDD patterns
- Test directory structure configured for pytest
- .env.example with required environment variables
- Project file structure ready for Phase 1 implementation

## Technical Context

**Language/Version**: Python 3.9+
**Primary Dependencies**: fastapi, uvicorn[standard], sqlmodel, psycopg2-binary, python-dotenv, pyjwt[crypto], python-multipart, pytest, httpx
**Storage**: Neon PostgreSQL (Phase 1+), in-memory for tests
**Testing**: pytest with httpx for API testing, TDD red-green-refactor cycle mandatory
**Target Platform**: Linux/macOS development environment, Docker-ready for production
**Project Type**: Web application (backend microservice)
**Performance Goals**: <200ms API response time, support 1000+ concurrent users (Phase 1+ optimization)
**Constraints**: JWT verification on every authenticated request, strict user data isolation, zero tolerance for security vulnerabilities
**Scale/Scope**: Multi-user Todo API with 6 REST endpoints, user-scoped task management, production-ready authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Accuracy & Verification**: All features MUST work exactly as specified. Phase 0 focuses on verification only - no implementation to test yet. Phase 1+ will require all APIs verified through testing.

✅ **Specification First**: Complete specification exists at `/specs/005-backend-phase0-setup/spec.md` with 15 functional requirements, 3 user stories, and 8 success criteria. All Phase 0 work aligns with approved spec.

✅ **Clean Code**: CLAUDE.md will document PEP 8 compliance, type hints, and docstring requirements for all future implementation. Phase 0 establishes standards; Phase 1+ enforces them.

✅ **Test-First Development**: TDD mandatory starting Phase 1. Phase 0 establishes test directory structure and documents red-green-refactor workflow in CLAUDE.md. All future implementation must follow TDD.

✅ **Evolutionary Architecture**: Phase 0 establishes interfaces and patterns (JWT verification, dependency injection, database session management) that support evolution through Phase 1 (database connection), Phase 2 (CRUD endpoints), Phase 3+ (optimization, caching, etc.). YAGNI principle: only implement Phase 0 verification needs now.

✅ **User Experience First**: Developer experience prioritized through comprehensive documentation, clear error messages in setup scripts, explicit validation of environment readiness, and step-by-step setup instructions.

**Gate Result**: ✅ PASS - All constitution principles satisfied for Phase 0 scope.

## Project Structure

### Documentation (this feature)

```text
specs/005-backend-phase0-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output: Best practices for JWT, pytest, FastAPI security
├── data-model.md        # Phase 1 output: Task and User entity schemas (Phase 0: N/A)
├── quickstart.md        # Phase 1 output: Developer onboarding guide
├── contracts/           # Phase 1 output: OpenAPI specs for 6 endpoints (Phase 0: N/A)
├── checklists/
│   └── requirements.md  # Spec quality validation (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point with CORS, routes
│   ├── db.py                # Database connection and session management
│   ├── models.py            # SQLModel database models (Task, User reference)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── dependencies.py      # JWT verification, get_current_user, get_db
│   └── routes/
│       ├── __init__.py
│       └── tasks.py         # Task CRUD endpoints: GET/POST list, GET/PUT/DELETE/PATCH by ID
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # pytest fixtures: test_client, mock_db, mock_jwt_token
│   ├── test_auth.py         # JWT middleware tests: valid/invalid/expired/missing tokens
│   ├── test_jwt_middleware.py  # User ID validation: JWT user_id vs path user_id
│   ├── test_tasks.py        # Task CRUD endpoint tests with authentication
│   └── test_user_isolation.py  # User data isolation: users can't access other users' tasks
│
├── .env.example             # DATABASE_URL, BETTER_AUTH_SECRET placeholders
├── .env                     # Real secrets (gitignored)
├── pyproject.toml           # uv project config with dependencies
├── pytest.ini               # pytest configuration
└── CLAUDE.md                # Comprehensive developer guidelines (Phase 0 deliverable)

frontend/
└── [Already complete - no changes in Phase 0]
```

**Structure Decision**: Web application (backend microservice) structure selected. Backend is organized with separation of concerns: models (data), routes (endpoints), dependencies (middleware/DI), schemas (validation). Test structure mirrors source structure with additional files for cross-cutting concerns (auth, user isolation). Phase 0 establishes this structure; Phase 1+ populates it with implementation.

## Complexity Tracking

No constitution violations requiring justification in Phase 0.

---

## Phase 0: Outline & Research

**Goal**: Resolve all technical unknowns and document best practices for JWT verification, FastAPI security patterns, pytest configuration, and TDD workflow.

**Prerequisites**: None (starting phase)

**Outputs**: `research.md` with decisions, rationale, and alternatives for all technical choices

### Research Tasks

#### Task 0.1: JWT Verification Best Practices with PyJWT
**Description**: Research secure JWT verification patterns using PyJWT library, including signature verification with HS256 algorithm, token expiration handling, and user claim extraction.

**Questions to Answer**:
- How to verify JWT signature using BETTER_AUTH_SECRET with PyJWT?
- How to extract user_id from JWT claims (Better Auth token structure)?
- How to handle expired, malformed, or missing tokens (exception types)?
- Best practices for JWT validation in FastAPI dependency injection pattern?

**Files to Research**: PyJWT documentation, Better Auth JWT token structure docs, FastAPI security documentation

**Complexity**: Medium

**Validation**: Document code examples in research.md showing JWT verification function with proper error handling

---

#### Task 0.2: FastAPI Security Patterns and Dependency Injection
**Description**: Research FastAPI security utilities (HTTPBearer, Security, Depends) and dependency injection patterns for implementing JWT middleware and database session management.

**Questions to Answer**:
- How to use HTTPBearer for Authorization header extraction?
- How to implement get_current_user dependency that verifies JWT and returns user_id?
- How to implement get_db dependency for SQLModel session management?
- How to compose dependencies (get_current_user depends on JWT verification)?

**Files to Research**: FastAPI security documentation, FastAPI dependency injection guide

**Complexity**: Medium

**Validation**: Document dependency injection pattern examples in research.md with type hints

---

#### Task 0.3: Pytest Configuration for FastAPI Testing
**Description**: Research pytest best practices for FastAPI, including TestClient setup, async test support, fixture organization, and test database management.

**Questions to Answer**:
- How to configure pytest.ini for FastAPI projects?
- How to create test_client fixture using FastAPI TestClient?
- How to mock JWT tokens for authenticated endpoint testing?
- How to create test database fixtures (in-memory vs separate test DB)?
- How to organize conftest.py for reusable fixtures?

**Files to Research**: pytest documentation, FastAPI testing guide, pytest-asyncio if needed

**Complexity**: Medium

**Validation**: Document pytest.ini configuration and conftest.py fixture examples in research.md

---

#### Task 0.4: SQLModel + Neon PostgreSQL Connection Patterns
**Description**: Research SQLModel engine and session management for Neon PostgreSQL, including connection string format, async vs sync sessions, and connection pooling.

**Questions to Answer**:
- What is the Neon PostgreSQL connection string format?
- How to create SQLModel engine with proper connection pooling?
- How to implement get_db dependency that yields sessions with proper cleanup?
- Async vs sync SQLModel sessions - which to use with FastAPI?
- How to handle database connection errors gracefully?

**Files to Research**: SQLModel documentation, Neon PostgreSQL docs, FastAPI database integration patterns

**Complexity**: Medium

**Validation**: Document db.py implementation pattern in research.md with connection string example

---

#### Task 0.5: User Isolation Query Filtering Patterns
**Description**: Research SQLModel query patterns for filtering by user_id, ensuring all task queries are scoped to authenticated user to prevent data leakage.

**Questions to Answer**:
- How to add WHERE user_id = ? filter to all task queries in SQLModel?
- Best practices for preventing accidental unfiltered queries (linting, decorators)?
- How to validate path parameter user_id matches JWT user_id?
- How to return 403 Forbidden vs 404 Not Found based on user_id mismatch?

**Files to Research**: SQLModel query documentation, FastAPI security best practices

**Complexity**: High (security-critical)

**Validation**: Document query filtering pattern examples in research.md with security notes

---

#### Task 0.6: TDD Workflow Documentation
**Description**: Research and document red-green-refactor TDD workflow specific to FastAPI development, including test-first endpoint development patterns.

**Questions to Answer**:
- What does a typical TDD cycle look like for a FastAPI endpoint?
- How to write failing tests before implementing endpoint handlers?
- How to organize test files (one per endpoint vs grouped by feature)?
- How to test authentication, authorization, and business logic separately?

**Files to Research**: TDD best practices, FastAPI testing patterns, pytest organization guides

**Complexity**: Low

**Validation**: Document TDD workflow examples in research.md with red-green-refactor examples

---

### Research Consolidation

After completing all research tasks, create `research.md` with the following structure:

```markdown
# Research: Backend Phase 0 - JWT Security & TDD Patterns

## Decision 1: JWT Verification with PyJWT

**Decision**: Use PyJWT with HS256 algorithm for JWT signature verification

**Rationale**:
- Better Auth uses HS256 by default with shared secret
- PyJWT is industry-standard Python JWT library
- Simple integration with FastAPI dependency injection

**Code Example**:
[Include JWT verification function]

**Alternatives Considered**:
- python-jose: More features but heavier dependency
- Manual JWT parsing: Security risk, reinventing wheel

---

## Decision 2: FastAPI Dependency Injection for Auth

[Continue for all 6 research tasks]
```

**Phase 0 Gate**: All NEEDS CLARIFICATION items from Technical Context must be resolved in research.md before proceeding to Phase 1.

---

## Phase 1: Design & Contracts

**Goal**: Design data models, define API contracts, create developer quickstart guide, and update agent context with new technologies.

**Prerequisites**: research.md complete with all decisions documented

**Outputs**: `data-model.md`, `/contracts/openapi.yaml`, `quickstart.md`, updated `CLAUDE.md`

### Design Tasks

#### Task 1.1: Data Model Design
**Description**: Define SQLModel Task model and User reference based on spec requirements, including fields, types, relationships, and validation rules.

**Entities to Model**:

**Task Entity**:
- id: int (primary key, auto-increment)
- user_id: str (foreign key to users.id, indexed, non-nullable)
- title: str (max 200 chars, non-nullable)
- description: str (optional, max 1000 chars)
- completed: bool (default False)
- created_at: datetime (auto-set on creation)
- updated_at: datetime (auto-update on modification)

**User Entity** (reference only - managed by Better Auth):
- id: str (primary key from Better Auth)
- email: str
- name: str
- [Backend only reads from users table, never writes]

**Relationships**:
- Task.user_id → User.id (many-to-one)

**Validation Rules**:
- Title required, 1-200 characters
- Description optional, max 1000 characters
- user_id must match authenticated user from JWT
- completed defaults to False, boolean only

**Files**: Create `data-model.md`

**Complexity**: Low

**Validation**: data-model.md includes entity diagrams, field specifications, and validation rules

---

#### Task 1.2: API Contract Generation (OpenAPI)
**Description**: Generate OpenAPI 3.0 specification for all 6 task endpoints with request/response schemas, authentication requirements, and error responses.

**Endpoints to Define**:

1. **GET /api/{user_id}/tasks**
   - Summary: List all tasks for authenticated user
   - Parameters: user_id (path), skip (query, default 0), limit (query, default 100)
   - Responses: 200 (Task[]), 401 (Unauthorized), 403 (Forbidden)
   - Security: Bearer JWT

2. **POST /api/{user_id}/tasks**
   - Summary: Create new task for authenticated user
   - Parameters: user_id (path)
   - Request Body: {title, description?}
   - Responses: 201 (Task), 400 (Bad Request), 401, 403
   - Security: Bearer JWT

3. **GET /api/{user_id}/tasks/{task_id}**
   - Summary: Get single task by ID
   - Parameters: user_id (path), task_id (path)
   - Responses: 200 (Task), 401, 403, 404 (Not Found)
   - Security: Bearer JWT

4. **PUT /api/{user_id}/tasks/{task_id}**
   - Summary: Update task (full replacement)
   - Parameters: user_id (path), task_id (path)
   - Request Body: {title, description?, completed}
   - Responses: 200 (Task), 400, 401, 403, 404
   - Security: Bearer JWT

5. **DELETE /api/{user_id}/tasks/{task_id}**
   - Summary: Delete task
   - Parameters: user_id (path), task_id (path)
   - Responses: 204 (No Content), 401, 403, 404
   - Security: Bearer JWT

6. **PATCH /api/{user_id}/tasks/{task_id}/complete**
   - Summary: Toggle task completion status
   - Parameters: user_id (path), task_id (path)
   - Responses: 200 (Task), 401, 403, 404
   - Security: Bearer JWT

**Security Scheme**:
```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```

**Common Error Responses**:
- 401: {detail: "Invalid or missing token"}
- 403: {detail: "User ID mismatch - cannot access other users' data"}
- 404: {detail: "Task not found"}

**Files**: Create `/contracts/openapi.yaml`

**Complexity**: Medium

**Validation**: OpenAPI spec validates in Swagger Editor, all 6 endpoints documented

---

#### Task 1.3: Quickstart Guide Creation
**Description**: Create developer onboarding guide with step-by-step instructions for environment setup, dependency installation, and running the server.

**Quickstart Sections**:

1. **Prerequisites**
   - Python 3.9+
   - uv or venv
   - Git

2. **Setup Steps**
   ```bash
   # 1. Clone and navigate
   cd fullstack-todo-app/backend

   # 2. Create virtual environment (if using venv)
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows

   # 3. Install dependencies
   uv pip install fastapi uvicorn[standard] sqlmodel psycopg2-binary python-dotenv pyjwt[crypto] python-multipart pytest httpx

   # 4. Configure environment
   cp .env.example .env
   # Edit .env: Set DATABASE_URL and BETTER_AUTH_SECRET

   # 5. Run server
   uvicorn app.main:app --reload --port 8000

   # 6. Verify
   # Open http://localhost:8000/docs
   ```

3. **Running Tests**
   ```bash
   pytest -v
   pytest tests/test_auth.py -v  # Auth tests only
   pytest --cov=app tests/       # With coverage
   ```

4. **Troubleshooting**
   - Port 8000 in use: Change port with --port 8001
   - Import errors: Verify virtual environment activated
   - Database connection: Check DATABASE_URL format
   - JWT errors: Ensure BETTER_AUTH_SECRET matches frontend

**Files**: Create `quickstart.md`

**Complexity**: Low

**Validation**: Developer can follow quickstart and have working environment in <10 minutes

---

#### Task 1.4: Comprehensive CLAUDE.md Documentation
**Description**: Create comprehensive developer reference covering project structure, JWT verification patterns, user isolation, error handling, TDD workflow, and best practices.

**CLAUDE.md Sections** (minimum 300 lines):

1. **Project Overview**
   - Purpose: Secure multi-user Todo API
   - Tech stack: FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT
   - Architecture: API-first, TDD-driven, security-first design

2. **Project Structure**
   - Detailed breakdown of app/ directory
   - Test organization and naming conventions
   - Configuration file purposes

3. **JWT Authentication Architecture**
   - Better Auth JWT flow diagram
   - JWT token structure and claims
   - Signature verification with BETTER_AUTH_SECRET
   - User ID extraction from JWT
   - User ID validation (JWT user_id vs path user_id)
   - Error handling: 401 vs 403 vs 404

4. **User Isolation Pattern**
   - CRITICAL: All queries MUST filter by user_id
   - Query examples with user_id filtering
   - Forbidden patterns (unfiltered queries)
   - Testing user isolation

5. **Dependency Injection**
   - get_db: Database session management
   - get_current_user: JWT verification + user extraction
   - Composing dependencies
   - Type hints for dependencies

6. **Error Handling**
   - HTTPException usage
   - Status codes and when to use them
   - Error response format
   - Security considerations (don't leak info)

7. **Request/Response Schemas**
   - Pydantic model organization
   - Validation rules
   - Schema inheritance patterns

8. **Test-Driven Development Workflow**
   - Red-Green-Refactor cycle
   - Test organization (unit, integration, contract)
   - Writing tests before implementation
   - Fixture usage (test_client, mock_jwt, test_db)
   - Running and debugging tests

9. **Database Patterns**
   - SQLModel session management
   - Transaction handling
   - Query patterns with user_id filtering
   - Migration strategy (future phase)

10. **API Conventions**
    - All routes under /api/{user_id}/
    - RESTful verb usage
    - Response status codes
    - CORS configuration

11. **Environment Configuration**
    - Required variables: DATABASE_URL, BETTER_AUTH_SECRET
    - .env.example template
    - Security: Never commit .env

12. **Running & Development**
    - uvicorn command options
    - Hot reload in development
    - Debugging FastAPI apps
    - API docs at /docs and /redoc

**Code Examples Throughout**:
- JWT verification function with error handling
- get_current_user dependency implementation
- User ID validation example
- Query filtering pattern
- Test examples (valid JWT, invalid token, user_id mismatch)
- Endpoint handler with authentication

**Files**: Create `backend/CLAUDE.md`

**Complexity**: High (comprehensive documentation)

**Validation**:
- CLAUDE.md has 300+ lines
- All security patterns documented with code examples
- Developer can understand security model without looking at implementation code

---

#### Task 1.5: Agent Context Update
**Description**: Run agent context update script to add Phase 0 technologies to appropriate agent context file (CLAUDE.md or similar).

**Command**:
```bash
cd /home/hamza_ahmed/fullstack-todo-app
.specify/scripts/bash/update-agent-context.sh claude
```

**Technologies to Add**:
- Python 3.9+
- FastAPI
- SQLModel
- Neon PostgreSQL
- PyJWT (JWT verification)
- pytest + httpx (testing)
- uvicorn (ASGI server)
- Better Auth JWT integration

**Files**: Updates root `/home/hamza_ahmed/fullstack-todo-app/CLAUDE.md`

**Complexity**: Low (automated script)

**Validation**: CLAUDE.md contains new technologies in appropriate section, manual additions preserved

---

### Phase 1 Gate

**Requirements before proceeding to Phase 2 (tasks breakdown)**:
- ✅ data-model.md created with Task and User entity specifications
- ✅ /contracts/openapi.yaml created with all 6 endpoint definitions
- ✅ quickstart.md created with setup and run instructions
- ✅ backend/CLAUDE.md created with 300+ lines covering all security patterns
- ✅ Agent context updated with Phase 0 technologies
- ✅ Re-run Constitution Check - all principles still satisfied

**Gate Validation**: Review all Phase 1 outputs for completeness and accuracy before running `/sp.tasks`

---

## Phase 2: Task Breakdown

**NOTE**: Phase 2 (task breakdown) is executed via `/sp.tasks` command, NOT part of `/sp.plan` output.

After Phase 1 design completion, run:
```bash
/sp.tasks
```

This will generate `tasks.md` with actionable, dependency-ordered implementation tasks for executing Phase 0 (verification) and preparing for Phase 1 (implementation).

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| JWT secret mismatch between frontend and backend | 401 errors on all authenticated requests | Document BETTER_AUTH_SECRET sharing process; create shared .env template; test JWT verification with known token from frontend |
| Neon PostgreSQL connection failures | Cannot test database integration in Phase 1 | Document Neon connection string format in research.md; test connection in Phase 1 setup; provide fallback to local PostgreSQL for development |
| user_id type mismatch (string vs int) | Query filtering fails, potential security breach | Normalize user_id to string in JWT extraction; document type in data-model.md; add type validation in get_current_user dependency |
| Unfiltered queries expose user data | Critical security vulnerability, user data leakage | Document user isolation pattern extensively in CLAUDE.md; create test_user_isolation.py with cross-user access tests; code review checklist for query filtering |
| Missing or misconfigured virtual environment | Dependency installation fails, import errors | Document virtual environment setup in quickstart.md; provide troubleshooting section; verify environment activation in setup scripts |
| Port 8000 already in use | Server won't start | Document port configuration in quickstart.md; provide alternative port example; add port availability check to startup |
| Pytest not discovering test files | Tests don't run, false sense of passing | Configure pytest.ini with testpaths; document test file naming conventions (test_*.py); validate pytest discovery in Phase 0 |
| BETTER_AUTH_SECRET not configured | JWT verification fails with cryptic errors | Create .env.example with clear placeholders; document environment setup prominently in quickstart.md; add validation on server startup |

---

## Final Commands

### Development Workflow

```bash
# 1. Navigate to backend
cd /home/hamza_ahmed/fullstack-todo-app/backend

# 2. Activate virtual environment (if using venv)
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# 3. Install dependencies (Phase 0)
uv pip install fastapi uvicorn[standard] sqlmodel psycopg2-binary python-dotenv pyjwt[crypto] python-multipart pytest httpx

# 4. Configure environment
cp .env.example .env
# Edit .env: Set DATABASE_URL=postgresql://user:pass@host/db and BETTER_AUTH_SECRET=your-secret

# 5. Run backend server
uvicorn app.main:app --reload --port 8000

# 6. Verify FastAPI docs
# Open http://localhost:8000/docs in browser

# 7. Run test suite (Phase 1+)
pytest -v
pytest --cov=app tests/  # With coverage report

# 8. Run specific test files
pytest tests/test_auth.py -v
pytest tests/test_user_isolation.py -v
```

### Testing Endpoints Manually

```bash
# List tasks (requires valid JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/USER_ID/tasks

# Create task
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"From curl"}' \
  http://localhost:8000/api/USER_ID/tasks

# Get task by ID
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/USER_ID/tasks/1

# Update task
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","completed":false}' \
  http://localhost:8000/api/USER_ID/tasks/1

# Toggle completion
curl -X PATCH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/USER_ID/tasks/1/complete

# Delete task
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/USER_ID/tasks/1
```

### Frontend Integration

```bash
# Update frontend .env to point to backend
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> frontend/.env.local

# Ensure BETTER_AUTH_SECRET matches between frontend and backend
# Frontend: frontend/.env.local
# Backend: backend/.env
```

---

## Success Criteria Mapping

| Success Criterion | Validation Method | Phase |
|-------------------|-------------------|-------|
| SC-001: Verify backend folder and files in <5 min | Developer runs quickstart checklist | Phase 0 |
| SC-002: All dependencies install without errors | Run `uv pip install ...` successfully | Phase 0 |
| SC-003: Server starts and /docs accessible in <10s | Visit http://localhost:8000/docs | Phase 0 |
| SC-004: CLAUDE.md has 300+ lines | Word count: `wc -l backend/CLAUDE.md` | Phase 1 |
| SC-005: Developer can explain security model | Review CLAUDE.md JWT and isolation sections | Phase 1 |
| SC-006: pytest discovers test files | Run `pytest --collect-only` | Phase 0 |
| SC-007: No implementation code in Phase 0 | Manual review: no JWT middleware, models, routes | Phase 0 |
| SC-008: Developer confirms Phase 1 readiness | Complete Phase 0 checklist, all gates passed | Phase 0 |

---

## Next Steps

After completing this plan:

1. **Run `/sp.tasks`** to generate detailed task breakdown in `tasks.md`
2. **Execute Phase 0 tasks** (research and design) to complete all planning artifacts
3. **Run `/sp.implement`** to begin TDD implementation starting with Phase 1
4. **Create ADRs** with `/sp.adr` for architecturally significant decisions
5. **Record prompts** with `/sp.phr` for traceability

**Phase 0 Completion Checklist**:
- [ ] research.md created with all 6 research decisions documented
- [ ] data-model.md created with Task and User entities
- [ ] /contracts/openapi.yaml created with all 6 endpoints
- [ ] quickstart.md created with setup instructions
- [ ] backend/CLAUDE.md created with 300+ lines
- [ ] Agent context updated with Phase 0 technologies
- [ ] Constitution check passed (re-verified after design)
- [ ] All success criteria validated
- [ ] Ready to run `/sp.tasks` for task breakdown

**Priorities for Phase 0**:
✅ **Security first**: Comprehensive JWT and user isolation documentation before any implementation
✅ **TDD mandatory**: Test structure and workflow documented, pytest configured
✅ **Spec compliance**: All 15 functional requirements addressed in plan
✅ **Hackathon speed**: Focus on verification and documentation, defer implementation to Phase 1

---

**Plan Status**: Ready for Phase 0 execution. Run `/sp.tasks` to generate actionable task breakdown.
