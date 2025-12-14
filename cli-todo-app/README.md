# CLI Todo Application

A beautiful, interactive command-line todo application built with Python 3.13+, featuring Questionary-powered prompts and Rich-formatted output.

## Features

- ✨ Interactive CLI with questionary prompts
- 🎨 Beautiful Rich table formatting with rounded borders
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔄 Toggle task completion status
- ✓ Input validation (title max 200 chars, description max 500 chars)
- 📝 In-memory task storage
- 🧪 100% test coverage with TDD approach

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the application:

```bash
python src/cli/main.py
```

### Menu Options

- **View all tasks**: Display all tasks in a formatted table
- **Add new task**: Create a new task with title and optional description
- **Toggle completion**: Mark tasks as completed or pending
- **Update task**: Modify existing task title or description
- **Delete task**: Remove a task (with confirmation)
- **Exit**: Quit the application

## Running Tests

Run all tests:

```bash
pytest
```

Run specific test suites:

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# Contract tests
pytest tests/contract/
```

## Project Structure

```
cli-todo-app/
├── src/
│   ├── models/          # Task and TaskList data models
│   ├── services/        # Business logic (TaskService)
│   ├── cli/             # CLI interface (main.py)
│   └── lib/             # Utilities (validators)
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── contract/        # Contract tests
└── requirements.txt     # Project dependencies
```

## Development

This project follows:
- **TDD (Test-Driven Development)**: All features have tests written first
- **PEP 8**: Python code style guidelines
- **Type Hints**: Full type annotation coverage
- **Evolutionary Architecture**: Clean separation for future web app development

## Specifications

For detailed specifications, see:
- Feature Spec: `/specs/001-cli-todo-app/spec.md`
- Implementation Plan: `/specs/001-cli-todo-app/plan.md`
- Tasks: `/specs/001-cli-todo-app/tasks.md`

## License

MIT
