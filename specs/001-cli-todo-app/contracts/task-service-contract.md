# Task Service API Contract

## Overview
This contract defines the interface for the TaskService that manages task operations in the CLI Todo Application.

## Service Interface: TaskService

### Methods

#### `create_task(title: str, description: str = None) -> dict`
- **Purpose**: Creates a new task with the given title and optional description
- **Input**:
  - title: Required string (1-200 chars, basic ASCII)
  - description: Optional string (max 500 chars)
- **Output**: Dictionary with task data including id, title, description, and status
- **Success**: Returns task dict with status 200
- **Failure**: Raises ValueError for invalid input

#### `get_all_tasks() -> list[dict]`
- **Purpose**: Retrieves all tasks in the system
- **Input**: None
- **Output**: List of task dictionaries
- **Success**: Returns list of all tasks
- **Failure**: Returns empty list if no tasks exist

#### `get_task_by_id(task_id: int) -> dict | None`
- **Purpose**: Retrieves a specific task by its ID
- **Input**: task_id (positive integer)
- **Output**: Task dictionary or None if not found
- **Success**: Returns task dict or None
- **Failure**: Returns None for invalid ID

#### `update_task(task_id: int, title: str = None, description: str = None) -> dict | None`
- **Purpose**: Updates an existing task's title and/or description
- **Input**:
  - task_id: Positive integer
  - title: Optional string (1-200 chars if provided)
  - description: Optional string (max 500 chars)
- **Output**: Updated task dictionary or None if not found
- **Success**: Returns updated task dict
- **Failure**: Returns None for invalid ID or invalid input

#### `delete_task(task_id: int) -> bool`
- **Purpose**: Deletes a task by its ID
- **Input**: task_id (positive integer)
- **Output**: Boolean indicating success
- **Success**: Returns True
- **Failure**: Returns False for invalid ID

#### `toggle_task_status(task_id: int) -> dict | None`
- **Purpose**: Toggles the completion status of a task
- **Input**: task_id (positive integer)
- **Output**: Updated task dictionary or None if not found
- **Success**: Returns updated task dict
- **Failure**: Returns None for invalid ID

## Validation Rules
- All input validation must occur at service boundary
- Service methods must handle invalid inputs gracefully
- Error responses must be consistent and informative
- Service must maintain data integrity across all operations