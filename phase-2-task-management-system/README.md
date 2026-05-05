# Task Management System

A full-stack, multi-user task management application built with Next.js 16 and FastAPI. Authenticated users can create, organize, and track personal todos through a polished, responsive UI backed by a JWT-secured REST API.

This is **Phase 2** of the Hackathon II Todo App, developed using [GitHub Spec-Kit](https://github.com/github/spec-kit) for spec-driven development.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [API Overview](#api-overview)
- [Specifications](#specifications)
- [Contributing](#contributing)

---

## Architecture

```
┌──────────────────┐        ┌────────────────────┐        ┌──────────────────┐
│   Next.js 16     │        │   FastAPI          │        │   Neon Postgres  │
│   (Frontend)     │  JWT   │   (Backend API)    │  SQL   │                  │
│                  ├───────▶│                    ├───────▶│                  │
│  Better Auth     │        │  JWKS verification │        │  Drizzle / SQL   │
│  React 19        │        │  SQLModel ORM      │        │  Model schemas   │
└──────────────────┘        └────────────────────┘        └──────────────────┘
```

Authentication is issued by **Better Auth** in the Next.js layer and verified in FastAPI through a **JWKS** endpoint. All task data is scoped to the authenticated user at the query level.

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router) + **React 19**
- **TypeScript 5**
- **Tailwind CSS 4** + **Radix UI** + **Lucide React**
- **Better Auth 1.4** (JWT sessions)
- **Drizzle ORM** with **Neon Serverless Postgres**
- **Sonner** (toasts), **react-window** (virtualization)

### Backend
- **FastAPI** (Python 3.13+)
- **SQLModel** ORM on **PostgreSQL** (`asyncpg` / `psycopg`)
- **PyJWT** with `cryptography` for JWKS verification
- **Alembic** migrations
- **pytest** + `pytest-asyncio`

---

## Features

- Email + password authentication via Better Auth
- JWT-secured REST API with JWKS-based verification
- Per-user task CRUD with query-level data isolation
- Task status, priority, and due-date management
- Optimistic UI updates with toast feedback
- Virtualized list rendering for large task sets
- Dark mode UI
- Spec-driven development with traceable artifacts in `/specs`

---

## Project Structure

```
phase-2-task-management-system/
├── frontend/                  # Next.js 16 app
│   ├── src/
│   │   ├── app/               # App Router pages and API routes
│   │   ├── components/        # UI components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # API client, auth helpers
│   │   └── proxy.ts           # Backend proxy logic
│   ├── drizzle/               # Drizzle migrations
│   └── better-auth.config.ts  # Better Auth configuration
│
├── backend/                   # FastAPI service
│   ├── app/
│   │   ├── core/              # Config and settings
│   │   ├── database/          # DB session and engine
│   │   ├── middleware/        # Auth and request middleware
│   │   ├── routers/           # API endpoints
│   │   ├── dependencies.py    # JWT verification dependency
│   │   └── main.py            # FastAPI entrypoint
│   ├── alembic/               # Database migrations
│   └── tests/                 # pytest test suite
│
└── ../specs/                  # Spec-Kit specifications
```

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.13+ and **uv** (or `pip`)
- **PostgreSQL** database (Neon recommended)

---

## Getting Started

### 1. Clone and enter the project

```bash
git clone https://github.com/HamzaAhmedSheikh/fullstack-todo-app.git
cd fullstack-todo-app/phase-2-task-management-system
```

### 2. Backend setup

```bash
cd backend
uv sync                            # or: pip install -r requirements.txt
cp .env.example .env               # configure DATABASE_URL and JWKS_URL
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

In a separate shell:

```bash
cd frontend
npm install
cp .env.example .env.local         # configure DATABASE_URL, BETTER_AUTH_SECRET, BACKEND_URL
npm run db:push
npm run dev
```

The app will be available at **http://localhost:3000** and the API at **http://localhost:8000**.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `DATABASE_URL`          | Postgres connection string (Better Auth tables) |
| `BETTER_AUTH_SECRET`    | Secret for signing Better Auth tokens           |
| `BETTER_AUTH_URL`       | Public app URL (e.g. `http://localhost:3000`)   |
| `BACKEND_URL`           | FastAPI base URL (e.g. `http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable        | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`  | Postgres connection string for task data                           |
| `JWKS_URL`      | Better Auth JWKS endpoint (e.g. `http://localhost:3000/api/auth/jwks`) |
| `JWT_AUDIENCE`  | Expected JWT audience                                              |
| `JWT_ISSUER`    | Expected JWT issuer                                                |

---

## Development

### Common commands

```bash
# Frontend
npm run dev          # start Next.js dev server
npm run build        # production build
npm run lint         # run ESLint
npm run db:generate  # generate Drizzle migrations
npm run db:push      # push schema to database

# Backend
uvicorn app.main:app --reload    # dev server with hot reload
alembic revision --autogenerate  # create migration
alembic upgrade head             # apply migrations
```

### Spec-driven workflow

This project uses Spec-Kit slash commands (`/sp.specify`, `/sp.plan`, `/sp.tasks`, `/sp.implement`) to drive feature work. See `/specs` at the repository root for active feature specifications.

---

## Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run lint
```

---

## API Overview

All endpoints are mounted under `/api/` and require a valid Better Auth JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint           | Description                        |
| ------ | ------------------ | ---------------------------------- |
| GET    | `/api/tasks`       | List the current user's tasks      |
| POST   | `/api/tasks`       | Create a new task                  |
| GET    | `/api/tasks/{id}`  | Retrieve a single task             |
| PATCH  | `/api/tasks/{id}`  | Update a task                      |
| DELETE | `/api/tasks/{id}`  | Delete a task                      |
| GET    | `/health`          | Service health check               |

Interactive OpenAPI docs are served at `http://localhost:8000/docs`.

---

## Specifications

Feature, API, database, and UI specs live in the repository's top-level `/specs` directory:

- `specs/004-frontend-nextjs-spec/` — Next.js frontend spec
- `specs/005-backend-phase0-setup/` — FastAPI backend spec
- `specs/003-jwt-verification-api-skill/` — JWT verification design

Always read the relevant spec before implementing changes.

---

## Contributing

1. Read the relevant spec under `/specs`.
2. Create a feature branch from `main`.
3. Implement against the spec; update the spec if requirements change.
4. Run lint and tests on both frontend and backend.
5. Open a pull request describing the change and linking the spec.

---

## License

This project is part of the Hackathon II Todo App and is provided for educational purposes.
