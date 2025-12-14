# Quickstart Guide: CLI Todo Application

## Prerequisites
- Python 3.13 or higher
- pip package manager

## Setup

1. **Install Dependencies**:
   ```bash
   pip install questionary rich pytest
   ```

2. **Project Structure**:
   ```
   cli-todo-app/
   ├── src/
   │   ├── models/
   │   │   └── task.py
   │   ├── services/
   │   │   └── task_service.py
   │   ├── cli/
   │   │   └── main.py
   │   └── lib/
   │       └── validators.py
   └── tests/
       ├── unit/
       ├── integration/
       └── contract/
   ```

## Running the Application

1. **Start the CLI**:
   ```bash
   python src/cli/main.py
   ```

2. **Main Menu Options**:
   - Add new task: Create a new todo item
   - View all tasks: Display all tasks in formatted table
   - Update task: Modify existing task title or description
   - Delete task: Remove a task (with confirmation)
   - Toggle completion: Change task status between pending/completed
   - Exit: Quit the application

## Running Tests

1. **Unit Tests**:
   ```bash
   pytest tests/unit/
   ```

2. **Integration Tests**:
   ```bash
   pytest tests/integration/
   ```

3. **All Tests**:
   ```bash
   pytest
   ```

## Key Features

- **Questionary Input**: All user input uses questionary prompts for consistent experience
- **Rich Output**: All display uses rich formatting with colored tables and messages
- **In-Memory Storage**: Tasks exist only during runtime (no persistence)
- **Input Validation**: All inputs validated for length and character constraints
- **Error Handling**: Graceful handling of invalid operations with clear messages

## Development Workflow

1. Follow TDD: Write tests before implementation
2. Red → Green → Refactor cycle
3. Ensure all business logic is separate from CLI interface
4. Maintain clean code standards (PEP 8, type hints, docstrings)