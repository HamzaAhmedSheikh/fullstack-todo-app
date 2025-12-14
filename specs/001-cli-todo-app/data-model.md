# Data Model: CLI Todo Application

## Task Entity

### Attributes
- **id**: `int` - Auto-generated sequential identifier starting from 1
- **title**: `str` - Required task title, max 200 characters, basic ASCII with common punctuation only
- **description**: `str` - Optional task description, max 500 characters
- **status**: `bool` - Task completion status, default `False` (pending)

### Validation Rules
- Title is required and must not be empty
- Title must be 200 characters or less
- Title must contain only basic ASCII characters with common punctuation
- Description must be 500 characters or less (if provided)
- ID must be unique within the TaskList

### State Transitions
- Default state: `status = False` (pending)
- Transition to completed: `status = True`
- Transition to pending: `status = False`

## TaskList Entity

### Attributes
- **tasks**: `list[Task]` - Collection of Task objects
- **next_id**: `int` - Counter for generating next available ID

### Operations
- **add_task(title: str, description: str = None) -> Task**: Creates and adds a new task to the collection
- **get_all_tasks() -> list[Task]**: Returns all tasks in the collection
- **get_task_by_id(task_id: int) -> Task | None**: Returns a specific task or None if not found
- **update_task(task_id: int, title: str = None, description: str = None) -> bool**: Updates task attributes, returns success status
- **delete_task(task_id: int) -> bool**: Removes task from collection, returns success status
- **toggle_task_status(task_id: int) -> bool**: Toggles completion status, returns success status

### Validation Rules
- Task IDs must be unique within the collection
- Operations must fail gracefully when referencing non-existent task IDs
- Maximum 1000 tasks allowed in memory (performance constraint)

### Relationships
- TaskList contains 0 to many Task entities
- Each Task belongs to exactly one TaskList