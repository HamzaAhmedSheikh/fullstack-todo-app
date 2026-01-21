---
id: 0001
title: backend-phase0-spec-creation-with-tdd
stage: spec
date: 2026-01-07
surface: cli
model: claude-sonnet-4-5
feature: 005-backend-phase0-setup
branch: 005-backend-phase0-setup
user: hamza_ahmed
command: /sp.specify
labels: [backend, phase0, setup, jwt, tdd, fastapi, specification]
links:
  spec: /specs/005-backend-phase0-setup/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: /specs/005-backend-phase0-setup/spec.md
    status: created
  - path: /specs/005-backend-phase0-setup/checklists/requirements.md
    status: created
tests:
  - N/A (Phase 0 spec - no implementation yet)
---

## Prompt

User requested via `/sp.specify` command to create or update backend specification with comprehensive Phase 0 setup instructions and test-driven development approach.

**Full user input**:
```
update or overwrite the backend spec to this these specs also do the test driven developement
You are an expert Python FastAPI backend developer building the secure multi-user Todo API for the full-stack application.

You have already read and fully understood the complete Phase II requirements, including:

- Technology stack: FastAPI, SQLModel, Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT tokens using shared secret BETTER_AUTH_SECRET
- Full "Securing the REST API" section:
  - Better Auth issues JWT on frontend login
  - Frontend attaches JWT in Authorization: Bearer <token> header
  - Backend must verify JWT signature using the same BETTER_AUTH_SECRET
  - Backend extracts user information (especially user_id) from decoded JWT
  - Backend matches decoded user_id with {user_id} in URL path (for endpoints like /api/{user_id}/tasks/*)
  - All queries MUST be filtered by authenticated user_id
  - Requests without valid token → 401 Unauthorized
  - Strict user isolation: users can only access/modify their own tasks
- API endpoints use /api/{user_id}/tasks/* pattern (user_id from path, validated against JWT)
- Database schema: tasks table has user_id foreign key to users.id (users table managed by Better Auth)
- All relevant specs: @specs/api/rest-endpoints.md, @specs/features/task-crud.md, @specs/features/authentication.md, @specs/database/schema.md

### Current Status
- The monorepo root exists.
- The `frontend/` folder is complete.
- The `backend/` folder already exists and is a FastAPI project initialized with `uv` (or similar virtual environment tool).
- Dependencies may or may not be installed yet.
- We are starting with **Phase 0 – Backend Verification & Initial Setup Confirmation**.

### Task for This Phase Only
Confirm the existing backend setup and prepare for implementation.

Perform ONLY these steps:
1. Ask the user to confirm backend folder exists with basic FastAPI app, virtual environment setup, and list installed dependencies
2. Provide exact commands to install/ensure required dependencies: fastapi, uvicorn[standard], sqlmodel, psycopg2-binary, python-dotenv, pyjwt[crypto], python-multipart
3. Provide structure that should exist: backend/app/main.py, app/db.py, app/models.py, app/schemas.py, app/dependencies.py, app/routes/tasks.py, .env.example
4. Create comprehensive `backend/CLAUDE.md` covering: project structure, JWT verification middleware, user_id validation, query filtering, error handling, SQLModel session dependency, response models
5. Provide command to run server: `uvicorn main:app --reload --port 8000`

### Output Format for This Phase
- Think step-by-step.
- Clearly list dependency installation command.
- Show full content of `backend/CLAUDE.md`.
- Show minimal starter content for main.py and other files if needed.
- At the end, write: "Backend preparation complete. Once you confirm the server runs at http://localhost:8000/docs and all dependencies are installed, reply with: 'Backend ready. Proceed to Phase 1.' I will then implement database connection, JWT authentication middleware, and user validation."

Do not implement actual JWT middleware, models, or routes yet.
Do not proceed to Phase 1.
Begin Phase 0 – Backend Verification & Initial Setup now.
```

## Response snapshot

**Branch created**: `005-backend-phase0-setup`

**Specification created**: `/specs/005-backend-phase0-setup/spec.md`

**Content summary**:
1. Created comprehensive Phase 0 specification focusing on backend environment verification and preparation
2. Defined 3 prioritized user stories:
   - P1: Backend Developer Environment Setup (verify environment, install dependencies, start server)
   - P1: Understanding JWT Security Architecture (comprehensive CLAUDE.md documentation)
   - P2: Test-Driven Development Foundation (test structure and TDD workflow)
3. Established 15 functional requirements covering environment verification, dependency installation, project structure, JWT security documentation, and TDD setup
4. Defined 8 measurable success criteria (e.g., server starts in 10 seconds, CLAUDE.md has 300+ lines, all dependencies install successfully)
5. Clearly bounded scope: Phase 0 is preparation only, no actual implementation
6. Documented assumptions (Python 3.9+, existing backend folder, development environment)
7. Identified dependencies (virtual environment, PyPI access, Neon PostgreSQL for Phase 1)
8. Added comprehensive edge cases for setup failure scenarios

**Validation results**: All spec quality checklist items passed - ready for `/sp.plan`

## Outcome

- ✅ Impact: Created complete Phase 0 specification for backend setup and preparation with comprehensive JWT security architecture documentation and TDD foundation
- 🧪 Tests: N/A (Phase 0 spec defines test structure - actual tests in Phase 1+)
- 📁 Files: 2 files created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: `/sp.plan` to create implementation plan, then `/sp.tasks` to generate task breakdown
- 🧠 Reflection: Successfully created a preparatory Phase 0 spec that prevents premature implementation while ensuring developers understand security architecture before coding. The spec emphasizes TDD from the start and establishes clear success criteria for environment readiness.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification created successfully with all quality checks passing
- Graders run and results (PASS/FAIL): Spec quality checklist - PASS (all 12 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding specific pytest configuration examples in Phase 1 spec to make TDD even more accessible
