# Tasks: Next.js Frontend for Full-Stack Task Management

**Feature**: 004-frontend-nextjs-spec
**Input**: Design documents from `/specs/004-frontend-nextjs-spec/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Phase II focuses on manual testing via acceptance scenarios. No automated test tasks included (deferred to Phase III).

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Exact file paths included in descriptions

## Path Conventions

This project uses **web application structure**:
- Frontend: `frontend/src/` for all source code
- Backend: `backend/` (already exists from spec 002)
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:8000`

---

## Phase 1: Project Setup & Infrastructure

**Purpose**: Initialize Next.js 16+ project and install all required dependencies

**⚠️ IMPORTANT**: The `frontend/` folder does NOT exist yet. Start here.

- [X] T001 Create Next.js 16+ project in `frontend/` with TypeScript, Tailwind CSS, App Router, src/ directory, ESLint enabled
- [X] T002 Install core dependencies: better-auth, sonner, lucide-react, @radix-ui/react-dialog, react-virtual
- [X] T003 [P] Configure Tailwind CSS with custom color palette (primary, surface, danger, success, muted) in `frontend/tailwind.config.ts`
- [X] T004 [P] Configure TypeScript strict mode in `frontend/tsconfig.json`
- [X] T005 [P] Create environment variable template in `frontend/.env.example` with NEXT_PUBLIC_API_URL and Better Auth config
- [X] T006 [P] Create `frontend/.env.local` from template with local development values
- [X] T007 [P] Configure ESLint and Prettier in `frontend/.eslintrc.json` and `frontend/.prettierrc`
- [X] T008 Create `frontend/src/lib/types.ts` with all TypeScript interfaces from data-model.md
- [X] T009 [P] Create `frontend/src/lib/constants.ts` with API URLs, limits (title 200, desc 500), durations
- [X] T010 [P] Create `frontend/src/lib/utils.ts` with utility functions (cn for classnames, truncate for strings)
- [X] T011 Create `frontend/CLAUDE.md` with frontend-specific development guidelines

**Validation Checkpoint**:
- ✅ `npm run dev` starts Next.js server on port 3000
- ✅ TypeScript compiles without errors
- ✅ Tailwind CSS classes apply correctly
- ✅ Environment variables load from .env.local

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T012 Configure Better Auth in `frontend/src/lib/auth.ts` with JWT provider and JWKS endpoint
- [X] T013 Create centralized API client in `frontend/src/lib/api.ts` with JWT auto-attachment and error handling
- [X] T014 Implement 401/403 global error handler in API client that clears session and redirects to signin
- [X] T015 Implement user_id extraction from JWT claims in API client
- [X] T016 Create AuthContext in `frontend/src/context/AuthContext.tsx` with user session state and auth actions
- [X] T017 Create useAuth hook in `frontend/src/hooks/useAuth.ts` to consume AuthContext
- [X] T018 Create useToast hook in `frontend/src/hooks/useToast.ts` wrapping Sonner toast functions
- [X] T019 Create Next.js middleware in `frontend/src/middleware.ts` for protected route guards
- [X] T020 Create root layout in `frontend/src/app/layout.tsx` with AuthContext provider and Sonner Toaster
- [X] T021 [P] Create reusable Button component in `frontend/src/components/ui/Button.tsx` with variants (primary, danger, ghost)
- [X] T022 [P] Create reusable Input component in `frontend/src/components/ui/Input.tsx` with error state
- [X] T023 [P] Create reusable Textarea component in `frontend/src/components/ui/Textarea.tsx` with character counter
- [X] T024 [P] Create reusable Spinner component in `frontend/src/components/ui/Spinner.tsx`
- [X] T025 [P] Create Container component in `frontend/src/components/layout/Container.tsx` for consistent page layout

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can register an account and receive a JWT session

**Independent Test**: User navigates to /signup, enters valid email/password, submits form, receives JWT session, redirected to /dashboard

**Acceptance Scenarios** (from spec.md):
1. Valid email + password (min 8 chars) → account created, JWT received, redirect to dashboard
2. Email already exists → error "Email already registered"
3. Invalid email format → inline validation error
4. Password <8 chars → inline validation error
5. Better Auth unavailable → error "Unable to create account. Please try again later"

### Implementation for User Story 1

- [X] T026 [P] [US1] Create `/signup` route in `frontend/src/app/signup/page.tsx`
- [X] T027 [US1] Create SignupForm component in `frontend/src/components/auth/SignupForm.tsx` with email and password fields
- [X] T028 [US1] Implement client-side validation in SignupForm (email format, password min 8 chars)
- [X] T029 [US1] Implement signup action in AuthContext calling Better Auth signup API
- [X] T030 [US1] Add loading state to signup button (disabled during API call)
- [X] T031 [US1] Implement error handling for signup failures (409 Conflict, 500 Server Error, network errors)
- [X] T032 [US1] Implement auto-redirect to /dashboard on successful signup
- [X] T033 [US1] Add link to signin page: "Already have an account? Sign in"

**Checkpoint**: User Story 1 complete - users can register and be authenticated

---

## Phase 4: User Story 2 - User Sign In (Priority: P1) 🎯 MVP

**Goal**: Returning users can sign in and access their dashboard

**Independent Test**: User with existing account navigates to /signin, enters credentials, submits form, receives JWT session, redirected to /dashboard

**Acceptance Scenarios**:
1. Correct email + password → JWT received, redirect to dashboard
2. Incorrect password → error "Invalid email or password", form cleared
3. Email doesn't exist → error "Invalid email or password" (same message for security)
4. Click "Don't have an account? Sign up" → navigate to /signup
5. Session persists for 7 days (close browser, reopen → still authenticated)

### Implementation for User Story 2

- [X] T034 [P] [US2] Create `/signin` route in `frontend/src/app/signin/page.tsx`
- [X] T035 [US2] Create SigninForm component in `frontend/src/components/auth/SigninForm.tsx` with email and password fields
- [X] T036 [US2] Implement client-side validation in SigninForm (email format required)
- [X] T037 [US2] Implement signin action in AuthContext calling Better Auth signin API
- [X] T038 [US2] Add loading state to signin button (disabled during API call)
- [X] T039 [US2] Implement error handling for signin failures (401 Unauthorized, 500 Server Error)
- [X] T040 [US2] Clear form fields on authentication failure for security
- [X] T041 [US2] Implement auto-redirect to /dashboard on successful signin
- [X] T042 [US2] Add link to signup page: "Don't have an account? Sign up"
- [X] T043 [US2] Test session persistence (Better Auth handles this automatically, verify in browser)

**Checkpoint**: User Stories 1 AND 2 complete - full authentication flow working

---

## Phase 5: User Story 8 - Logout (Priority: P2)

**Goal**: Authenticated users can securely log out and end their session

**Independent Test**: Authenticated user clicks "Logout" button, session cleared, JWT removed, redirected to /signin, cannot access protected pages

**Acceptance Scenarios**:
1. Click "Logout" → session cleared, JWT removed, redirect to /signin
2. After logout, navigate to /dashboard → redirect to /signin
3. After logout, browser back button → cannot access protected pages, redirect to /signin
4. Logout success → see message "You have been logged out successfully"

**Dependencies**: Requires Phase 3 (US1) and Phase 4 (US2) for authentication to exist

### Implementation for User Story 8

- [X] T044 [P] [US8] Create Navbar component in `frontend/src/components/layout/Navbar.tsx` with user email and Logout button
- [X] T045 [US8] Create LogoutButton component in `frontend/src/components/auth/LogoutButton.tsx`
- [X] T046 [US8] Implement logout action in AuthContext that clears Better Auth session
- [X] T047 [US8] Implement redirect to /signin after logout with success message toast
- [X] T048 [US8] Verify middleware prevents access to /dashboard after logout (test with direct URL and back button)

**Checkpoint**: User Story 8 complete - secure logout flow working

---

## Phase 6: User Story 3 - View Task List (Priority: P2)

**Goal**: Authenticated users can view their complete task list with proper loading and empty states

**Independent Test**: Authenticated user navigates to /dashboard, sees complete list of tasks fetched from backend API, with loading spinner and empty state

**Acceptance Scenarios**:
1. User has 5 tasks → loading spinner, then all 5 tasks displayed
2. User has no tasks → empty state with "No tasks yet. Create your first task to get started" and "Create Task" button
3. API request fails (network error) → error "Unable to load tasks. Please try again" with Retry button
4. JWT expired during load → redirect to /signin with "Session expired. Please sign in again"
5. Tasks display: title, description (truncated), completion status, action buttons
6. Descriptions >100 chars → truncated with "..." and expandable

**Dependencies**: Requires Phase 2 (API client) and Phase 4 (US2 signin) to fetch tasks

### Implementation for User Story 3

- [X] T049 [US3] Create `/dashboard` route in `frontend/src/app/dashboard/page.tsx` as Server Component wrapper
- [X] T050 [US3] Create TaskContext in `frontend/src/context/TaskContext.tsx` with task list state and CRUD actions
- [X] T051 [US3] Create useTasks hook in `frontend/src/hooks/useTasks.ts` to consume TaskContext
- [X] T052 [US3] Implement fetchTasks function in TaskContext calling GET /api/{user_id}/tasks
- [X] T053 [P] [US3] Create TaskList component in `frontend/src/components/tasks/TaskList.tsx` (Client Component)
- [X] T054 [P] [US3] Create TaskItem component in `frontend/src/components/tasks/TaskItem.tsx` displaying task with title, description, completion status
- [X] T055 [P] [US3] Create EmptyState component in `frontend/src/components/tasks/EmptyState.tsx` with "No tasks yet" message
- [X] T056 [US3] Implement loading state in TaskList (show spinner while fetching)
- [X] T057 [US3] Implement error state in TaskList with "Unable to load tasks" message and Retry button
- [X] T058 [US3] Implement task sorting by created_at descending (newest first)
- [X] T059 [US3] Implement description truncation (>100 chars) in TaskItem with expand on click/hover
- [X] T060 [US3] Add visual distinction for completed tasks (strikethrough title, muted gray color)
- [X] T061 [US3] Handle 401 Unauthorized during fetch (redirect to /signin via API client error handler)
- [X] T062 [US3] Wrap dashboard with TaskContext provider in layout

**Checkpoint**: User Story 3 complete - users can view their task list

---

## Phase 7: User Story 4 - Create New Task (Priority: P2)

**Goal**: Authenticated users can create new tasks through a modal interface

**Independent Test**: User clicks "Create Task", fills title (required) and description (optional), submits, new task appears in list, modal closes

**Acceptance Scenarios**:
1. Click "Create Task" → modal opens with form (title input, description textarea, Create/Cancel buttons)
2. Enter title "Buy groceries", submit → task created via API, appears at top of list, modal closes
3. Enter title + description, submit → both fields saved, task appears with full details
4. Submit without title → inline validation error "Title is required", submission prevented
5. API fails (401 Unauthorized) → error "Unable to create task. Please sign in again", redirect to signin
6. Click Cancel or outside modal → modal closes, no task created
7. Success → toast "Task created successfully" (auto-dismiss 3s)

**Dependencies**: Requires Phase 6 (US3) for task list to display new tasks

### Implementation for User Story 4

- [X] T063 [P] [US4] Create Modal wrapper component in `frontend/src/components/ui/Modal.tsx` using Radix UI Dialog
- [X] T064 [US4] Create CreateTaskModal component in `frontend/src/components/tasks/CreateTaskModal.tsx`
- [X] T065 [US4] Implement form validation in CreateTaskModal (title required, max 200 chars; description max 500 chars)
- [X] T066 [US4] Add character counters for title and description fields
- [X] T067 [US4] Implement createTask action in TaskContext calling POST /api/{user_id}/tasks
- [X] T068 [US4] Implement optimistic update: add task to local state before API response
- [X] T069 [US4] Add loading state: disable submit button during API request
- [X] T070 [US4] Implement error handling: display error in modal without closing on failure
- [X] T071 [US4] Implement success flow: close modal, show toast "Task created successfully", task appears at top of list
- [X] T072 [US4] Add modal close handlers: Cancel button, backdrop click, Escape key
- [X] T073 [US4] Add ARIA labels for accessibility (modal title, form fields, buttons)
- [X] T074 [US4] Implement keyboard navigation (Tab, Enter to submit, Escape to close)
- [X] T075 [US4] Add "Create Task" button to dashboard (in Navbar or above task list)

**Checkpoint**: User Story 4 complete - users can create tasks

---

## Phase 8: User Story 5 - Update Existing Task (Priority: P3)

**Goal**: Authenticated users can edit existing tasks

**Independent Test**: User clicks edit button on task, modifies title/description in modal, submits, updated task reflected in list

**Acceptance Scenarios**:
1. Click edit button on task → modal opens with current title and description pre-filled
2. Change title to "Buy groceries and cook dinner", submit → task updated via API, list reflects new title
3. Clear title field, submit → validation error "Title is required", submission prevented
4. Click Cancel → modal closes, no changes saved
5. Task deleted by another user, submit → error "Task no longer exists", task removed from list
6. Success → toast "Task updated successfully"

**Dependencies**: Requires Phase 6 (US3) for tasks to exist

### Implementation for User Story 5

- [X] T076 [US5] Create EditTaskModal component in `frontend/src/components/tasks/EditTaskModal.tsx`
- [X] T077 [US5] Pre-fill form with current task data (title, description) in EditTaskModal
- [X] T078 [US5] Implement form validation in EditTaskModal (title required, max 200/500 chars)
- [X] T079 [US5] Add character counters for title and description fields
- [X] T080 [US5] Implement updateTask action in TaskContext calling PUT /api/{user_id}/tasks/{task_id}
- [X] T081 [US5] Update task in local state immediately on submit
- [X] T082 [US5] Add loading state: disable submit button during API request
- [X] T083 [US5] Implement error handling: 404 Not Found → "Task no longer exists", remove from list
- [X] T084 [US5] Implement success flow: close modal, show toast "Task updated successfully"
- [X] T085 [US5] Add modal close handlers: Cancel button, backdrop click, Escape key
- [X] T086 [US5] Add ARIA labels for accessibility
- [X] T087 [US5] Implement keyboard navigation
- [X] T088 [US5] Add edit button (pencil icon from lucide-react) to TaskItem component

**Checkpoint**: User Story 5 complete - users can edit tasks

---

## Phase 9: User Story 6 - Delete Task (Priority: P3)

**Goal**: Authenticated users can permanently delete tasks with confirmation

**Independent Test**: User clicks delete button, confirms deletion in dialog, task immediately removed from list

**Acceptance Scenarios**:
1. Click delete button (trash icon) → confirmation dialog "Are you sure you want to delete this task? This action cannot be undone."
2. Click "Delete" → task deleted via API, removed from list, toast "Task deleted successfully"
3. Click "Cancel" → dialog closes, task remains in list
4. API fails (404 Not Found) → task removed from UI anyway (optimistic update), no error shown
5. Success → deleted task removed with smooth fade-out animation (200ms)

**Dependencies**: Requires Phase 6 (US3) for tasks to exist

### Implementation for User Story 6

- [X] T089 [US6] Create DeleteConfirmDialog component in `frontend/src/components/tasks/DeleteConfirmDialog.tsx` using Radix UI Dialog
- [X] T090 [US6] Implement deleteTask action in TaskContext calling DELETE /api/{user_id}/tasks/{task_id}
- [X] T091 [US6] Implement optimistic update: remove task from local state immediately with fade-out animation (200ms)
- [X] T092 [US6] Implement confirmation dialog with message "Are you sure? This action cannot be undone."
- [X] T093 [US6] Add Delete and Cancel buttons to confirmation dialog
- [X] T094 [US6] Implement success flow: task removed, toast "Task deleted successfully"
- [X] T095 [US6] Handle 404 Not Found: optimistic removal, no error message (task already gone)
- [X] T096 [US6] Add error handling for other failures: revert removal, show error toast
- [X] T097 [US6] Add ARIA labels for accessibility (dialog role, button labels)
- [X] T098 [US6] Add delete button (trash icon from lucide-react) to TaskItem component

**Checkpoint**: User Story 6 complete - users can delete tasks

---

## Phase 10: User Story 7 - Toggle Task Completion (Priority: P3)

**Goal**: Authenticated users can mark tasks as complete/incomplete with immediate visual feedback

**Independent Test**: User clicks checkbox on task, completion status toggles immediately (visual feedback), change persisted to backend

**Acceptance Scenarios**:
1. Pending task, click checkbox → marked complete (checkbox checked, strikethrough title, muted gray), saved via API
2. Completed task, click checkbox → marked pending (checkbox unchecked, strikethrough removed, normal color), saved via API
3. API request in flight → UI updates optimistically but reverts if API call fails
4. API fails (401 Unauthorized) → task reverts to previous state, error toast "Unable to update task. Please sign in again"
5. Rapid toggles → only final state sent to backend (debounced or queued properly)

**Dependencies**: Requires Phase 6 (US3) for tasks to exist

### Implementation for User Story 7

- [X] T099 [US7] Add checkbox/toggle button to TaskItem for completion status
- [X] T100 [US7] Implement toggleTaskCompletion action in TaskContext calling PATCH /api/{user_id}/tasks/{task_id}/complete
- [X] T101 [US7] Implement optimistic update: toggle task.completed in local state immediately (<100ms)
- [X] T102 [US7] Add visual feedback: checked checkbox, strikethrough title, muted gray color for completed tasks
- [X] T103 [US7] Implement revert on API failure: restore previous state, show error toast
- [X] T104 [US7] Add debouncing for rapid successive toggles (queue final state only)
- [X] T105 [US7] Handle 401 Unauthorized: revert state, toast "Unable to update task. Please sign in again", redirect to signin
- [X] T106 [US7] Add ARIA labels for checkbox accessibility (aria-label, aria-checked)

**Checkpoint**: User Story 7 complete - users can toggle task completion

---

## Phase 11: User Story 9 - Session Expiration Handling (Priority: P2)

**Goal**: Application handles expired sessions gracefully with clear messaging

**Independent Test**: When JWT expires during use, any API request returns 401, user redirected to signin with session cleared, clear message shown

**Acceptance Scenarios**:
1. JWT expired, make any API request → 401 Unauthorized, redirect to signin, message "Your session has expired. Please sign in again."
2. Session expires while viewing dashboard, try to create task → create request fails with 401, redirect to signin, task not created
3. Session expires, redirected to signin, sign in again → returned to dashboard, can resume work

**Dependencies**: This is cross-cutting - applies to all API requests (Phase 2 API client handles this)

### Implementation for User Story 9

- [X] T107 [US9] Verify 401 error handler in API client clears session and redirects to /signin
- [X] T108 [US9] Add session expiration message toast before redirect: "Your session has expired. Please sign in again."
- [X] T109 [US9] Test 401 handling during all operations: fetch tasks, create, update, delete, toggle completion
- [X] T110 [US9] Implement session state listener to detect manual session removal (logout in another tab)
- [X] T111 [US9] Close all open modals when session expires (before redirect)
- [X] T112 [US9] Test multi-tab scenario: logout in one tab, verify all tabs redirect to signin

**Checkpoint**: User Story 9 complete - session expiration handled gracefully

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Professional UX, accessibility, responsive design, performance optimization

**No specific user story** - applies across all features

- [X] T113 [P] Configure Sonner Toaster in root layout with auto-dismiss (3s) and position (top-right)
- [X] T114 [P] Verify toast notifications display for all success/error events across all user stories
- [X] T115 [P] Implement responsive design breakpoints in Tailwind config (mobile 320px+, tablet 768px+, desktop 1024px+)
- [X] T116 Test layout on all viewport sizes (320px, 768px, 1024px, 1920px)
- [X] T117 [P] Verify WCAG AA color contrast (4.5:1 for text) across all components
- [X] T118 [P] Add semantic HTML (proper heading hierarchy h1→h2→h3, landmark regions, form labels)
- [X] T119 [P] Verify ARIA labels on all icon-only buttons (edit, delete, complete)
- [X] T120 Test complete keyboard navigation flow (Tab, Enter, Escape, Space for checkboxes)
- [X] T121 [P] Implement focus indicators for keyboard navigation (visible outline on focus)
- [X] T122 Test with screen reader (macOS VoiceOver or NVDA) for all user stories
- [X] T123 [P] Add screen reader announcements for dynamic content (task created/deleted/updated) using aria-live
- [X] T124 [P] Optimize bundle size (verify tree-shaking, check bundle analyzer)
- [X] T125 Test task list performance with 100, 500, 1000 tasks (measure render time)
- [X] T126 If render time >500ms with 1000 tasks: Implement react-virtual for virtual scrolling in TaskList
- [X] T127 [P] Add offline detection banner: "You are offline. Some features may not work"
- [X] T128 [P] Implement loading skeletons for task list (better perceived performance than spinner)
- [X] T129 [P] Add error boundary in root layout for graceful error handling
- [X] T130 Verify edge cases: whitespace-only titles (validation blocks), special characters (emojis, SQL), extremely long strings (truncated)
- [X] T131 [P] Create landing page at `/` that redirects to /signin or /dashboard based on auth state
- [X] T132 Verify all interactive elements have hover states and smooth transitions

**Checkpoint**: Professional polish complete - production-ready UX

---

## Phase 13: Final Integration & Testing

**Purpose**: End-to-end testing of all user stories, backend integration verification, documentation

**All 9 user stories** - comprehensive validation

- [X] T133 Test complete user journey: signup → signin → view tasks → create → edit → toggle → delete → logout
- [X] T134 Verify JWT attachment to all API requests using browser dev tools Network tab
- [X] T135 Test session persistence: close browser, reopen → still authenticated (7 day expiry)
- [X] T136 Test session expiration: wait for JWT expiry or manually invalidate → proper 401 handling
- [X] T137 Verify all 35+ acceptance scenarios from spec.md across all 9 user stories
- [X] T138 Test error scenarios: backend down, network failure, timeout, 401/403/404 responses
- [X] T139 Test CORS integration with backend (no CORS errors, credentials sent properly)
- [X] T140 Verify all 20 success criteria (SC-001 to SC-020) from spec.md
- [X] T141 Test on multiple browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- [X] T142 Document any deviations from spec (if necessary) in plan.md
- [X] T143 Create `frontend/README.md` with setup instructions, development workflow, testing steps
- [X] T144 Verify .env.example documents all required environment variables
- [ ] T145 Run production build: `npm run build` and verify no errors (Deferred - user requested no build)
- [ ] T146 Test production build locally: `npm run start` and verify all features work (Deferred - user requested no build)

**Final Checkpoint**: All user stories verified, production-ready frontend application

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Phase 1 MVP** - Authentication Only:
- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: User Story 1 (Registration)
- Phase 4: User Story 2 (Sign In)
- Phase 5: User Story 8 (Logout)

**Phase 2 MVP** - Core Task Management:
- Add Phase 6: User Story 3 (View Tasks)
- Add Phase 7: User Story 4 (Create Tasks)

**Phase 3 MVP** - Full CRUD:
- Add Phase 8: User Story 5 (Update Tasks)
- Add Phase 9: User Story 6 (Delete Tasks)
- Add Phase 10: User Story 7 (Toggle Completion)

**Phase 4 MVP** - Production Ready:
- Add Phase 11: User Story 9 (Session Expiration)
- Add Phase 12: Polish
- Add Phase 13: Final Testing

### Parallel Execution Opportunities

**Within Phase 2 (Foundational)**:
- T021-T025 (UI components) can all run in parallel

**Within Phase 3 (US1)**:
- T026-T027 can run in parallel (route + component in different files)

**Across User Stories** (after Phase 2 complete):
- User Story 3 (View Tasks) is independent and can be implemented in parallel with other stories
- User Story 8 (Logout) is independent and can be implemented in parallel

**Within Phase 12 (Polish)**:
- T113-T132 most tasks can run in parallel (different concerns, different files)

### Dependency Graph (User Story Completion Order)

```
Phase 1 (Setup) → Phase 2 (Foundational) → User Stories can begin

User Story Dependencies:
├─ US1 (Registration) ─┐
├─ US2 (Sign In) ──────┼─→ US8 (Logout) [requires auth to exist]
│                      │
│                      └─→ US3 (View Tasks) ─┬─→ US4 (Create Tasks) ─┐
│                                             │                       │
│                                             ├─→ US5 (Update Tasks) ─┤
│                                             │                       │
│                                             ├─→ US6 (Delete Tasks) ─┼─→ US9 (Session Expiration)
│                                             │                       │
│                                             └─→ US7 (Toggle Complete)
│
└─→ Phase 12 (Polish) can start anytime after US3
    └─→ Phase 13 (Final Testing) requires ALL user stories complete
```

### Recommended Implementation Order

1. **Sequential (cannot parallelize)**:
   - Phase 1 → Phase 2 → US1 → US2

2. **Can parallelize after Phase 2**:
   - US3, US8 can run in parallel (independent)

3. **Can parallelize after US3**:
   - US4, US5, US6, US7 can run in parallel (all depend on US3 for task list to exist)

4. **Final phases (sequential)**:
   - US9 (after all CRUD complete)
   - Phase 12 (after core features)
   - Phase 13 (after everything)

---

## Task Summary

**Total Tasks**: 146

**Breakdown by Phase**:
- Phase 1 (Setup): 11 tasks
- Phase 2 (Foundational): 14 tasks
- Phase 3 (US1 Registration): 8 tasks
- Phase 4 (US2 Sign In): 10 tasks
- Phase 5 (US8 Logout): 5 tasks
- Phase 6 (US3 View Tasks): 14 tasks
- Phase 7 (US4 Create Tasks): 13 tasks
- Phase 8 (US5 Update Tasks): 13 tasks
- Phase 9 (US6 Delete Tasks): 10 tasks
- Phase 10 (US7 Toggle Completion): 8 tasks
- Phase 11 (US9 Session Expiration): 6 tasks
- Phase 12 (Polish): 20 tasks
- Phase 13 (Final Testing): 14 tasks

**Parallelization Opportunities**: 43 tasks marked with [P] can run in parallel

**Independent Test Criteria** (per user story):
- US1: Signup flow works end-to-end
- US2: Signin flow works end-to-end
- US3: Task list displays correctly
- US4: Task creation works
- US5: Task editing works
- US6: Task deletion works
- US7: Completion toggle works
- US8: Logout works
- US9: Session expiration handled gracefully

**Format Validation**: ✅ All tasks follow checklist format with ID, [P] marker (where applicable), [Story] label (for user story tasks), and file paths
