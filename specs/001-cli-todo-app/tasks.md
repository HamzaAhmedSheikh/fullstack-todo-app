---

description: "Task list for CLI Todo Application implementation"
---

# Tasks: CLI Todo Application

**Input**: Design documents from `/specs/001-cli-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Following TDD as required by constitution - tests are REQUIRED for this feature

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow plan.md structure for CLI application

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (src/, tests/, src/models/, src/services/, src/cli/, src/lib/)
- [X] T002 Initialize Python project with requirements.txt (questionary, rich, pytest)
- [X] T003 [P] Create __init__.py files in src/, src/models/, src/services/, src/cli/, src/lib/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement input validators in src/lib/validators.py (title_validator, description_validator)
- [X] T005 [P] Create base Task model in src/models/task.py with validation rules
- [X] T006 Create TaskList model in src/models/task.py with in-memory storage and operations

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View All Tasks (Priority: P1) 🎯 MVP

**Goal**: Display all tasks in a clean, formatted Rich table with rounded borders and appropriate colors

**Independent Test**: Calling "View tasks" displays a Rich table with IDs, titles, status, and description in a clean, formatted table with rounded borders and appropriate colors.

### Tests for User Story 1 (TDD Required)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Unit test for Task model creation in tests/unit/models/test_task.py
- [X] T008 [P] [US1] Unit test for TaskList get_all_tasks() in tests/unit/models/test_task.py
- [X] T009 [P] [US1] Contract test for TaskService.get_all_tasks() in tests/contract/test_api_contract.py
- [X] T010 [US1] Integration test for "View tasks" menu flow in tests/integration/test_cli_flow.py

### Implementation for User Story 1

- [X] T011 [US1] Implement TaskService.get_all_tasks() method in src/services/task_service.py
- [X] T012 [US1] Implement view_tasks() function with Rich table formatting in src/cli/main.py
- [X] T013 [US1] Add "View all tasks" menu option and handle empty task list case in src/cli/main.py
- [X] T014 [US1] Add color formatting (green for completed, yellow for pending) in src/cli/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Add New Task (Priority: P2)

**Goal**: Enable users to add new tasks with title and optional description using questionary prompts

**Independent Test**: Selecting "Add new task", entering a title/description, then verifying the task appears in the list.

### Tests for User Story 2 (TDD Required)

- [X] T015 [P] [US2] Unit test for Task creation with validation in tests/unit/models/test_task.py
- [X] T016 [P] [US2] Unit test for TaskList.add_task() in tests/unit/models/test_task.py
- [X] T017 [P] [US2] Contract test for TaskService.create_task() in tests/contract/test_api_contract.py
- [X] T018 [P] [US2] Unit test for input validators in tests/unit/lib/test_validators.py
- [X] T019 [US2] Integration test for "Add new task" flow in tests/integration/test_cli_flow.py

### Implementation for User Story 2

- [X] T020 [US2] Implement TaskService.create_task() with validation in src/services/task_service.py
- [X] T021 [US2] Implement add_task() function with questionary prompts in src/cli/main.py
- [X] T022 [US2] Add validation for title (required, max 200 chars, ASCII only) in src/cli/main.py
- [X] T023 [US2] Add validation for description (max 500 chars) in src/cli/main.py
- [X] T024 [US2] Add "Add new task" menu option with success confirmation in src/cli/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Complete/Incomplete (Priority: P2)

**Goal**: Allow users to toggle task completion status with immediate visual feedback

**Independent Test**: Selecting a task and toggling its completion status updates the task state and reflects in the task list.

### Tests for User Story 3 (TDD Required)

- [X] T025 [P] [US3] Unit test for Task status toggle in tests/unit/models/test_task.py
- [X] T026 [P] [US3] Unit test for TaskList.toggle_task_status() in tests/unit/models/test_task.py
- [X] T027 [P] [US3] Contract test for TaskService.toggle_task_status() in tests/contract/test_api_contract.py
- [X] T028 [US3] Integration test for toggle completion flow in tests/integration/test_cli_flow.py

### Implementation for User Story 3

- [X] T029 [US3] Implement TaskService.toggle_task_status() in src/services/task_service.py
- [X] T030 [US3] Implement toggle_completion() function with task selection in src/cli/main.py
- [X] T031 [US3] Add "Toggle completion" menu option with immediate feedback in src/cli/main.py
- [X] T032 [US3] Handle edge case for non-existent task with clear error message in src/cli/main.py

**Checkpoint**: All core task management features (view, add, toggle) should now be independently functional

---

## Phase 6: User Story 4 - Update Task (Priority: P3)

**Goal**: Enable users to modify existing task titles and descriptions

**Independent Test**: Selecting "Update task", choosing a task, and modifying its title or description updates the task in the system.

### Tests for User Story 4 (TDD Required)

- [X] T033 [P] [US4] Unit test for TaskList.update_task() in tests/unit/models/test_task.py
- [X] T034 [P] [US4] Contract test for TaskService.update_task() in tests/contract/test_api_contract.py
- [X] T035 [US4] Integration test for update task flow in tests/integration/test_cli_flow.py

### Implementation for User Story 4

- [X] T036 [US4] Implement TaskService.update_task() with validation in src/services/task_service.py
- [X] T037 [US4] Implement update_task() function with questionary select interface in src/cli/main.py
- [X] T038 [US4] Add validation to prevent empty title updates in src/cli/main.py
- [X] T039 [US4] Add "Update task" menu option with error handling in src/cli/main.py

**Checkpoint**: All CRUD operations except delete should now be fully functional

---

## Phase 7: User Story 5 - Delete Task (Priority: P3)

**Goal**: Allow users to remove tasks with explicit confirmation

**Independent Test**: Selecting "Delete task", confirming the action, removes the task from the system.

### Tests for User Story 5 (TDD Required)

- [X] T040 [P] [US5] Unit test for TaskList.delete_task() in tests/unit/models/test_task.py
- [X] T041 [P] [US5] Contract test for TaskService.delete_task() in tests/contract/test_api_contract.py
- [X] T042 [US5] Integration test for delete task flow with confirmation in tests/integration/test_cli_flow.py

### Implementation for User Story 5

- [X] T043 [US5] Implement TaskService.delete_task() in src/services/task_service.py
- [X] T044 [US5] Implement delete_task() function with confirmation prompt in src/cli/main.py
- [X] T045 [US5] Add "Delete task" menu option with success/error handling in src/cli/main.py
- [X] T046 [US5] Handle edge case for non-existent task deletion in src/cli/main.py

**Checkpoint**: All user stories should now be independently functional - full CRUD operations complete

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T047 [P] Implement main menu loop with "Exit" option in src/cli/main.py
- [X] T048 [P] Add graceful error handling for invalid menu selections in src/cli/main.py
- [X] T049 [P] Add "Back to menu" navigation options in all operations in src/cli/main.py
- [X] T050 [P] Add TaskService.get_task_by_id() implementation in src/services/task_service.py
- [X] T051 [P] Unit tests for TaskService.get_task_by_id() in tests/unit/services/test_task_service.py
- [X] T052 Verify all edge cases from spec.md are handled with clear error messages
- [X] T053 Run full test suite and verify 100% pass rate
- [X] T054 Validate against quickstart.md scenarios
- [X] T055 Final code cleanup and PEP 8 compliance check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent but enhances US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent but requires US1 for display
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent but requires US1 for display
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent but requires US1 for display

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD requirement)
- Unit tests and contract tests can run in parallel (marked [P])
- Integration tests depend on implementation being complete
- Models before services
- Services before CLI interface
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003)
- All Foundational tasks marked [P] can run in parallel (T004, T005)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All unit tests and contract tests within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
Task: "Unit test for Task model creation in tests/unit/models/test_task.py"
Task: "Unit test for TaskList get_all_tasks() in tests/unit/models/test_task.py"
Task: "Contract test for TaskService.get_all_tasks() in tests/contract/test_api_contract.py"

# After tests fail, implement in sequence:
Task: "Implement TaskService.get_all_tasks() method in src/services/task_service.py"
Task: "Implement view_tasks() function with Rich table formatting in src/cli/main.py"
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together (TDD - write first):
Task: "Unit test for Task creation with validation in tests/unit/models/test_task.py"
Task: "Unit test for TaskList.add_task() in tests/unit/models/test_task.py"
Task: "Contract test for TaskService.create_task() in tests/contract/test_api_contract.py"
Task: "Unit test for input validators in tests/unit/lib/test_validators.py"

# After tests fail, implement in sequence:
Task: "Implement TaskService.create_task() with validation in src/services/task_service.py"
Task: "Implement add_task() function with questionary prompts in src/cli/main.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo basic "view tasks" functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP - view tasks!)
3. Add User Story 2 → Test independently → Demo (can now add and view!)
4. Add User Story 3 → Test independently → Demo (can toggle completion!)
5. Add User Story 4 → Test independently → Demo (can update tasks!)
6. Add User Story 5 → Test independently → Demo (full CRUD complete!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (View)
   - Developer B: User Story 2 (Add)
   - Developer C: User Story 3 (Toggle)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD is REQUIRED - verify tests fail before implementing
- Follow Red-Green-Refactor cycle per constitution
- All code must have type hints and docstrings (PEP 8)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
