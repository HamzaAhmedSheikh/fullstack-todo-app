---
title: Task Management API
emoji: 📋
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Task Management API

A FastAPI-based task management backend with JWT authentication.

## Features

- RESTful API for task management (CRUD operations)
- JWT authentication via Better Auth
- PostgreSQL database (Neon Serverless)
- CORS support for frontend integration

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)
- `GET /api/tasks` - List all tasks (authenticated)
- `POST /api/tasks` - Create a task (authenticated)
- `GET /api/tasks/{id}` - Get a specific task (authenticated)
- `PUT /api/tasks/{id}` - Update a task (authenticated)
- `DELETE /api/tasks/{id}` - Delete a task (authenticated)

## Environment Variables

Configure these as secrets in your Hugging Face Space:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `BETTER_AUTH_URL` | Frontend URL for JWT verification |
| `BETTER_AUTH_SECRET` | Shared JWT secret (must match frontend) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

## Tech Stack

- FastAPI 0.125+
- SQLModel (ORM)
- PostgreSQL (Neon Serverless)
- PyJWT for authentication
- Uvicorn ASGI server
