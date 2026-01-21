---
description: "Task list for Backend Phase 0 - Verification and Initial Setup with TDD"
---

# Tasks: Backend Phase 0 - Verification and Initial Setup

**Input**: Design documents from `/specs/005-backend-phase0-setup/`
**Prerequisites**: plan.md (complete), spec.md (complete with 3 user stories)

**Tests**: TDD is MANDATORY for this feature. All tests must be written FIRST, fail, then implementation follows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `backend/tests/`
- All paths relative to repository root: `/home/hamza_ahmed/fullstack-todo-app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and basic structure verification

- [ ] T001 Verify backend folder exists at `/home/hamza_ahmed/fullstack-todo-app/backend/`
- [ ] T002 Verify Python 3.9+ installed: `python --version`
- [ ] T003 Verify virtual environment is configured (uv or venv)
- [ ] T004 Install core dependencies: `cd backend && uv pip install fastapi uvicorn[standard] sqlmodel psycopg2-binary python-dotenv pyjwt[crypto] python-multipart`
- [ ] T005 [P] Install testing dependencies: `cd backend && uv pip install pytest httpx pytest-cov`
- [ ] T006 [P] Create backend directory structure: `backend/app/`, `backend/tests/`, `backend/app/routes/`
- [ ] T007 [P] Create `__init__.py` files in `backend/app/`, `backend/tests/`, `backend/app/routes/`

**Checkpoint**: Dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration and documentation that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create `.env.example` file at `backend/.env.example` with DATABASE_URL and BETTER_AUTH_SECRET placeholders
- [ ] T009 Create `pytest.ini` configuration file at `backend/pytest.ini` with testpaths and python_files settings
- [ ] T010 [P] Create research.md documenting all 6 research decisions at `/home/hamza_ahmed/fullstack-todo-app/specs/005-backend-phase0-setup/research.md`
- [ ] T011 [P] Create data-model.md with Task and User entity specifications at `/home/hamza_ahmed/fullstack-todo-app/specs/005-backend-phase0-setup/data-model.md`
- [ ] T012 Create `contracts/` directory at `/home/hamza_ahmed/fullstack-todo-app/specs/005-backend-phase0-setup/contracts/`
- [ ] T013 Create OpenAPI 3.0 specification for all 6 endpoints at `/home/hamza_ahmed/fullstack-todo-app/specs/005-backend-phase0-setup/contracts/openapi.yaml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Backend Developer Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Verify and prepare local development environment with all dependencies installed and server running successfully

**Independent Test**: Run FastAPI server at http://localhost:8000/docs and verify interactive API documentation loads without errors

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T014 [P] [US1] Create pytest fixture for test_client in `backend/tests/conftest.py`
- [ ] T015 [P] [US1] Create basic health check test to verify server starts in `backend/tests/test_health.py`

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create minimal FastAPI app with health endpoint in `backend/app/main.py`
- [ ] T017 [P] [US1] Create placeholder db.py with connection string validation in `backend/app/db.py`
- [ ] T018 [P] [US1] Create placeholder models.py with Task and User model stubs in `backend/app/models.py`
- [ ] T019 [P] [US1] Create placeholder schemas.py with request/response schema stubs in `backend/app/schemas.py`
- [ ] T020 [P] [US1] Create placeholder dependencies.py with get_db and get_current_user stubs in `backend/app/dependencies.py`
- [ ] T021 [P] [US1] Create placeholder tasks.py route file in `backend/app/routes/tasks.py`
- [ ] T022 [US1] Verify all tests pass: Run `cd backend && pytest -v`
- [ ] T023 [US1] Verify server starts successfully: Run `cd backend && uvicorn app.main:app --reload --port 8000`
- [ ] T024 [US1] Verify FastAPI docs accessible at http://localhost:8000/docs

**Checkpoint**: At this point, User Story 1 should be fully functional - environment verified, server running, all files in place

---

## Phase 4: User Story 2 - Understanding JWT Security Architecture (Priority: P1)

**Goal**: Create comprehensive CLAUDE.md documentation covering JWT verification, user isolation, TDD workflow, and security patterns

**Independent Test**: Review CLAUDE.md file and confirm it contains complete sections on JWT verification, user_id extraction/validation, query filtering, and error handling with 300+ lines

### Tests for User Story 2 ⚠️

> **NOTE: Create validation test to verify documentation completeness**

- [ ] T025 [US2] Create documentation validation test in `backend/tests/test_documentation.py` to verify CLAUDE.md exists and has 300+ lines

### Implementation for User Story 2

- [ ] T026 [US2] Create comprehensive backend/CLAUDE.md with Project Overview section (purpose, tech stack, architecture)
- [ ] T027 [US2] Add Project Structure section to backend/CLAUDE.md (app/ breakdown, test organization, config files)
- [ ] T028 [US2] Add JWT Authentication Architecture section to backend/CLAUDE.md (Better Auth flow, token structure, signature verification, user ID extraction, validation, error handling 401/403/404)
- [ ] T029 [US2] Add User Isolation Pattern section to backend/CLAUDE.md (CRITICAL: all queries filter by user_id, query examples, forbidden patterns, testing user isolation)
- [ ] T030 [US2] Add Dependency Injection section to backend/CLAUDE.md (get_db, get_current_user, composing dependencies, type hints)
- [ ] T031 [US2] Add Error Handling section to backend/CLAUDE.md (HTTPException usage, status codes, error response format, security considerations)
- [ ] T032 [US2] Add Request/Response Schemas section to backend/CLAUDE.md (Pydantic model organization, validation rules, schema inheritance)
- [ ] T033 [US2] Add Test-Driven Development Workflow section to backend/CLAUDE.md (Red-Green-Refactor cycle, test organization, writing tests before implementation, fixture usage, running/debugging tests)
- [ ] T034 [US2] Add Database Patterns section to backend/CLAUDE.md (SQLModel session management, transaction handling, query patterns with user_id filtering, migration strategy)
- [ ] T035 [US2] Add API Conventions section to backend/CLAUDE.md (routes under /api/{user_id}/, RESTful verbs, response status codes, CORS configuration)
- [ ] T036 [US2] Add Environment Configuration section to backend/CLAUDE.md (required variables, .env.example template, security: never commit .env)
- [ ] T037 [US2] Add Running & Development section to backend/CLAUDE.md (uvicorn command options, hot reload, debugging FastAPI apps, API docs at /docs and /redoc)
- [ ] T038 [US2] Add code examples throughout backend/CLAUDE.md (JWT verification function, get_current_user dependency, user ID validation, query filtering pattern, test examples)
- [ ] T039 [US2] Verify CLAUDE.md has 300+ lines: `wc -l backend/CLAUDE.md`
- [ ] T040 [US2] Verify documentation validation test passes: Run `cd backend && pytest tests/test_documentation.py -v`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - comprehensive documentation created and validated

---

## Phase 5: User Story 3 - Test-Driven Development Foundation (Priority: P2)

**Goal**: Establish complete test directory structure with placeholder test files and pytest configuration for TDD workflow

**Independent Test**: Verify test directory structure exists with placeholder test files and pytest discovers all test files successfully

### Tests for User Story 3 ⚠️

> **NOTE: Create test structure validation**

- [ ] T041 [US3] Create test to verify all required test files exist in `backend/tests/test_structure.py`

### Implementation for User Story 3

- [ ] T042 [P] [US3] Create comprehensive conftest.py with mock_jwt_token fixture in `backend/tests/conftest.py`
- [ ] T043 [P] [US3] Create test_auth.py with placeholder JWT verification tests in `backend/tests/test_auth.py`
- [ ] T044 [P] [US3] Create test_jwt_middleware.py with placeholder user ID validation tests in `backend/tests/test_jwt_middleware.py`
- [ ] T045 [P] [US3] Create test_tasks.py with placeholder task CRUD endpoint tests in `backend/tests/test_tasks.py`
- [ ] T046 [P] [US3] Create test_user_isolation.py with placeholder user data isolation tests in `backend/tests/test_user_isolation.py`
- [ ] T047 [US3] Verify pytest discovers all test files: Run `cd backend && pytest --collect-only`
- [ ] T048 [US3] Verify test structure validation passes: Run `cd backend && pytest tests/test_structure.py -v`
- [ ] T049 [US3] Add TDD workflow examples to backend/CLAUDE.md demonstrating red-green-refactor cycle with FastAPI endpoint example

**Checkpoint**: All user stories should now be independently functional - complete test structure in place, pytest configured, TDD workflow documented

---

## Phase 6: Documentation & Knowledge Transfer

**Purpose**: Create quickstart guide and update agent context

- [ ] T050 [P] Create quickstart.md with Prerequisites section at `/home/hamza_ahmed/fullstack-todo-app/specs/005-backend-phase0-setup/quickstart.md`
- [ ] T051 [P] Add Setup Steps section to quickstart.md (clone, virtual environment, install dependencies, configure .env, run server, verify)
- [ ] T052 [P] Add Running Tests section to quickstart.md (pytest commands, coverage, specific test files)
- [ ] T053 [P] Add Troubleshooting section to quickstart.md (port conflicts, import errors, database connection, JWT errors)
- [ ] T054 Update root CLAUDE.md with Phase 0 technologies: Run `cd /home/hamza_ahmed/fullstack-todo-app && .specify/scripts/bash/update-agent-context.sh claude`
- [ ] T055 Verify quickstart guide is executable: Follow quickstart.md steps in fresh environment

**Checkpoint**: Documentation complete, knowledge transfer artifacts ready

---

## Phase 7: Phase 0 Validation & Gate Check

**Purpose**: Validate all Phase 0 success criteria and confirm readiness for Phase 1 implementation

- [ ] T056 Validate SC-001: Developer can verify backend folder exists and contains all required files within 5 minutes
- [ ] T057 Validate SC-002: All seven required dependencies install successfully without errors
- [ ] T058 Validate SC-003: FastAPI development server starts successfully and responds at http://localhost:8000/docs within 10 seconds
- [ ] T059 Validate SC-004: CLAUDE.md file contains at least 300 lines: Run `wc -l backend/CLAUDE.md`
- [ ] T060 Validate SC-005: Developer can explain JWT verification and user isolation security model after reading CLAUDE.md documentation
- [ ] T061 Validate SC-006: Test structure is in place and pytest discovers test files: Run `cd backend && pytest --collect-only`
- [ ] T062 Validate SC-007: No implementation code exists for JWT middleware, models, or routes - only placeholder/template structures
- [ ] T063 Validate SC-008: Complete Phase 0 completion checklist in plan.md
- [ ] T064 Run full test suite to confirm all placeholder tests pass: Run `cd backend && pytest -v`
- [ ] T065 Create Phase 0 completion report documenting all validated success criteria

**Checkpoint**: Phase 0 complete - ready to proceed to Phase 1 (JWT implementation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Documentation (Phase 6)**: Can start after US1, US2 complete
- **Validation (Phase 7)**: Depends on all phases 1-6 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - BLOCKS validation
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Can run in parallel with US1 - BLOCKS validation
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Can run in parallel with US1/US2 - BLOCKS validation

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- All placeholder files created in parallel where marked [P]
- Validation steps run after implementation complete
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T005 can run in parallel with T004; T006, T007 can run in parallel
- **Phase 2**: T010, T011 can run in parallel
- **Phase 3**: T014, T015 can run in parallel (tests); T016-T021 can all run in parallel (placeholder files)
- **Phase 4**: All CLAUDE.md sections (T026-T038) can be drafted in parallel, then assembled
- **Phase 5**: T042-T046 can all run in parallel (test file creation)
- **Phase 6**: T050-T053 can run in parallel (quickstart sections)

---

## Parallel Example: User Story 1

```bash
# Launch all placeholder files for User Story 1 together:
Task: "Create minimal FastAPI app with health endpoint in backend/app/main.py"
Task: "Create placeholder db.py with connection string validation in backend/app/db.py"
Task: "Create placeholder models.py with Task and User model stubs in backend/app/models.py"
Task: "Create placeholder schemas.py with request/response schema stubs in backend/app/schemas.py"
Task: "Create placeholder dependencies.py with get_db and get_current_user stubs in backend/app/dependencies.py"
Task: "Create placeholder tasks.py route file in backend/app/routes/tasks.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Dependencies installed, structure verified
2. Complete Phase 2: Foundational → Documentation templates ready
3. Complete Phase 3: User Story 1 → Environment verified, server running
4. **STOP and VALIDATE**: Test User Story 1 independently - server must start and serve /docs
5. Optionally proceed to US2/US3 or move to Phase 1 implementation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Environment verified (MVP!)
3. Add User Story 2 → Test independently → Documentation complete
4. Add User Story 3 → Test independently → TDD foundation ready
5. Validation → Confirm all success criteria met
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (environment setup)
   - Developer B: User Story 2 (CLAUDE.md documentation)
   - Developer C: User Story 3 (test structure)
3. Developer D: Quickstart guide (can start after US1/US2)
4. Stories complete and validate independently

---

## TDD Workflow for Phase 0

### Red-Green-Refactor Cycle

Phase 0 uses TDD primarily for validation, not feature implementation:

1. **RED**: Write validation tests that check for file existence, documentation completeness, configuration correctness
2. **GREEN**: Create the files, documentation, and configuration to make tests pass
3. **REFACTOR**: Improve documentation clarity, file organization, test coverage

### Example: User Story 1 (Environment Setup)

**RED Phase**:
```python
# backend/tests/test_health.py
def test_health_endpoint_exists(test_client):
    """Verify FastAPI server has health endpoint"""
    response = test_client.get("/health")
    assert response.status_code == 200  # FAILS - endpoint doesn't exist yet
```

**GREEN Phase**:
```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}  # Now test PASSES
```

**REFACTOR Phase**:
```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(
    title="Todo API",
    description="Secure multi-user Todo API with JWT authentication",
    version="0.1.0"
)

@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "ok", "version": "0.1.0"}  # Improved with docs and metadata
```

### Example: User Story 2 (Documentation)

**RED Phase**:
```python
# backend/tests/test_documentation.py
def test_claude_md_exists():
    """Verify CLAUDE.md exists"""
    assert Path("backend/CLAUDE.md").exists()  # FAILS - file doesn't exist

def test_claude_md_has_minimum_lines():
    """Verify CLAUDE.md has at least 300 lines"""
    with open("backend/CLAUDE.md") as f:
        lines = len(f.readlines())
    assert lines >= 300  # FAILS - file too short or doesn't exist
```

**GREEN Phase**:
```bash
# Create backend/CLAUDE.md with all 12 sections documented
# Add code examples, security patterns, TDD workflow
# Ensure file has 300+ lines
```

**REFACTOR Phase**:
```markdown
<!-- backend/CLAUDE.md -->
# Backend Developer Guidelines

## Table of Contents
[Add clear TOC for easy navigation]

## Code Examples
[Improve example quality, add inline comments, show error cases]
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD red-green-refactor)
- Phase 0 is PREPARATION ONLY - no actual JWT middleware or CRUD implementation
- All placeholder files should have clear docstrings indicating they're templates
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Phase 0 complete → Ready for Phase 1 (JWT implementation with real code)

---

## Success Criteria Checklist

Phase 0 is complete when ALL of these are validated:

- ✅ Backend folder structure verified with all required directories
- ✅ All 7 dependencies installed without errors (fastapi, uvicorn, sqlmodel, psycopg2-binary, python-dotenv, pyjwt, python-multipart)
- ✅ pytest and httpx installed for testing
- ✅ Server starts and /docs endpoint accessible in <10 seconds
- ✅ backend/CLAUDE.md created with 300+ lines of comprehensive documentation
- ✅ All 12 CLAUDE.md sections complete (Project Overview, JWT Auth, User Isolation, etc.)
- ✅ Test structure created (conftest.py, test_auth.py, test_jwt_middleware.py, test_tasks.py, test_user_isolation.py)
- ✅ pytest discovers all test files successfully (`pytest --collect-only`)
- ✅ All validation tests pass
- ✅ .env.example created with DATABASE_URL and BETTER_AUTH_SECRET
- ✅ pytest.ini configured
- ✅ research.md created with 6 research decisions
- ✅ data-model.md created with Task and User entities
- ✅ contracts/openapi.yaml created with all 6 endpoints
- ✅ quickstart.md created with setup and troubleshooting
- ✅ Root CLAUDE.md updated with Phase 0 technologies
- ✅ No actual implementation code (only placeholders/templates)
- ✅ Developer can explain JWT verification and user isolation security model

**Total Tasks**: 65 tasks across 7 phases
**Estimated Time**: 8-12 hours for single developer (4-6 hours with parallel execution)
**MVP Scope**: User Story 1 (environment verified, server running) = 24 tasks (Phases 1-3)
