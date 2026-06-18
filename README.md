# Fullstack Task Manager — Hackathon II

A multi-phase, spec-driven todo application that evolves from a polished Python CLI into a production-grade, multi-user full-stack web platform. Built for **Hackathon II** using [GitHub Spec-Kit](https://github.com/github/spec-kit) to demonstrate disciplined, specification-first development across the entire stack.

> Every feature in this repository starts as a written specification under `/specs`, is broken down into a plan and tasks, and only then becomes code.

---

## Table of Contents

- [Project Phases](#project-phases)
- [Repository Layout](#repository-layout)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Spec-Driven Workflow](#spec-driven-workflow)
- [Getting Started](#getting-started)
  - [Phase 1 — CLI App](#phase-1--cli-app)
  - [Phase 2 — Full-Stack App](#phase-2--full-stack-app)
- [Environment Variables](#environment-variables)
- [Specifications Index](#specifications-index)
- [Development Conventions](#development-conventions)
- [Contributing](#contributing)
- [License](#license)

---

## Project Phases

### Phase 1 — CLI Todo Application
A Python 3.13+ interactive command-line app with Questionary-powered prompts and Rich-formatted tables. Single user, in-memory storage, full CRUD, and 100% test coverage via TDD. This phase establishes the domain model and business logic that later phases build upon.

📂 [`/cli-todo-app`](./cli-todo-app) · 📑 [`specs/001-cli-todo-app`](./specs/001-cli-todo-app)

### Phase 2 — Full-Stack Task Management System
Transforms the single-user CLI into a modern, multi-user web application:

- Next.js 16 frontend with **Better Auth** for authentication (JWT)
- FastAPI backend with **JWKS-based** JWT verification
- **Neon Serverless PostgreSQL** persistence with per-user data isolation
- RESTful API, optimistic UI updates, dark mode, virtualized lists

📂 [`/phase-2-task-management-system`](./phase-2-task-management-system) · 📑 [`specs/002-fullstack-task-management`](./specs/002-fullstack-task-management)

---

## Repository Layout

```
fullstack-todo-app/
├── cli-todo-app/                       # Phase 1: Python CLI app
│   ├── src/                            # Application source
│   ├── tests/                          # Unit, integration, contract tests
│   └── README.md
│
├── phase-2-task-management-system/     # Phase 2: Full-stack app
│   ├── frontend/                       # Next.js 16 + React 19 + Tailwind 4
│   │   └── src/
│   ├── backend/                        # FastAPI + SQLModel + Alembic
│   │   ├── app/
│   │   └── tests/
│   └── README.md
│
├── specs/                              # Spec-Kit specifications
│   ├── 001-cli-todo-app/               # CLI app spec, plan, tasks
│   ├── 002-fullstack-task-management/  # Full-stack spec
│   ├── 003-jwt-verification-api-skill/ # JWT verification design
│   ├── 004-frontend-nextjs-spec/       # Next.js frontend spec
│   └── 005-backend-phase0-setup/       # Backend Phase 0 setup
│
├── history/                            # Prompt History Records (PHRs)
│   └── prompts/
│
└── CLAUDE.md                           # Project-wide AI assistant guidelines
```

---

## Architecture

### Phase 2 — High-level diagram

```
┌──────────────────┐       ┌────────────────────┐       ┌──────────────────┐
│   Next.js 16     │       │   FastAPI Backend  │       │   Neon Postgres  │
│   (Frontend)     │  JWT  │                    │  SQL  │                  │
│                  ├──────▶│  JWKS verification ├──────▶│  Per-user task   │
│  Better Auth     │       │  SQLModel ORM      │       │  isolation       │
│  React 19        │       │  Async endpoints   │       │                  │
│  Tailwind 4      │       │  Pydantic schemas  │       │                  │
└──────────────────┘       └────────────────────┘       └──────────────────┘
```

- **Authentication** is issued by Better Auth in the Next.js layer.
- **JWT verification** in FastAPI uses Better Auth's JWKS endpoint — no shared secrets.
- **Data isolation** is enforced at the query level by deriving `user_id` from the verified token.

---

## Tech Stack

### Phase 1 (CLI)
- **Python 3.13+**, `uv` package manager
- **Questionary** (interactive prompts), **Rich** (formatted output)
- **pytest** with TDD discipline

### Phase 2 — Frontend
- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** · **Radix UI** · **Lucide React** · **Sonner**
- **Better Auth 1.4** (JWT sessions)
- **Drizzle ORM** + **Neon Serverless Postgres**
- **react-window** for virtualized rendering

### Phase 2 — Backend
- **FastAPI** (Python 3.13+)
- **SQLModel** ORM on **PostgreSQL** (`asyncpg` / `psycopg`)
- **PyJWT** + `cryptography` for JWKS verification
- **Alembic** migrations
- **pytest** + `pytest-asyncio`

---

## Spec-Driven Workflow

This monorepo uses **GitHub Spec-Kit** to keep specifications and implementation in lockstep. Every feature follows the same lifecycle:

1. **Specify** — write `spec.md` capturing user stories, acceptance criteria, and constraints.
2. **Clarify** — resolve ambiguities and record answers back into the spec.
3. **Plan** — produce `plan.md` with research notes, data models, and architectural decisions.
4. **Tasks** — break the plan into a dependency-ordered `tasks.md`.
5. **Implement** — execute tasks against the spec; update the spec when reality diverges.
6. **PHR** — record significant AI exchanges in `/history/prompts` for traceability.

When using Claude Code with this repo, the corresponding slash commands are available: `/sp.specify`, `/sp.clarify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`, `/sp.phr`, `/sp.analyze`, and `/sp.adr`.

---

## Getting Started

### Prerequisites

- **Python** 3.13+ and [`uv`](https://docs.astral.sh/uv/) (or `pip`)
- **Node.js** 18+ and **npm**
- **PostgreSQL** database (Neon recommended for Phase 2)

### Phase 1 — CLI App

```bash
cd cli-todo-app
uv sync                       # or: pip install -r requirements.txt
python src/cli/main.py        # launch the interactive CLI
pytest                        # run the test suite
```

### Phase 2 — Full-Stack App

**Backend**

```bash
cd phase-2-task-management-system/backend
uv sync                                      # install Python deps
cp .env.example .env                         # configure DATABASE_URL, JWKS_URL
alembic upgrade head                         # apply migrations
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal)

```bash
cd phase-2-task-management-system/frontend
npm install
cp .env.example .env.local                   # configure auth + backend URLs
npm run db:push                              # provision Better Auth schema
npm run dev
```

The web app is then available at **http://localhost:3000** and the API at **http://localhost:8000** (interactive docs at `/docs`).

---

## Environment Variables

### Phase 2 Frontend (`frontend/.env.local`)

| Variable             | Description                                      |
| -------------------- | ------------------------------------------------ |
| `DATABASE_URL`       | Postgres connection string for Better Auth       |
| `BETTER_AUTH_SECRET` | Secret used to sign Better Auth tokens           |
| `BETTER_AUTH_URL`    | Public app URL (e.g. `http://localhost:3000`)    |
| `BACKEND_URL`        | FastAPI base URL (e.g. `http://localhost:8000`)  |

### Phase 2 Backend (`backend/.env`)

| Variable       | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string for task data                               |
| `JWKS_URL`     | Better Auth JWKS endpoint (e.g. `http://localhost:3000/api/auth/jwks`) |
| `JWT_AUDIENCE` | Expected JWT audience claim                                            |
| `JWT_ISSUER`   | Expected JWT issuer claim                                              |

---

## Specifications Index

| ID    | Title                                  | Path                                                                                       |
| ----- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| 001   | CLI Todo Application                   | [`specs/001-cli-todo-app`](./specs/001-cli-todo-app)                                       |
| 001   | Dark Mode UI                           | [`specs/001-dark-mode-ui`](./specs/001-dark-mode-ui)                                       |
| 002   | Full-Stack Task Management             | [`specs/002-fullstack-task-management`](./specs/002-fullstack-task-management)             |
| 003   | JWT Verification API Skill             | [`specs/003-jwt-verification-api-skill`](./specs/003-jwt-verification-api-skill)           |
| 004   | Frontend (Next.js) Spec                | [`specs/004-frontend-nextjs-spec`](./specs/004-frontend-nextjs-spec)                       |
| 005   | Backend Phase 0 Setup                  | [`specs/005-backend-phase0-setup`](./specs/005-backend-phase0-setup)                       |

Each spec directory typically contains: `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `research.md`, and a `checklists/` folder.

---

## Development Conventions

- **Read the spec first.** Reference specs with `@specs/<id>/spec.md` before writing code.
- **Update specs when requirements change.** The spec is the source of truth, not the code.
- **Tests follow TDD** in Phase 1; integration and contract tests are required in Phase 2.
- **Per-user data isolation is mandatory** in Phase 2 — never trust client-supplied user IDs.
- **Commits and PRs** should reference the spec ID they implement (e.g. `feat(004): add task list virtualization`).

See [`CLAUDE.md`](./CLAUDE.md), [`phase-2-task-management-system/frontend/CLAUDE.md`](./phase-2-task-management-system/frontend/CLAUDE.md), and [`phase-2-task-management-system/backend/CLAUDE.md`](./phase-2-task-management-system/backend/CLAUDE.md) for AI-assistant and stack-specific guidelines.

---

## Contributing

1. Pick or create a spec under `/specs`.
2. Branch from `main` using the spec ID, e.g. `004-frontend-nextjs-spec`.
3. Implement against the spec; update the spec if requirements shift.
4. Run lint and tests for any phase you touch:
   - Phase 1: `pytest`
   - Phase 2 backend: `pytest`
   - Phase 2 frontend: `npm run lint`
5. Open a pull request that links the spec and describes the change.

---

## License

This project is part of the **Hackathon II** Todo App and is provided for educational purposes.
