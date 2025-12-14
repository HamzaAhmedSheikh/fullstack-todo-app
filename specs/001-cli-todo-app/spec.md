# Feature Specification: CLI Todo Application

**Feature Branch**: `001-cli-todo-app`
**Created**: 2025-12-12
**Status**: Draft
**Input**: User description: "Phase 1 — CLI Todo Application - Build an interactive, polished CLI-based Todo application using Python 3.13+ with Questionary-powered input prompts, Rich-powered colored output and rounded-box tables, clean and testable in-memory business logic, specification-driven development and strict TDD, evolutionary architecture that prepares for Phase 2 (web app)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View All Tasks (Priority: P1)

As a user, I want to see all my tasks in a clean, readable table so that I can quickly understand my workload. This is the foundation that allows users to interact with their tasks.

**Why this priority**: Viewing tasks is required for all other actions (update, delete, mark complete) and provides immediate value to understand the current state of their todo list.

**Independent Test**: Calling "View tasks" displays a Rich table with IDs, titles, status, and description in a clean, formatted table with rounded borders and appropriate colors.

**Acceptance Scenarios**:

1. **Given** I have multiple tasks in the system, **When** I select "View tasks", **Then** I see a table with rounded box styling showing ID, Title, Description, and Status columns with proper alignment.
2. **Given** I have tasks with different completion statuses, **When** I view the tasks, **Then** completed tasks show in green with "✓ Completed" and pending tasks show in yellow with "● Pending".
3. **Given** I have no tasks in the system, **When** I select "View tasks", **Then** I see a friendly message instead of an empty table.

---

### User Story 2 — Add New Task (Priority: P2)

As a user, I want to add new tasks with a title and optional description so that I can capture things I need to do. This enables the core functionality of the todo application.

**Why this priority**: Adding tasks is the main input mechanism. Users must create tasks before they can manage them. This provides the core value of a todo app.

**Independent Test**: Selecting "Add new task", entering a title/description, then verifying the task appears in the list.

**Acceptance Scenarios**:

1. **Given** I am at the main menu, **When** I select "Add new task" and enter a title "Buy groceries", **Then** a task with an auto-generated ID is created and I see a success confirmation.
2. **Given** I am adding a task, **When** I enter title "Meeting prep" and description "Prepare slides for Monday standup", **Then** both fields are saved and visible when listing tasks.
3. **Given** I am adding a task, **When** I leave the description empty and press Enter, **Then** the task is created with only a title.
4. **Given** I am adding a task, **When** I submit an empty title, **Then** I see an error message: "Title is required" and must retry.
5. **Given** I am adding a task, **When** I enter a title longer than 200 characters, **Then** I see an error message: "Title must be 200 characters or less".

---

### User Story 3 — Mark Complete/Incomplete (Priority: P2)

As a user, I want to toggle completion status so that I can track progress. This allows users to mark tasks as done and update their status.

**Why this priority**: Toggling completion status is essential for task management and provides immediate feedback on progress.

**Independent Test**: Selecting a task and toggling its completion status updates the task state and reflects in the task list.

**Acceptance Scenarios**:

1. **Given** I have a pending task, **When** I select the task and toggle completion, **Then** the task status changes to completed with green "✓ Completed" indicator.
2. **Given** I have a completed task, **When** I select the task and toggling completion, **Then** the task status changes to pending with yellow "● Pending" indicator.
3. **Given** I am toggling task completion, **When** I select a task, **Then** the change is immediately reflected in the task list.

---

### User Story 4 — Update Task (Priority: P3)

As a user, I want to update a task's title or description so that I can keep my tasks accurate. This allows users to modify existing tasks.

**Why this priority**: Users need to be able to correct or update their task information as circumstances change.

**Independent Test**: Selecting "Update task", choosing a task, and modifying its title or description updates the task in the system.

**Acceptance Scenarios**:

1. **Given** I have existing tasks, **When** I select "Update task", **Then** I see a list of tasks using questionary's select interface.
2. **Given** I am updating a task, **When** I try to enter an empty title, **Then** I see an error message: "Title is required" and must retry.
3. **Given** I am updating a task description, **When** I press Enter with no description, **Then** the old description is preserved.

---

### User Story 5 — Delete Task (Priority: P3)

As a user, I want to delete tasks so that I can remove items I no longer need. This allows users to clean up their task list.

**Why this priority**: Users need to be able to remove tasks that are no longer relevant or needed.

**Independent Test**: Selecting "Delete task", confirming the action, removes the task from the system.

**Acceptance Scenarios**:

1. **Given** I have tasks in the system, **When** I select "Delete task", **Then** I see a confirmation prompt: "Are you sure? This cannot be undone."
2. **Given** I am deleting a task, **When** I confirm deletion, **Then** the task is removed from the system and no longer appears in the task list.
3. **Given** I try to delete a non-existent task, **When** I attempt the deletion, **Then** I see a clean error message.

---

### Edge Cases

- What happens when a user enters invalid menu selection?
- How does system handle non-numeric IDs (though questionary prevents it)?
- What happens when a user submits an empty title during task creation or update?
- How does the system handle title input longer than 200 characters?
- What happens when a user tries to update/delete when no tasks exist?
- How does the system handle attempting to toggle completion of a non-existent task?
- What happens when the system encounters unexpected input during questionary prompts?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use questionary for all user input interactions
- **FR-002**: System MUST use rich for all output formatting including colored messages, tables with box=ROUNDED, and clean column alignment
- **FR-003**: System MUST support adding tasks with a title and optional description
- **FR-004**: System MUST validate that task titles are required and no more than 200 characters (basic ASCII with common punctuation only)
- **FR-005**: System MUST display all tasks in a formatted table with ID, Title, Description, and Status columns
- **FR-006**: System MUST allow users to update existing tasks' title and description
- **FR-007**: System MUST allow users to delete tasks with confirmation prompt
- **FR-008**: System MUST allow users to toggle task completion status between completed and pending
- **FR-009**: System MUST display completed tasks with green "✓ Completed" status and pending tasks with yellow "● Pending" status
- **FR-010**: System MUST use in-memory storage only (no persistent storage)
- **FR-011**: System MUST handle invalid menu selections gracefully with helpful error messages
- **FR-012**: System MUST prevent empty title submission during task creation and updates
- **FR-013**: System MUST provide clear prompts that indicate expected input
- **FR-014**: System MUST provide "Back" or "Cancel" options during all operations
- **FR-015**: System MUST limit task descriptions to 500 characters maximum

### Key Entities

- **Task**: Represents a single todo item with attributes: ID (auto-generated numeric sequential starting from 1), Title (required string, max 200 chars, basic ASCII with common punctuation), Description (optional string, max 500 chars), Status (boolean - completed/incomplete, default pending)
- **TaskList**: Collection of Task entities managed in-memory

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add, view, update, delete, and toggle task completion successfully without system errors
- **SC-002**: All user interface elements use questionary for input and rich for output formatting (rounded box tables, colors, alignment)
- **SC-003**: Users can complete basic task management operations in under 30 seconds each
- **SC-004**: All destructive actions (delete) require explicit user confirmation before proceeding
- **SC-005**: Error messages provide clear, actionable guidance to users when invalid input is detected
- **SC-006**: System handles all edge cases gracefully without crashing or showing technical error messages to users
- **SC-007**: All business logic is testable independently from the CLI interface using TDD approach

## Clarifications

### Session 2025-12-12

- Q: What format should the auto-generated task IDs take? → A: Numeric sequential IDs starting from 1
- Q: Should newly created tasks default to completed or pending status? → A: Pending/incomplete
- Q: Should the system support special characters, emojis, or only basic ASCII characters in task titles? → A: Basic ASCII with common punctuation
- Q: Should task descriptions have a length limit, and if so, what should it be? → A: 500 characters maximum
- Q: Should the system provide consistent navigation options like "Back to menu" or "Cancel" during operations? → A: Yes, provide "Back" or "Cancel" options in all operations
