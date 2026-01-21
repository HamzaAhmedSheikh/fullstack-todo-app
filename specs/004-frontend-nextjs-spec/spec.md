# Feature Specification: Next.js Frontend for Full-Stack Task Management

**Feature Branch**: `004-frontend-nextjs-spec`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Frontend for The Evolution of Todo – Phase II: Full-Stack Web Application with Next.js 16+, TypeScript, Tailwind CSS, Better Auth JWT integration, and production-grade UI comparable to Todoist, Notion, or Linear"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration (Priority: P1)

As a new user, I want to register an account through a clean, intuitive signup interface so that I can begin managing my tasks with a secure, personal account.

**Why this priority**: User registration is the first touchpoint for new users and the foundation for all authenticated features. Without this, users cannot access the application. This must work flawlessly to ensure user onboarding success.

**Independent Test**: A user can navigate to the signup page, enter valid credentials (email, password), submit the form, and receive a session with JWT token from Better Auth, then be automatically redirected to their dashboard.

**Acceptance Scenarios**:

1. **Given** I am on the signup page, **When** I enter a valid email and password (min 8 characters), **Then** my account is created, I receive a JWT session, and I am redirected to the dashboard.
2. **Given** I am on the signup page, **When** I enter an email that already exists, **Then** I see an error message "Email already registered" and remain on the signup page.
3. **Given** I am on the signup page, **When** I enter an invalid email format, **Then** I see inline validation error "Please enter a valid email" before submission.
4. **Given** I am on the signup page, **When** I enter a password shorter than 8 characters, **Then** I see inline validation error "Password must be at least 8 characters".
5. **Given** I am on the signup page, **When** the Better Auth service is unavailable, **Then** I see an error message "Unable to create account. Please try again later" and the form remains editable.

---

### User Story 2 - User Sign In (Priority: P1)

As a returning user, I want to sign in to my account so that I can access my existing tasks and continue managing my work.

**Why this priority**: Sign in is equally critical as registration for returning users. This is the primary entry point for existing users to access their data. Must work reliably to ensure user retention and satisfaction.

**Independent Test**: A user with an existing account can navigate to the signin page, enter their credentials, submit the form, receive a JWT session, and be redirected to their dashboard with their task list loaded.

**Acceptance Scenarios**:

1. **Given** I have an existing account, **When** I enter correct email and password on the signin page, **Then** I receive a JWT session and am redirected to the dashboard.
2. **Given** I am on the signin page, **When** I enter an incorrect password, **Then** I see an error message "Invalid email or password" and the form is cleared for security.
3. **Given** I am on the signin page, **When** I enter an email that doesn't exist, **Then** I see an error message "Invalid email or password" (same message for security - no user enumeration).
4. **Given** I am on the signin page, **When** I click "Don't have an account? Sign up", **Then** I am navigated to the signup page.
5. **Given** I successfully signed in, **When** I close the browser and return within 7 days, **Then** I am still authenticated and see my dashboard without re-signing in (session persistence).

---

### User Story 3 - View Task List (Priority: P2)

As an authenticated user, I want to view my complete task list in a clean, organized interface so that I can see all my tasks at a glance and understand what needs to be done.

**Why this priority**: Viewing tasks is the core value proposition after authentication. Users must immediately see their tasks to feel the application is working and useful. This is the MVP of task visualization.

**Independent Test**: An authenticated user can navigate to the dashboard and see their complete list of tasks fetched from the backend API, with proper loading and empty states displayed appropriately.

**Acceptance Scenarios**:

1. **Given** I am authenticated and have 5 tasks, **When** the dashboard loads, **Then** I see a loading spinner briefly, followed by all 5 tasks displayed in a list.
2. **Given** I am authenticated and have no tasks, **When** the dashboard loads, **Then** I see an empty state with message "No tasks yet. Create your first task to get started" and a prominent "Create Task" button.
3. **Given** I am authenticated, **When** the dashboard loads and the API request fails (network error), **Then** I see an error message "Unable to load tasks. Please try again" with a "Retry" button.
4. **Given** I am authenticated, **When** the dashboard loads and my JWT is expired, **Then** I am automatically redirected to the signin page with a message "Session expired. Please sign in again".
5. **Given** I am authenticated and viewing my task list, **When** I scroll through tasks, **Then** tasks are displayed with title, description (truncated if long), completion status, and action buttons (edit, delete, toggle complete).
6. **Given** I am authenticated, **When** task descriptions exceed 100 characters, **Then** they are truncated with "..." and expandable on click or hover.

---

### User Story 4 - Create New Task (Priority: P2)

As an authenticated user, I want to create a new task through an intuitive modal interface so that I can quickly add items to my todo list.

**Why this priority**: Task creation is essential for users to add value to the application. Without this, the app is read-only and not useful. This must be intuitive and fast to ensure user engagement.

**Independent Test**: An authenticated user can click "Create Task", fill in title (required) and description (optional), submit, see the new task appear in their list immediately, and have the modal close automatically.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I click the "Create Task" button, **Then** a modal opens with a form containing title input (required), description textarea (optional), and "Create" / "Cancel" buttons.
2. **Given** the create task modal is open, **When** I enter a title "Buy groceries" and submit, **Then** the task is created via API, appears at the top of my task list, and the modal closes.
3. **Given** the create task modal is open, **When** I enter a title and description and submit, **Then** both fields are saved and the task appears with full details.
4. **Given** the create task modal is open, **When** I try to submit without entering a title, **Then** I see inline validation error "Title is required" and submission is prevented.
5. **Given** the create task modal is open, **When** the API request fails (e.g., 401 Unauthorized due to expired JWT), **Then** I see an error message "Unable to create task. Please sign in again" and am redirected to signin.
6. **Given** the create task modal is open, **When** I click "Cancel" or click outside the modal, **Then** the modal closes and no task is created.
7. **Given** I create a task successfully, **When** the modal closes, **Then** I see a success toast notification "Task created successfully" that auto-dismisses after 3 seconds.

---

### User Story 5 - Update Existing Task (Priority: P3)

As an authenticated user, I want to edit my existing tasks so that I can correct mistakes, update information, or add details to tasks.

**Why this priority**: Editing is a common workflow for task management. After creating tasks, users need flexibility to modify them. This enhances the app's utility and user satisfaction.

**Independent Test**: An authenticated user can click the edit button on a task, modify the title or description in a modal, submit, and see the updated task reflected in the list immediately.

**Acceptance Scenarios**:

1. **Given** I have a task with title "Buy groceries", **When** I click the edit button on that task, **Then** a modal opens with the current title and description pre-filled.
2. **Given** the edit task modal is open with pre-filled data, **When** I change the title to "Buy groceries and cook dinner" and submit, **Then** the task is updated via API and the list reflects the new title.
3. **Given** the edit task modal is open, **When** I clear the title field and try to submit, **Then** I see validation error "Title is required" and submission is prevented.
4. **Given** the edit task modal is open, **When** I click "Cancel", **Then** the modal closes and no changes are saved.
5. **Given** I am editing a task, **When** another user deletes that task simultaneously and I submit, **Then** I see an error message "Task no longer exists" and the task is removed from my list.
6. **Given** I successfully update a task, **When** the modal closes, **Then** I see a success toast "Task updated successfully".

---

### User Story 6 - Delete Task (Priority: P3)

As an authenticated user, I want to permanently delete tasks so that I can remove completed or irrelevant items from my list.

**Why this priority**: Deletion is essential for maintaining a clean, relevant task list. Users need the ability to remove tasks they no longer need. This completes the CRUD operations.

**Independent Test**: An authenticated user can click the delete button on a task, confirm the deletion in a confirmation dialog, and see the task immediately removed from the list.

**Acceptance Scenarios**:

1. **Given** I have a task in my list, **When** I click the delete button (trash icon), **Then** a confirmation dialog appears asking "Are you sure you want to delete this task? This action cannot be undone."
2. **Given** the delete confirmation dialog is open, **When** I click "Delete", **Then** the task is deleted via API, removed from the list, and I see a success toast "Task deleted successfully".
3. **Given** the delete confirmation dialog is open, **When** I click "Cancel", **Then** the dialog closes and the task remains in the list.
4. **Given** I confirm task deletion, **When** the API request fails (e.g., 404 Not Found), **Then** I see an error message "Task no longer exists" and the task is removed from the UI anyway (optimistic update).
5. **Given** I delete a task successfully, **When** the task list updates, **Then** the deleted task is removed with a smooth fade-out animation (200ms).

---

### User Story 7 - Toggle Task Completion (Priority: P3)

As an authenticated user, I want to mark tasks as complete or incomplete so that I can track my progress and visually distinguish finished work from pending items.

**Why this priority**: Completion toggling is core to task management workflows. Users need immediate visual feedback on what's done vs. pending. This provides satisfaction and productivity tracking.

**Independent Test**: An authenticated user can click a checkbox or button on a task to toggle its completion status, with immediate visual feedback (strikethrough, color change), and the change persisted to the backend.

**Acceptance Scenarios**:

1. **Given** I have a pending task, **When** I click the checkbox next to the task, **Then** the task is marked complete (checkbox checked, title has strikethrough, color changes to muted gray), and the status is saved via API.
2. **Given** I have a completed task, **When** I click the checkbox, **Then** the task is marked pending (checkbox unchecked, strikethrough removed, color returns to default), and the status is saved via API.
3. **Given** I toggle a task's completion status, **When** the API request is in flight, **Then** the UI updates optimistically (immediate visual feedback) but reverts if the API call fails.
4. **Given** I toggle completion and the API fails (e.g., 401 Unauthorized), **Then** the task reverts to its previous state and I see an error toast "Unable to update task. Please sign in again".
5. **Given** I toggle completion multiple times rapidly, **When** API requests are pending, **Then** only the final state is sent to the backend (debounced or queued properly).

---

### User Story 8 - Logout (Priority: P2)

As an authenticated user, I want to securely log out of my account so that I can protect my data when using shared devices or ending my work session.

**Why this priority**: Logout is critical for security and privacy, especially on shared devices. Users must have a clear, accessible way to end their session.

**Independent Test**: An authenticated user can click a "Logout" button, have their session cleared (JWT removed), and be redirected to the signin page with no access to protected routes.

**Acceptance Scenarios**:

1. **Given** I am authenticated and on the dashboard, **When** I click "Logout" in the navigation bar, **Then** my session is cleared, JWT is removed, and I am redirected to the signin page.
2. **Given** I have logged out, **When** I try to navigate to the dashboard URL directly, **Then** I am automatically redirected to the signin page.
3. **Given** I log out, **When** I click the browser back button, **Then** I cannot access protected pages and am redirected to signin.
4. **Given** I log out successfully, **When** I return to the signin page, **Then** I see a confirmation message "You have been logged out successfully".

---

### User Story 9 - Session Expiration Handling (Priority: P2)

As a user, I want the application to handle expired sessions gracefully so that I am not confused when my authentication expires and can easily re-authenticate.

**Why this priority**: Session expiration is inevitable with JWT-based auth. Poor handling leads to broken UI and frustrated users. Graceful handling ensures professional UX.

**Independent Test**: When a user's JWT expires during active use, any API request returns 401, the user is automatically redirected to signin with their session cleared, and they see a clear message explaining what happened.

**Acceptance Scenarios**:

1. **Given** my JWT is expired, **When** I make any API request (view tasks, create task, etc.), **Then** I receive 401 Unauthorized, am redirected to signin, and see message "Your session has expired. Please sign in again."
2. **Given** my session expires while viewing the dashboard, **When** I try to create a task, **Then** the create request fails with 401, I am redirected to signin, and the task is not created.
3. **Given** my session expires, **When** I am redirected to signin and sign in again, **Then** I am returned to the dashboard and can resume work.

---

### Edge Cases

**Authentication Edge Cases**:
- What happens when a JWT is malformed in local storage? → Auto-redirect to signin with session cleared
- What happens when Better Auth service is completely down during signup/signin? → Display error message with retry option, no silent failures
- What happens if a user has multiple tabs open and logs out in one tab? → All tabs detect session removal and redirect to signin
- What happens when the backend returns 401 for an expired JWT? → Clear session, redirect to signin with "Session expired" message

**Data Validation Edge Cases**:
- What happens when a user enters a task title exceeding 200 characters? → Frontend truncates input at 200 chars with character counter showing "200/200"
- What happens when a user pastes extremely long text into description field? → Frontend truncates at 500 chars with validation message
- What happens when a user enters special characters (emojis, SQL injection attempts) in title/description? → Characters are properly encoded and safely sent to backend (no client-side sanitization that could cause data loss)

**Ownership & Authorization Edge Cases**:
- What happens if frontend tries to access another user's tasks (malicious attempt or bug)? → Backend returns 403 Forbidden, frontend displays "Access denied" and logs the user out
- What happens if a task is deleted by another session while a user is editing it? → On submit, backend returns 404, frontend shows "Task no longer exists" and removes from list

**Network & API Edge Cases**:
- What happens when API requests time out? → Show error toast "Request timed out. Please try again" with retry option
- What happens when the backend is completely unreachable? → Show error message "Unable to connect to server. Please check your internet connection" with retry button
- What happens when user is offline? → Detect offline status and show banner "You are offline. Some features may not work" (Phase II: no offline support, just informative message)
- What happens during concurrent updates to the same task? → Backend handles with optimistic locking (409 Conflict), frontend displays "Task was updated by another session. Please refresh and try again"

**UI/UX Edge Cases**:
- What happens when the task list has hundreds of tasks? → All tasks are rendered (pagination is out of scope for Phase II), but UI performance should remain acceptable with virtual scrolling or similar optimization
- What happens when task titles or descriptions contain only whitespace? → Frontend validation trims whitespace and treats empty strings as invalid
- What happens when a user rapidly clicks "Create Task" multiple times? → Button is disabled during API request to prevent duplicate submissions
- What happens if a modal is open when session expires? → Modal closes, session cleared, redirect to signin

**Responsive Design Edge Cases**:
- What happens on very small screens (≥320px)? → UI adapts with single-column layout, modals take full screen, buttons stack vertically
- What happens on tablets in landscape vs portrait? → Layout adjusts fluidly using Tailwind responsive classes
- What happens when user zooms in/out? → Text remains readable, layout doesn't break (tested up to 200% zoom)

**Browser Compatibility Edge Cases**:
- What happens in browsers with JavaScript disabled? → Show static message "JavaScript is required to use this application"
- What happens if localStorage is disabled/unavailable? → Better Auth may fail to store session; show error "Browser storage is required. Please enable cookies and try again"

## Clarifications

### Session 2026-01-06
- Q: State management approach → A: React Context + hooks for global state (user session, task list)
- Q: Toast notification library → A: Sonner (modern, Server Components support, smaller bundle)
- Q: Icon library → A: Lucide React (modern, tree-shakeable, popular choice)
- Q: Task list performance with large data → A: Implement virtual scrolling (react-window or react-virtual)
- Q: Modal library → A: Radix UI Dialog (fully accessible, unstyled, Tailwind compatible)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Session Management
- **FR-001**: System MUST provide a signup page at route `/signup` with email and password fields
- **FR-002**: System MUST integrate Better Auth for user registration and issue JWT tokens on successful signup
- **FR-003**: System MUST provide a signin page at route `/signin` with email and password fields
- **FR-004**: System MUST integrate Better Auth for user authentication and session management
- **FR-005**: System MUST store JWT session securely using Better Auth's recommended storage mechanism (HTTP-only cookies preferred, localStorage fallback)
- **FR-006**: System MUST persist sessions for 7 days by default (configurable in Better Auth)
- **FR-007**: System MUST provide a logout function that clears the JWT session and redirects to signin
- **FR-008**: System MUST attach JWT to every backend API request in the `Authorization: Bearer <token>` header
- **FR-009**: System MUST handle 401 Unauthorized responses by clearing session and redirecting to signin with message "Session expired. Please sign in again"
- **FR-010**: System MUST handle 403 Forbidden responses by logging out the user and displaying "Access denied"
- **FR-011**: System MUST validate email format client-side before submission (standard email regex)
- **FR-012**: System MUST enforce password minimum length of 8 characters client-side
- **FR-013**: System MUST prevent access to protected routes (dashboard, etc.) for unauthenticated users by redirecting to signin

#### Task List Display
- **FR-014**: System MUST provide a dashboard route `/dashboard` (protected, requires authentication)
- **FR-015**: System MUST fetch and display all tasks for the authenticated user via `GET /api/{user_id}/tasks`
- **FR-016**: System MUST display a loading state (spinner or skeleton) while tasks are being fetched
- **FR-017**: System MUST display an empty state when user has no tasks, with message "No tasks yet. Create your first task to get started" and a "Create Task" button
- **FR-018**: System MUST display tasks in a list format with the following visible fields: title, description (truncated), completion status, action buttons
- **FR-019**: System MUST truncate task descriptions longer than 100 characters with "..." and provide expand functionality
- **FR-020**: System MUST display completed tasks with visual distinction (strikethrough title, muted color)
- **FR-021**: System MUST sort tasks by creation date (newest first) by default

#### Task Creation
- **FR-022**: System MUST provide a "Create Task" button prominently on the dashboard
- **FR-023**: System MUST open a modal when "Create Task" is clicked, containing a form with title (required) and description (optional) fields
- **FR-024**: System MUST validate that title is non-empty before allowing submission
- **FR-025**: System MUST enforce title max length of 200 characters with character counter
- **FR-026**: System MUST enforce description max length of 500 characters with character counter
- **FR-027**: System MUST trim leading/trailing whitespace from title and description before submission
- **FR-028**: System MUST create tasks via `POST /api/{user_id}/tasks` with JSON payload containing title and description
- **FR-029**: System MUST close the modal and add the new task to the top of the list on successful creation
- **FR-030**: System MUST display success toast "Task created successfully" on successful creation
- **FR-031**: System MUST display error message in modal if API request fails, without closing modal
- **FR-032**: System MUST disable the submit button during API request to prevent duplicate submissions

#### Task Update
- **FR-033**: System MUST provide an edit button (pencil icon) for each task in the list
- **FR-034**: System MUST open a modal when edit button is clicked, pre-filled with current task title and description
- **FR-035**: System MUST validate title is non-empty before allowing update submission
- **FR-036**: System MUST update tasks via `PUT /api/{user_id}/tasks/{task_id}` with JSON payload containing updated title and description
- **FR-037**: System MUST update the task in the list on successful API response
- **FR-038**: System MUST display success toast "Task updated successfully" on successful update
- **FR-039**: System MUST handle 404 Not Found by displaying "Task no longer exists" and removing from list
- **FR-040**: System MUST close the modal on successful update
- **FR-041**: System MUST allow canceling edit without saving changes

#### Task Deletion
- **FR-042**: System MUST provide a delete button (trash icon) for each task in the list
- **FR-043**: System MUST open a confirmation dialog when delete button is clicked with message "Are you sure you want to delete this task? This action cannot be undone."
- **FR-044**: System MUST delete tasks via `DELETE /api/{user_id}/tasks/{task_id}` when confirmed
- **FR-045**: System MUST remove the task from the list on successful deletion with fade-out animation (200ms)
- **FR-046**: System MUST display success toast "Task deleted successfully" on successful deletion
- **FR-047**: System MUST handle 404 Not Found by removing task from UI (optimistic update) without showing error
- **FR-048**: System MUST close the confirmation dialog on cancel without deleting

#### Task Completion Toggle
- **FR-049**: System MUST provide a checkbox or toggle button for each task to mark completion status
- **FR-050**: System MUST toggle completion via `PATCH /api/{user_id}/tasks/{task_id}/complete`
- **FR-051**: System MUST update UI optimistically (immediate visual feedback before API response)
- **FR-052**: System MUST revert UI state if API request fails
- **FR-053**: System MUST display visual distinction for completed tasks (strikethrough title, checkbox checked, muted color)
- **FR-054**: System MUST handle rapid successive toggles by debouncing or queuing requests

#### API Client Architecture
- **FR-055**: System MUST provide a centralized API client module at `/lib/api.ts` for all backend requests
- **FR-056**: System MUST automatically attach JWT from Better Auth session to all API requests
- **FR-057**: System MUST use TypeScript interfaces for all API request/response types
- **FR-058**: System MUST handle API errors consistently with typed error responses
- **FR-059**: System MUST include proper Content-Type headers (`application/json`) in all requests
- **FR-060**: System MUST extract user_id from JWT claims to construct API endpoints

#### UI/UX Requirements
- **FR-061**: System MUST use Tailwind CSS for all styling (no inline styles)
- **FR-062**: System MUST follow responsive design principles with breakpoints: mobile (≥320px), tablet (≥768px), desktop (≥1024px)
- **FR-063**: System MUST use a consistent color palette with defined roles: primary (brand color), surface (backgrounds), danger (destructive actions), success (confirmations), muted (secondary text)
- **FR-064**: System MUST use consistent spacing rhythm (Tailwind spacing scale: 4px base unit)
- **FR-065**: System MUST display toast notifications for success/error messages that auto-dismiss after 3 seconds
- **FR-066**: System MUST use modals for create/edit flows with backdrop that closes modal on click
- **FR-067**: System MUST use confirmation dialogs for destructive actions (delete)
- **FR-068**: System MUST provide loading states for all async operations (spinners, skeleton screens, disabled buttons)
- **FR-069**: System MUST use icons for action buttons (edit, delete, complete) with aria-labels for accessibility
- **FR-070**: System MUST display clear, user-friendly error messages (no raw API errors exposed to users)

#### Accessibility Requirements
- **FR-071**: System MUST provide proper semantic HTML (heading hierarchy, landmark regions, form labels)
- **FR-072**: System MUST include ARIA labels for icon-only buttons
- **FR-073**: System MUST support keyboard navigation for all interactive elements (forms, modals, buttons)
- **FR-074**: System MUST provide focus indicators for keyboard navigation
- **FR-075**: System MUST ensure minimum color contrast ratio of 4.5:1 for text (WCAG AA compliance)
- **FR-076**: System MUST provide screen reader announcements for dynamic content changes (task created, deleted, updated)

#### Performance Requirements
- **FR-077**: System MUST use Next.js Server Components by default for static content
- **FR-078**: System MUST use Client Components only when interactivity is required (forms, modals, interactive lists)
- **FR-079**: System MUST implement loading skeletons to improve perceived performance
- **FR-080**: System MUST optimize API calls by avoiding unnecessary re-fetches (proper caching/state management)

#### Error Handling Requirements
- **FR-081**: System MUST display user-friendly error messages for all failure scenarios
- **FR-082**: System MUST provide retry mechanisms for transient failures (network errors, timeouts)
- **FR-083**: System MUST log errors to console (development) without exposing sensitive data to users
- **FR-084**: System MUST handle offline state by displaying informative banner (no offline functionality in Phase II)

#### Environment & Configuration
- **FR-085**: System MUST read backend API base URL from environment variable `NEXT_PUBLIC_API_URL`
- **FR-086**: System MUST read Better Auth configuration from environment variables (per Better Auth documentation)
- **FR-087**: System MUST NOT hardcode API URLs or secrets in source code

### Key Entities

- **User Session**: Represents an authenticated user session managed by Better Auth. Key attributes:
  - JWT token (stored securely by Better Auth)
  - user_id (UUID extracted from JWT claims)
  - email (stored in JWT claims)
  - Expiration timestamp (7 days default)

- **Task (Frontend Model)**: Represents a task in the UI. Key attributes matching backend contract:
  - `id` (UUID, from backend)
  - `user_id` (UUID, from backend, used for API routing)
  - `title` (string, max 200 chars, required)
  - `description` (string, max 500 chars, optional)
  - `completed` (boolean)
  - `created_at` (ISO timestamp string, for sorting)
  - `updated_at` (ISO timestamp string)

- **API Response/Error**: Structured responses from backend. Key attributes:
  - Success: JSON object or array matching backend contracts
  - Error: `{ message: string }` format with HTTP status code

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration from landing page to dashboard in under 60 seconds with valid credentials
- **SC-002**: Returning users can sign in and see their task list in under 5 seconds on standard broadband connection
- **SC-003**: All task CRUD operations provide immediate visual feedback (optimistic updates) within 100ms of user action
- **SC-004**: Users can create, view, update, delete, and toggle completion of tasks without encountering any broken states or silent failures
- **SC-005**: Application maintains user session for 7 days without requiring re-authentication (tested by closing browser and returning)
- **SC-006**: All protected routes (dashboard) are inaccessible to unauthenticated users (verified by direct URL navigation)
- **SC-007**: Session expiration is handled gracefully with automatic redirect and clear messaging (no broken UI states)
- **SC-008**: Application displays correctly and remains functional on screens from 320px width (mobile) to 2560px width (desktop)
- **SC-009**: All interactive elements are keyboard accessible and have visible focus indicators (tested with Tab navigation)
- **SC-010**: Color contrast meets WCAG AA standards for all text content (verified with accessibility checker)
- **SC-011**: Error messages are user-friendly and actionable (no raw error codes or technical jargon displayed)
- **SC-012**: Toast notifications appear consistently for all success/error events and auto-dismiss after 3 seconds
- **SC-013**: Modals close properly via Cancel button, backdrop click, or Escape key
- **SC-014**: Application integrates successfully with backend REST APIs without CORS errors or authentication failures
- **SC-015**: Empty states and loading states are displayed appropriately across all views
- **SC-016**: The application code follows established Next.js 16+ patterns (App Router, Server Components, Client Components)
- **SC-017**: All API requests automatically include JWT authentication headers without manual configuration
- **SC-018**: Users can distinguish between pending and completed tasks at a glance through clear visual styling
- **SC-019**: Task descriptions longer than 100 characters are truncated appropriately without breaking layout
- **SC-020**: The application provides a professional, polished UI comparable in quality to Todoist, Notion, or Linear

### Definition of Done

A feature/user story is considered "done" when:
1. All acceptance scenarios pass in manual testing
2. UI components render correctly on mobile, tablet, and desktop viewports
3. TypeScript types are defined for all API contracts and component props
4. Error handling is implemented for all API calls with user-friendly messages
5. Loading states and empty states are implemented and tested
6. Accessibility requirements are met (semantic HTML, ARIA labels, keyboard navigation)
7. Code follows established patterns (Server Components by default, Client Components when needed)
8. Better Auth integration works correctly for authentication flows
9. JWT tokens are automatically attached to API requests
10. Changes are committed with descriptive messages
11. PHR is created for the implementation session

## Assumptions

- **Backend API**: The backend REST API described in spec `002-fullstack-task-management` is fully implemented and operational
- **Better Auth Setup**: Better Auth is configured to issue JWT tokens signed with the shared secret `BETTER_AUTH_SECRET`
- **CORS Configuration**: Backend is configured to allow requests from the frontend origin
- **Environment Variables**: `.env.local` file is configured with `NEXT_PUBLIC_API_URL` and Better Auth configuration
- **Database**: Backend has database migrations applied and is connected to Neon Serverless PostgreSQL
- **Browser Support**: Modern browsers with JavaScript enabled (Chrome, Firefox, Safari, Edge - latest 2 versions)
- **Internet Connection**: Users have active internet connection (no offline mode in Phase II)
- **Node.js Version**: Development environment has Node.js 18+ installed for Next.js 16 compatibility
- **TypeScript**: All code is written in TypeScript with strict mode enabled
- **Character Limits**: Backend enforces title max 200 chars and description max 500 chars as documented
- **Task Sorting**: Backend returns tasks in creation order (newest first) or frontend handles sorting client-side
- **No Pagination**: All tasks are returned in a single request (virtual scrolling handles performance for large lists)
- **User ID Extraction**: Frontend can extract user_id from Better Auth JWT claims to construct API endpoints
- **State Management**: React Context + hooks for global state (user session, task list)
- **Toast Library**: Sonner will be used for toast notifications
- **Icon Library**: Lucide React will be used for UI icons
- **Modal Library**: Radix UI Dialog will be used for create/edit modals
- **Virtual Scrolling**: react-window or react-virtual will be used for task list performance with large datasets
