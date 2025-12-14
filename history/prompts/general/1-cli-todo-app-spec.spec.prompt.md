---
id: 1
title: cli-todo-app-spec
stage: spec
date_iso: 2025-12-12
surface: agent
model: Claude Sonnet 4.5
feature: cli-todo-app
branch: 001-cli-todo-app
user: hamza_ahmed
command: /sp.specify
labels: ["specification", "cli", "todo-app", "python"]
spec: "null"
ticket: "null"
adr: "null"
pr: "null"
files_yaml: |
 - ../specs/001-cli-todo-app/spec.md
 - ../specs/001-cli-todo-app/checklists/requirements.md
tests_yaml: |
 - "null"
---

# CLI Todo Application Specification

## Prompt Text

Phase 1 — CLI Todo Application

# **Phase 1 Specification — In-Memory Console Todo Application**

## **1. Intent**

Build an interactive, polished CLI-based Todo application using Python 3.13+ with:

* Questionary-powered input prompts
* Rich-powered colored output and rounded-box tables
* Clean and testable in-memory business logic
* Specification-driven development and strict TDD
* Evolutionary architecture that prepares for Phase 2 (web app)

This specification defines **WHAT** must be built, not **how**.

---

## **2. Target User & Context**

* **User:** Anyone using a terminal who needs lightweight task management
* **Context:** Quick personal task creation and tracking
* **Platform:** Console-based application using Questionary + Rich

---

## **3. Success Evals (SMART)**

### **Functional Success**

* User can add, view, update, delete, and toggle task completion.
* Application MUST only use **questionary** for all inputs.
* Application MUST use **rich** for ALL output formatting:

  * Colored messages
  * Tables with **box=ROUNDED**
  * Clean column alignment
* All business logic MUST behave correctly across all operations.

### **Usability Success**

* Prompts clearly indicate expected input.
* Errors provide helpful guidance.
* Destructive actions require confirmation.
* Listing tasks uses clean Rich table formatting.
* Colors communicate state (success, error, info).

### **Quality Success**

* All code uses TDD (red → green → refactor).
* No `input()` used anywhere.
* Business logic tested independently from CLI.
* Code passes Constitution standards: clean code, docstrings, type hints, imports.

### **Traceability Success**

* PHR MUST be generated after Phase 1 completions.

---

## **4. Constraints**

* **Input:** MUST use `questionary` (no built-in `input()`).
* **Output:** MUST use `rich`, including:

  * Rounded box tables
  * Colors
  * Clean alignment
* **Storage:** In-memory only.
* **Testing:** MUST follow TDD using pytest.
* **Style:** PEP8, type hints, docstrings, <100 char lines.
* **Architecture:** Must isolate business logic from CLI.
* **Dependencies:** `questionary`, `rich` only.
* **Time:** Must be completed within Phase 1 timeline.

---

## **5. User Stories**

### **User Story 1 — Add New Task (Priority: P2)**

**As a user, I want to add new tasks with a title and optional description so that I can capture things I need to do.**

**Why this priority:**
Adding tasks is the main input mechanism. Users must create tasks before they can manage them. This provides the core value of a todo app.

**Independent Test:**
Selecting **"Add new task"**, entering a title/description, then verifying the task appears in the list.

**Acceptance Scenarios:**

1. **Given** I am at the main menu,
   **When** I select "Add new task" and enter a title **"Buy groceries"**,
   **Then** a task with an auto-generated ID is created and I see a success confirmation.

2. **Given** I am adding a task,
   **When** I enter title **"Meeting prep"** and description **"Prepare slides for Monday standup"**,
   **Then** both fields are saved and visible when listing tasks.

3. **Given** I am adding a task,
   **When** I leave the description empty and press Enter,
   **Then** the task is created with only a title.

4. **Given** I am adding a task,
   **When** I submit an empty title,
   **Then** I see an error message: **"Title is required"** and must retry.

5. **Given** I am adding a task,
   **When** I enter a title longer than 200 characters,
   **Then** I see an error message: **"Title must be 200 characters or less"**.

---

### **User Story 2 — View All Tasks (Priority: P1)**

**As a user, I want to see all my tasks in a clean, readable table so that I can quickly understand my workload.**

**Why this priority:**
Viewing tasks is required for all other actions (update, delete, mark complete).

**Independent Test:**
Calling "View tasks" displays a Rich table with IDs, titles, status.

**Acceptance Scenarios:**

1. Table MUST use `rich.table` with **box=ROUNDED**.
2. Columns MUST be aligned: ID | Title | Description | Status.
3. Status MUST use colors (e.g., green = complete, yellow = pending).
4. If no tasks exist, show a friendly message instead of an empty table.

---

### **User Story 3 — Update Task (Priority: P3)**

**As a user, I want to update a task's title or description so that I can keep my tasks accurate.**

**Acceptance Scenarios:**

* Selecting Update shows a list of tasks using questionary's `select`.
* Empty title not allowed.
* Pressing Enter with no description keeps the old one.

---

### **User Story 4 — Delete Task (Priority: P3)**

**As a user, I want to delete tasks so that I can remove items I no longer need.**

**Acceptance Scenarios:**

* Delete MUST show a confirmation questionary prompt:
  "Are you sure? This cannot be undone."
* Deleting a non-existent task MUST show a clean error message.

---

### **User Story 5 — Mark Complete/Incomplete (Priority: P2)**

**As a user, I want to toggle completion status so that I can track progress.**

**Acceptance Scenarios:**

* Selecting a task and toggling must immediately update the table.
* Completed tasks MUST show green "✓ Completed".
* Incomplete tasks MUST show yellow "● Pending".

---

## **6. Edge Cases**

The system must gracefully handle:

* Invalid menu selection
* Non-numeric IDs (though questionary prevents it)
* Empty title submission
* Over-long title input
* Trying to update/delete when no tasks exist
* Trying to toggle completion of a non-existent task

---

## **7. Non-Goals**

This phase does NOT include:

* Persistent storage
* Multi-user support
* Web API or frontend
* AI chatbot
* Advanced task features like dates, tags, priority, reminders
* Sorting, filtering, search

---

## **8. Acceptance Criteria Checklist**

### **Functional**

* [ ] Add task
* [ ] View tasks with Rich table + rounded box
* [ ] Update task
* [ ] Delete task (with confirmation)
* [ ] Mark complete/incomplete

### **Quality**

* [ ] All input via questionary
* [ ] All output via rich (colors, tables)
* [ ] TDD followed (pytest)
* [ ] Clean code: PEP8, type hints, docstrings
* [ ] Business logic fully tested

### **Documentation**

* [ ] README
* [ ] ADR (if needed)
* [ ] PHR created

---

## **9. Definition of Done (DoD)**

The phase is complete when:

* All Success Evals pass
* All acceptance criteria satisfied
* Tests pass 100%
* No use of `input()` anywhere
* All output uses Rich
* All input uses Questionary
* PR passes reviewer approval

---

## Response Text

Created a comprehensive specification for the CLI Todo Application based on the provided feature description. The specification includes:

1. User Scenarios & Testing with 5 prioritized user stories covering:
   - View All Tasks (P1)
   - Add New Task (P2)
   - Mark Complete/Incomplete (P2)
   - Update Task (P3)
   - Delete Task (P3)

2. Functional Requirements (13 specific requirements)
3. Key Entities (Task and TaskList)
4. Success Criteria (7 measurable outcomes)

The specification follows the template structure and captures all the requirements from the original feature description, including:
- Using questionary for all input
- Using rich for all output formatting with rounded box tables
- In-memory storage only
- Task management operations (add, view, update, delete, toggle completion)
- Input validation and error handling
- Edge cases handling

A quality checklist was also created to validate the specification completeness.

## Outcome

The CLI Todo Application specification is complete and ready for the next phase of planning and implementation.