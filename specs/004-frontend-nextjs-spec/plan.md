# Implementation Plan: Next.js Frontend for Full-Stack Task Management

**Branch**: `004-frontend-nextjs-spec` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-frontend-nextjs-spec/spec.md`

## Summary

Build a production-grade Next.js 16+ frontend with TypeScript and Tailwind CSS that provides authenticated task management through a polished UI comparable to Todoist, Notion, or Linear. The frontend integrates with Better Auth for JWT-based authentication, consumes the FastAPI backend REST API (spec 002), and implements all CRUD operations with professional UX including modals, toasts, loading states, and responsive design.

**Core Technical Approach** (from research and spec):
- Next.js 16 App Router with Server Components by default, Client Components for interactivity
- Better Auth for JWT session management with automatic token attachment to API calls
- TypeScript interfaces for all API contracts and component props
- Tailwind CSS with consistent spacing, color palette, and responsive breakpoints
- Sonner for toast notifications, Lucide React for icons, Radix UI Dialog for modals
- React Context + hooks for global state (user session, task list)
- react-virtual for virtual scrolling optimization with large task lists

## Technical Context

**Language/Version**: TypeScript 5.3+ with Next.js 16+ (requires Node.js 18+)
**Primary Dependencies**: Next.js 16+, React 19+, Tailwind CSS 3.4+, Better Auth (JWT), Sonner, Lucide React, Radix UI, react-virtual
**Storage**: Backend API + Better Auth JWT session (localStorage/HTTP-only cookies)
**Testing**: Manual testing for Phase II (automated E2E tests deferred to Phase III)
**Target Platform**: Web (modern browsers: Chrome, Firefox, Safari, Edge latest 2 versions)
**Project Type**: Web application (frontend component of full-stack system)
**Performance Goals**:
- Initial page load <2s (3G network)
- Time to Interactive <3s
- Task list fetch <200ms (for <1000 tasks)
- Optimistic UI updates <100ms
**Constraints**:
- WCAG AA accessibility compliance
- Responsive design (320px - 2560px width)
- JWT auto-attachment to all API calls
- No offline support (Phase II)
- No pagination (all tasks fetched in one request)
**Scale/Scope**:
- 3 routes (/signup, /signin, /dashboard)
- 5 core components (TaskList, TaskItem, CreateTaskModal, EditTaskModal, DeleteConfirmDialog)
- 9 user stories with 35+ acceptance scenarios
- 87 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Accuracy & Verification**: All features will work exactly as specified through acceptance scenario testing. All API integrations will be verified against backend contract (spec 002). JWT flow will be validated via browser dev tools.

✅ **Specification First**: Complete specification exists (spec.md with 87 FRs, 9 user stories, 20 success criteria). All implementation will align with approved spec. No code-first development.

✅ **Professional Code Quality**:
- Clean folder structure (Next.js 16 App Router: app/, components/, lib/)
- TypeScript strict mode enabled
- All components typed with interfaces
- Environment variables secured in .env.local (not committed)
- Meaningful commit messages following conventional commits

⚠️ **Clean Code** (adapted for TypeScript/Next.js):
- Code will comply with ESLint + Prettier (Next.js defaults)
- All functions will include TypeScript type annotations
- All exported components/functions will have JSDoc comments
- Variable/function names will be descriptive (camelCase for JS, PascalCase for components)
- Maximum line length: 100 characters
- Imports organized: React → Next.js → third-party → local

⚠️ **Test-First Development**: Phase II focuses on manual testing via acceptance scenarios. Automated tests (Jest, React Testing Library, Playwright E2E) deferred to Phase III. TDD cycle adapted to manual verification:
- Red: Define acceptance scenario in spec
- Green: Implement feature to pass scenario
- Refactor: Polish code while re-verifying scenario

✅ **Evolutionary Architecture**:
- Component abstraction supports future features (e.g., TaskItem can later support drag-drop, tags, due dates)
- API client layer (/lib/api.ts) encapsulates backend communication for future backend swaps
- State management (React Context) can evolve to Zustand/Redux if needed
- No premature optimization (virtual scrolling added only if performance degrades)

✅ **User Experience First**:
- All forms have clear validation with inline error messages
- All destructive actions (delete) require confirmation dialogs
- All async operations show loading states (spinners, disabled buttons)
- All success/error events trigger toast notifications with actionable messages
- All interactive elements keyboard accessible with focus indicators

## Project Structure

### Documentation (this feature)

```text
specs/004-frontend-nextjs-spec/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── api-client.ts    # TypeScript interfaces for backend API contracts
│   └── better-auth.ts   # TypeScript interfaces for Better Auth session/user
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
fullstack-todo-app/
├── frontend/                      # Next.js 16 application (this feature)
│   ├── src/
│   │   ├── app/                   # Next.js App Router routes
│   │   │   ├── layout.tsx         # Root layout with Toaster provider
│   │   │   ├── page.tsx           # Landing/redirect page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx       # User registration page (Client Component)
│   │   │   ├── signin/
│   │   │   │   └── page.tsx       # User sign-in page (Client Component)
│   │   │   └── dashboard/
│   │   │       └── page.tsx       # Protected dashboard (Server Component wrapper + Client list)
│   │   ├── components/            # React components
│   │   │   ├── auth/
│   │   │   │   ├── SignupForm.tsx       # Registration form (Client Component)
│   │   │   │   ├── SigninForm.tsx       # Sign-in form (Client Component)
│   │   │   │   └── LogoutButton.tsx     # Logout button (Client Component)
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.tsx         # Task list container (Client Component)
│   │   │   │   ├── TaskItem.tsx         # Single task item (Client Component)
│   │   │   │   ├── CreateTaskModal.tsx  # Create task modal (Client Component)
│   │   │   │   ├── EditTaskModal.tsx    # Edit task modal (Client Component)
│   │   │   │   ├── DeleteConfirmDialog.tsx # Delete confirmation (Client Component)
│   │   │   │   └── EmptyState.tsx       # No tasks placeholder (Server Component)
│   │   │   ├── ui/                      # Reusable UI primitives
│   │   │   │   ├── Button.tsx           # Button component
│   │   │   │   ├── Input.tsx            # Input field
│   │   │   │   ├── Textarea.tsx         # Textarea field
│   │   │   │   ├── Modal.tsx            # Radix Dialog wrapper
│   │   │   │   ├── Spinner.tsx          # Loading spinner
│   │   │   │   └── Toast.tsx            # Sonner toast wrapper
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx           # Top navigation (Server Component)
│   │   │       └── Container.tsx        # Page container wrapper
│   │   ├── lib/                   # Utilities and API client
│   │   │   ├── api.ts             # Centralized API client with JWT auto-attachment
│   │   │   ├── auth.ts            # Better Auth configuration and helpers
│   │   │   ├── types.ts           # TypeScript type definitions
│   │   │   ├── utils.ts           # Utility functions (cn, truncate, etc.)
│   │   │   └── constants.ts       # App constants (API URLs, limits, etc.)
│   │   ├── context/               # React Context for global state
│   │   │   ├── AuthContext.tsx    # User session context
│   │   │   └── TaskContext.tsx    # Task list context
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts         # Auth state and helpers
│   │   │   ├── useTasks.ts        # Task CRUD operations
│   │   │   └── useToast.ts        # Toast notification helpers
│   │   └── middleware.ts          # Next.js middleware for route protection
│   ├── public/                    # Static assets
│   ├── .env.local                 # Environment variables (not committed)
│   ├── .env.example               # Environment variable template
│   ├── next.config.js             # Next.js configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── tsconfig.json              # TypeScript configuration
│   ├── package.json               # Dependencies
│   └── README.md                  # Frontend setup instructions
├── backend/                       # Python FastAPI server (spec 002)
└── CLAUDE.md                      # Root project instructions
```

**Structure Decision**: Web application structure (frontend + backend separation). Frontend uses Next.js 16 App Router with src/ directory structure for better organization. Routes defined in app/ using file-system routing. Components organized by domain (auth, tasks, ui, layout). All API logic centralized in lib/api.ts. Better Auth configured in lib/auth.ts. Global state managed via React Context in context/. Middleware.ts handles route protection at framework level.

## Complexity Tracking

> **No violations detected.** This implementation follows constitution principles without requiring exceptions.

---

## Phase 0: Outline & Research

**Objective**: Resolve all "NEEDS CLARIFICATION" items from Technical Context and establish best practices for key technologies.

### Research Tasks

1. **Better Auth JWT Integration with Next.js 16**
   - **Unknown**: How to extract user_id from Better Auth JWT claims in Next.js
   - **Research**: Better Auth documentation for Next.js integration, JWT claim structure, session helpers
   - **Output**: Document session setup, user_id extraction pattern, token attachment strategy

2. **Next.js 16 App Router Authentication Patterns**
   - **Unknown**: Best practices for route protection with Better Auth in App Router
   - **Research**: Next.js middleware for auth, Server Component vs Client Component patterns for protected routes
   - **Output**: Document middleware setup, route protection strategy, redirect flows

3. **Radix UI Dialog Accessibility & Integration**
   - **Unknown**: How to implement accessible modals with Radix UI Dialog in Next.js + Tailwind
   - **Research**: Radix UI Dialog documentation, Tailwind styling patterns, keyboard navigation
   - **Output**: Document modal setup, accessibility requirements (ARIA labels, focus trap), backdrop behavior

4. **React Virtual Scrolling for Large Lists**
   - **Unknown**: When to implement virtual scrolling, react-window vs react-virtual trade-offs
   - **Research**: Performance benchmarks for large lists (100, 500, 1000+ items), library comparison
   - **Output**: Document performance threshold for virtual scrolling, chosen library rationale, implementation pattern

5. **Sonner Toast Best Practices**
   - **Unknown**: How to configure Sonner with Server Components, toast triggering from async operations
   - **Research**: Sonner documentation, Next.js 16 compatibility, toast lifecycle management
   - **Output**: Document Toaster provider setup, toast triggering patterns, auto-dismiss configuration

6. **API Error Handling & 401/403 Flows**
   - **Unknown**: How to globally intercept 401/403 responses and trigger auth redirects
   - **Research**: Fetch API interceptor patterns, error boundary setup, redirect strategies
   - **Output**: Document centralized error handler in api.ts, session expiration flow, error message mapping

### Consolidation Format (research.md)

For each research task above:

```markdown
## [Research Topic]

**Decision**: [Chosen approach/library/pattern]

**Rationale**: [Why this was selected - performance, compatibility, maintainability, spec alignment]

**Alternatives Considered**:
- [Alternative 1]: Rejected because [reason]
- [Alternative 2]: Rejected because [reason]

**Implementation Notes**: [Key code patterns, configuration steps, gotchas]
```

**Output Artifact**: `research.md` with all 6 research topics documented, resolving all NEEDS CLARIFICATION items.

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all technologies validated

**Objective**: Define data models, API contracts (TypeScript interfaces), and quickstart guide for frontend setup.

### Task 1.1: Extract Frontend Data Models

**Files**: `data-model.md`

**Action**: Define TypeScript interfaces for all frontend entities based on backend contracts (spec 002) and Better Auth session structure.

**Entities to Document**:

1. **User Session** (from Better Auth):
   - JWT token storage mechanism
   - user_id extraction pattern
   - email, session expiry
   - Session state (authenticated, loading, unauthenticated)

2. **Task** (matching backend contract):
   - id, user_id, title, description, completed, created_at, updated_at
   - Frontend-specific: isExpanded (for description truncation), optimisticUpdate flag

3. **API Response/Error Types**:
   - Success response wrappers
   - Error response structure { message: string }
   - Loading/error state types

**Validation Rules** (from spec FR-016 to FR-027):
- title: non-empty, max 200 chars, whitespace trimmed
- description: max 500 chars, whitespace trimmed, optional
- UUIDs validated for id fields

**State Transitions**:
- Task completion: pending ↔ completed (toggle via PATCH endpoint)
- Session: unauthenticated → loading → authenticated → expired → unauthenticated

**Output**: `data-model.md` with all entities, fields, validation rules, state transitions documented.

### Task 1.2: Generate API Contract Interfaces

**Files**: `contracts/api-client.ts`, `contracts/better-auth.ts`

**Action**: Create TypeScript interface definitions for all backend API contracts and Better Auth session types.

**API Contracts** (from spec 002):

```typescript
// contracts/api-client.ts

export interface Task {
  id: string;          // UUID
  user_id: string;     // UUID
  title: string;       // max 200 chars
  description: string; // max 500 chars
  completed: boolean;
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
}

export interface APIError {
  message: string;
}

export type APIResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: APIError;
};
```

**Better Auth Contracts**:

```typescript
// contracts/better-auth.ts

export interface User {
  id: string;          // UUID (user_id)
  email: string;
}

export interface Session {
  user: User;
  token: string;       // JWT
  expiresAt: string;   // ISO timestamp
}

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Output**: `contracts/` directory with TypeScript interface files following backend OpenAPI contract.

### Task 1.3: Create Quickstart Guide

**Files**: `quickstart.md`

**Action**: Document step-by-step frontend setup, environment variables, and first-time developer workflow.

**Quickstart Sections**:

1. **Prerequisites**: Node.js 18+, npm/yarn, backend running at NEXT_PUBLIC_API_URL
2. **Installation**: `npm install` in frontend/
3. **Environment Setup**: Copy .env.example → .env.local, configure variables
4. **Better Auth Configuration**: Setup steps (if not auto-configured)
5. **Development Server**: `npm run dev`, access at http://localhost:3000
6. **Testing Workflow**: Manual testing via signup → signin → dashboard flow
7. **Troubleshooting**: Common issues (CORS, JWT errors, API connection failures)

**Output**: `quickstart.md` with clear, actionable setup instructions for new developers.

### Task 1.4: Update Agent Context

**Files**: `.specify/memory/claude-context.md` (auto-updated)

**Action**: Run `.specify/scripts/bash/update-agent-context.sh claude` to add new technologies from this plan to agent context.

**Technologies to Add**:
- Next.js 16+, React 19+
- TypeScript 5.3+
- Tailwind CSS 3.4+
- Better Auth (JWT)
- Sonner, Lucide React, Radix UI, react-virtual

**Output**: Agent context file updated with new frontend stack.

### Dependencies (Phase 1)

- Task 1.1 (data models) must complete before Task 1.2 (contracts) to ensure alignment
- Task 1.2 must complete before implementation begins (typed contracts required)
- Task 1.3 can run in parallel with 1.1/1.2
- Task 1.4 runs after 1.1/1.2/1.3 complete

### Validation Checkpoint (Phase 1)

✅ **Before proceeding to Phase 2**:
1. `data-model.md` defines all entities with validation rules
2. `contracts/` contains TypeScript interfaces matching backend OpenAPI spec
3. `quickstart.md` provides clear setup steps
4. Agent context updated with new technologies
5. No NEEDS CLARIFICATION items remain
6. Constitution re-check passes (all principles still aligned)

---

## Phase 2: Implementation Breakdown

**Prerequisites**: Phase 1 complete (data models, contracts, quickstart defined)

**Objective**: Break down implementation into dependency-ordered phases covering all 9 user stories and 87 functional requirements.

**Note**: This section provides a high-level phase breakdown. Detailed task-by-task breakdown will be generated by `/sp.tasks` command after Phase 1 artifacts are approved.

### Phase 2.1: Project Setup & Configuration

**Scope**: Bootstrap Next.js 16 project, install dependencies, configure Tailwind CSS, setup Better Auth

**User Stories**: Foundation for all stories (no direct user story mapping)

**Functional Requirements**: FR-085, FR-086, FR-087 (environment & configuration)

**Tasks**:
1. Initialize Next.js 16 project with TypeScript and App Router
2. Install dependencies (Tailwind, Better Auth, Sonner, Lucide, Radix UI, react-virtual)
3. Configure Tailwind CSS with custom color palette and spacing scale
4. Setup Better Auth with JWT provider and JWKS endpoint
5. Create .env.example and .env.local with required variables
6. Configure ESLint + Prettier for code quality
7. Setup Next.js middleware for route protection skeleton

**Dependencies**: None (foundation phase)

**Validation Checkpoint**:
- Next.js dev server runs without errors
- Tailwind classes apply correctly
- Environment variables load from .env.local
- TypeScript compiles without errors

**Complexity**: Medium (setup + configuration + multiple libraries)

---

### Phase 2.2: Authentication Flow (Signup & Signin)

**Scope**: Implement user registration and sign-in pages with Better Auth integration

**User Stories**:
- User Story 1 (User Registration) - Priority P1
- User Story 2 (User Sign In) - Priority P1

**Functional Requirements**: FR-001 to FR-013 (authentication & session management)

**Tasks**:
1. Create /signup route with SignupForm component
2. Implement Better Auth signup flow with email/password validation
3. Create /signin route with SigninForm component
4. Implement Better Auth signin flow with credential validation
5. Setup JWT session storage (Better Auth automatic)
6. Create AuthContext for global session state
7. Implement useAuth hook with signin/signup/logout helpers
8. Add form validation (email format, password min 8 chars)
9. Implement error handling for auth failures (401, network errors)
10. Add loading states to auth forms (disabled submit during API calls)
11. Implement auto-redirect after successful auth (→ /dashboard)

**Dependencies**: Phase 2.1 (Better Auth configuration required)

**Validation Checkpoint**:
- User can register with valid email/password → receives JWT → redirected to /dashboard
- User can sign in with correct credentials → receives JWT → redirected to /dashboard
- Invalid credentials show user-friendly error messages
- Forms prevent duplicate submissions during loading
- JWT stored securely via Better Auth

**Complexity**: High (authentication flow is critical and complex)

---

### Phase 2.3: API Client & Session Management

**Scope**: Build centralized API client with automatic JWT attachment and error handling

**User Stories**: Foundation for User Stories 3-9 (all require API communication)

**Functional Requirements**: FR-055 to FR-060 (API client architecture), FR-081 to FR-084 (error handling)

**Tasks**:
1. Create /lib/api.ts with fetch wrapper functions
2. Implement JWT auto-attachment to Authorization header (extract from Better Auth session)
3. Implement user_id extraction from JWT claims
4. Build API endpoint generators (GET/POST/PUT/PATCH/DELETE /api/{user_id}/tasks)
5. Implement centralized error handler (401 → clear session + redirect to signin, 403 → logout)
6. Add TypeScript typing for all API request/response payloads
7. Implement retry logic for transient failures (network errors, timeouts)
8. Add request/response logging (development only)
9. Configure CORS handling (backend handles, frontend sends credentials)

**Dependencies**: Phase 2.2 (AuthContext and JWT session required)

**Validation Checkpoint**:
- API client correctly attaches JWT to all requests
- user_id extracted from JWT claims matches authenticated user
- 401 responses trigger automatic redirect to signin with session cleared
- 403 responses log out user and display "Access denied"
- All API functions typed with interfaces from contracts/

**Complexity**: Medium (critical plumbing but well-defined patterns)

---

### Phase 2.4: Protected Dashboard & Route Guards

**Scope**: Implement /dashboard route with authentication protection and empty state

**User Stories**: User Story 3 (View Task List) - Priority P2 (partial: layout only)

**Functional Requirements**: FR-013 (protected route enforcement), FR-014 (dashboard route)

**Tasks**:
1. Create /dashboard route with Server Component layout
2. Implement Next.js middleware for route protection (redirect unauthenticated → /signin)
3. Create Navbar component with user email and Logout button
4. Implement logout functionality (clear session, redirect to /signin)
5. Create Container component for consistent page layout
6. Create EmptyState component for "no tasks" view
7. Add loading skeleton for dashboard initial load

**Dependencies**: Phase 2.2 (authentication), Phase 2.3 (API client)

**Validation Checkpoint**:
- Unauthenticated users redirected to /signin when accessing /dashboard
- Authenticated users see dashboard with navbar and empty state
- Logout clears session and redirects to /signin
- Back button after logout cannot access protected pages

**Complexity**: Low (route protection + basic layout)

---

### Phase 2.5: Task List Display & Fetching

**Scope**: Fetch and display all tasks for authenticated user with loading/error states

**User Stories**: User Story 3 (View Task List) - Priority P2 (complete)

**Functional Requirements**: FR-015 to FR-021 (task list display)

**Tasks**:
1. Create TaskContext for global task state
2. Implement useTasks hook with fetchTasks function
3. Create TaskList component (Client Component) with loading/error/empty states
4. Implement GET /api/{user_id}/tasks via API client
5. Create TaskItem component for individual task rendering
6. Implement task sorting (created_at desc, newest first)
7. Implement description truncation (>100 chars → "..." + expand on hover/click)
8. Add visual distinction for completed tasks (strikethrough, muted color)
9. Add loading spinner during initial fetch
10. Add error state with retry button
11. Implement session expiration handling during fetch (401 → redirect)

**Dependencies**: Phase 2.3 (API client), Phase 2.4 (dashboard layout)

**Validation Checkpoint**:
- Tasks fetch on dashboard load and display in list format
- Loading spinner shows during fetch
- Empty state displays when user has no tasks
- Completed tasks visually distinguished (strikethrough, gray)
- Descriptions >100 chars truncated with expand functionality
- Error state with retry button on API failure
- 401 during fetch redirects to signin

**Complexity**: Medium (state management + multiple UI states)

---

### Phase 2.6: Task CRUD Modals (Create & Edit)

**Scope**: Implement create and edit task modals with validation and success/error handling

**User Stories**:
- User Story 4 (Create New Task) - Priority P2
- User Story 5 (Update Existing Task) - Priority P3

**Functional Requirements**: FR-022 to FR-032 (task creation), FR-033 to FR-041 (task update)

**Tasks**:
1. Create CreateTaskModal component with Radix UI Dialog
2. Implement form validation (title required, max 200 chars; description max 500 chars)
3. Add character counters for title and description fields
4. Implement POST /api/{user_id}/tasks via API client
5. Add optimistic update to task list (insert new task before API response)
6. Implement success toast "Task created successfully"
7. Implement error handling (display error in modal without closing)
8. Disable submit button during API request
9. Create EditTaskModal component with pre-filled form
10. Implement PUT /api/{user_id}/tasks/{task_id} via API client
11. Handle 404 Not Found (task deleted by another session)
12. Implement success toast "Task updated successfully"
13. Add modal close on backdrop click, Cancel button, Escape key
14. Add ARIA labels for accessibility
15. Implement keyboard navigation (Tab, Enter to submit, Escape to close)

**Dependencies**: Phase 2.5 (task list + task context)

**Validation Checkpoint**:
- "Create Task" button opens modal with empty form
- Form validates title non-empty and max lengths
- Character counters show remaining characters
- Task created and appears at top of list on submit
- Success toast displays after creation
- Edit modal pre-fills with current task data
- Task updates reflect in list immediately
- 404 on edit shows "Task no longer exists" and removes from list
- Modals close properly via all methods (backdrop, Cancel, Escape)
- All interactive elements keyboard accessible

**Complexity**: High (complex UI with validation, modals, accessibility)

---

### Phase 2.7: Completion Toggle & Delete

**Scope**: Implement task completion toggling and deletion with confirmation

**User Stories**:
- User Story 6 (Delete Task) - Priority P3
- User Story 7 (Toggle Task Completion) - Priority P3

**Functional Requirements**: FR-042 to FR-048 (task deletion), FR-049 to FR-054 (completion toggle)

**Tasks**:
1. Add checkbox/toggle button to TaskItem for completion status
2. Implement PATCH /api/{user_id}/tasks/{task_id}/complete via API client
3. Add optimistic update for toggle (immediate UI feedback)
4. Implement revert on API failure (show error toast, restore previous state)
5. Add debouncing/queueing for rapid successive toggles
6. Create DeleteConfirmDialog component with Radix UI Dialog
7. Implement DELETE /api/{user_id}/tasks/{task_id} via API client
8. Add confirmation message "Are you sure? This action cannot be undone."
9. Implement fade-out animation (200ms) on successful delete
10. Handle 404 on delete (optimistic removal without error)
11. Implement success toast "Task deleted successfully"
12. Add error handling for delete failures

**Dependencies**: Phase 2.5 (task list), Phase 2.6 (modal patterns)

**Validation Checkpoint**:
- Checkbox click toggles completion status with immediate visual feedback
- Completed tasks show strikethrough and muted color
- Toggle reverts if API fails with error toast
- Rapid toggles handled correctly (final state persisted)
- Delete button opens confirmation dialog
- Confirmed delete removes task with fade-out animation
- Success toast shows after deletion
- 404 on delete removes task without error (optimistic)

**Complexity**: Medium (optimistic updates + animations + confirmation dialog)

---

### Phase 2.8: Polish & Edge Cases

**Scope**: Implement toast notifications, responsive design, accessibility improvements, edge case handling

**User Stories**: All user stories (polish applies across features)

**Functional Requirements**: FR-061 to FR-076 (UI/UX + accessibility), FR-077 to FR-080 (performance)

**Tasks**:
1. Configure Sonner Toaster in root layout with auto-dismiss (3s)
2. Implement toast triggers for all success/error events
3. Add responsive design breakpoints (mobile 320px+, tablet 768px+, desktop 1024px+)
4. Test and fix layout on all viewport sizes
5. Implement consistent color palette (primary, surface, danger, success, muted)
6. Ensure WCAG AA color contrast (4.5:1 for text)
7. Add semantic HTML (headings, landmarks, form labels)
8. Add ARIA labels for icon-only buttons
9. Implement focus indicators for keyboard navigation
10. Test complete keyboard navigation flow
11. Add screen reader announcements for dynamic content (task created/deleted/updated)
12. Optimize bundle size (tree-shaking, code splitting)
13. Implement virtual scrolling if task list >100 items (react-virtual)
14. Add offline detection banner ("You are offline")
15. Implement proper loading skeletons for perceived performance
16. Add error boundaries for graceful error handling
17. Handle edge cases: whitespace-only titles, extremely long strings, special characters

**Dependencies**: All previous phases (polish applies to all features)

**Validation Checkpoint**:
- Toasts appear consistently and auto-dismiss after 3s
- UI renders correctly on 320px, 768px, 1024px, 1920px viewports
- All text meets WCAG AA contrast ratio
- All interactive elements keyboard accessible with visible focus
- Screen reader announces task state changes
- Large task lists (100+) render smoothly
- Offline state displays informative banner
- No console errors or warnings
- Edge cases handled gracefully (validation, sanitization)

**Complexity**: Medium (broad scope but individual tasks straightforward)

---

### Phase 2.9: Final Integration & Testing

**Scope**: End-to-end testing of all user stories, backend integration verification, documentation

**User Stories**: All 9 user stories

**Functional Requirements**: All 87 FRs

**Tasks**:
1. Test complete user journey: signup → signin → create task → edit → toggle → delete → logout
2. Verify JWT attachment to all API requests (browser dev tools Network tab)
3. Test session persistence (close browser, reopen → still authenticated)
4. Test session expiration handling (wait for JWT expiry or manually invalidate)
5. Verify all 35+ acceptance scenarios from spec
6. Test error scenarios: backend down, network failure, 401/403 responses
7. Test CORS integration with backend (no CORS errors)
8. Verify all success criteria (SC-001 to SC-020)
9. Document any deviations from spec (if necessary)
10. Create frontend README with setup, development, and testing instructions
11. Verify environment variables documented in .env.example
12. Test on different browsers (Chrome, Firefox, Safari, Edge)

**Dependencies**: All implementation phases (2.1 to 2.8) complete

**Validation Checkpoint**:
- All 9 user stories pass independent tests
- All 35+ acceptance scenarios verified manually
- All 20 success criteria met
- No CORS errors or authentication failures
- Session management works correctly
- All browsers supported (latest 2 versions)
- README provides clear setup instructions

**Complexity**: Medium (comprehensive testing but well-defined scenarios)

---

## Recommended Implementation Order

**Priority**: Stability and security first, then core features, then polish.

1. **Phase 2.1** (Setup) → Foundation for all work
2. **Phase 2.2** (Auth) → Security gate, required before protected features
3. **Phase 2.3** (API Client) → Plumbing for all backend communication
4. **Phase 2.4** (Dashboard) → Protected route foundation
5. **Phase 2.5** (Task List) → Core value proposition (viewing tasks)
6. **Phase 2.6** (Create/Edit Modals) → Core value proposition (managing tasks)
7. **Phase 2.7** (Toggle/Delete) → Complete CRUD operations
8. **Phase 2.8** (Polish) → Professional UX and accessibility
9. **Phase 2.9** (Testing) → Verification and documentation

**Rationale**: Authentication must work before any protected routes. API client must exist before making backend calls. Dashboard layout required before displaying tasks. Task viewing is higher priority than task creation/editing. Polish and testing come last to ensure all features complete before refinement.

---

## Risks & Mitigations

### Risk 1: JWT Extraction from Better Auth Session

**Issue**: Extracting user_id from Better Auth JWT claims may vary depending on Better Auth configuration.

**Impact**: API client cannot construct `/api/{user_id}/tasks` endpoints correctly.

**Mitigation**:
- Phase 0 research will document exact JWT claim structure from Better Auth
- Test JWT decoding in browser console during auth development (Phase 2.2)
- Implement fallback error handling if user_id extraction fails (logout + error message)

**Contingency**: If Better Auth JWT doesn't include user_id, call a backend `/api/me` endpoint to retrieve user identity.

---

### Risk 2: 401 Handling Across Modals and Async Operations

**Issue**: Session expiration during task CRUD operations (e.g., while create modal is open) may cause confusing UX.

**Impact**: User submits form, gets 401, modal stays open with unclear error.

**Mitigation**:
- Centralized error handler in api.ts automatically clears session and redirects on 401
- Close all open modals on redirect (via global event or context)
- Show clear message: "Session expired. Please sign in again."

**Contingency**: Implement modal close listener that triggers on auth state change.

---

### Risk 3: Virtual Scrolling with Large Task Lists

**Issue**: react-window or react-virtual may complicate task list rendering and state management.

**Impact**: Bugs in item rendering, scroll position loss on updates, complexity overhead.

**Mitigation**:
- Defer virtual scrolling until performance testing shows need (>100 tasks)
- Use simple list rendering initially, optimize later if slow
- Phase 0 research will benchmark performance thresholds

**Contingency**: Accept slower performance for large lists in Phase II, optimize in Phase III.

---

### Risk 4: Radix UI Dialog Accessibility Issues

**Issue**: Radix Dialog requires careful ARIA setup and focus management for WCAG compliance.

**Impact**: Screen readers may not announce modals correctly, keyboard navigation may break.

**Mitigation**:
- Phase 0 research will document Radix Dialog accessibility patterns
- Test with screen reader (macOS VoiceOver or NVDA) during Phase 2.6
- Follow Radix UI documentation exactly for ARIA attributes

**Contingency**: If Radix Dialog proves too complex, fall back to simpler styled `<dialog>` element (native HTML).

---

### Risk 5: CORS Errors with Backend

**Issue**: Frontend and backend on different origins may cause CORS preflight failures.

**Impact**: All API requests fail with CORS errors, app unusable.

**Mitigation**:
- Backend already configured for CORS (spec 002 FR-038)
- Test CORS immediately in Phase 2.3 when API client is built
- Use Next.js API routes as proxy if CORS issues persist (fallback)

**Contingency**: Implement Next.js API route proxy to backend to avoid CORS (adds latency but works).

---

### Risk 6: Better Auth Version Compatibility with Next.js 16

**Issue**: Better Auth may have breaking changes or incompatibilities with Next.js 16 / React 19.

**Impact**: Authentication flow breaks, JWT session storage fails.

**Mitigation**:
- Phase 0 research will verify Better Auth + Next.js 16 compatibility
- Check Better Auth changelog and Next.js 16 upgrade guide
- Test auth flow early in Phase 2.2

**Contingency**: If Better Auth incompatible, implement custom JWT session management (localStorage + manual token handling).

---

## Dependencies Summary

**Cross-Phase Dependencies**:

- Phase 2.2 → depends on → Phase 2.1 (Better Auth configuration)
- Phase 2.3 → depends on → Phase 2.2 (AuthContext and JWT session)
- Phase 2.4 → depends on → Phase 2.2, 2.3 (auth + API client)
- Phase 2.5 → depends on → Phase 2.3, 2.4 (API client + dashboard layout)
- Phase 2.6 → depends on → Phase 2.5 (task list + task context)
- Phase 2.7 → depends on → Phase 2.5 (task list), Phase 2.6 (modal patterns)
- Phase 2.8 → depends on → All previous phases (polish applies to all features)
- Phase 2.9 → depends on → All previous phases (final integration)

**External Dependencies**:

- Backend API (spec 002) must be running and accessible at NEXT_PUBLIC_API_URL
- Better Auth JWKS endpoint must be configured and accessible
- Neon PostgreSQL database must be running (via backend)

**Library Version Dependencies**:

- Node.js 18+ required for Next.js 16
- TypeScript 5.3+ for latest type features
- React 19+ for Server Components and async support
- Tailwind CSS 3.4+ for latest utilities

---

## Validation Checkpoints Summary

**After Phase 0 (Research)**:
- ✅ All NEEDS CLARIFICATION items resolved
- ✅ Better Auth + Next.js 16 integration documented
- ✅ Radix Dialog accessibility patterns documented
- ✅ Virtual scrolling threshold determined
- ✅ Sonner toast setup documented
- ✅ API error handling strategy defined

**After Phase 1 (Design)**:
- ✅ data-model.md defines all entities with validation rules
- ✅ contracts/ contains TypeScript interfaces matching backend
- ✅ quickstart.md provides clear setup steps
- ✅ Agent context updated with new technologies
- ✅ Constitution re-check passes

**After Each Implementation Phase**:
- ✅ Specific acceptance scenarios verified (see phase validation checkpoints above)
- ✅ No TypeScript compilation errors
- ✅ No ESLint warnings
- ✅ Manual testing confirms functionality
- ✅ Code follows clean code principles (JSDoc comments, descriptive names, <100 char lines)

**After Phase 2.9 (Final Testing)**:
- ✅ All 9 user stories pass independent tests
- ✅ All 35+ acceptance scenarios verified
- ✅ All 20 success criteria met
- ✅ Backend integration confirmed (no CORS or auth errors)
- ✅ README documents setup and usage

---

## Final Notes

**Test Strategy**: Phase II focuses on manual testing via acceptance scenarios. Automated tests (Jest unit tests, React Testing Library component tests, Playwright E2E tests) deferred to Phase III. Each phase has specific manual validation checkpoints.

**Performance Strategy**: Start simple (no virtual scrolling, no pagination), optimize only when performance degrades. Measure task list render time with 100, 500, 1000 tasks. Implement react-virtual only if render time >500ms.

**Accessibility Strategy**: Built-in from start (semantic HTML, ARIA labels, keyboard navigation, color contrast). Test with keyboard navigation and screen reader during development, not as afterthought.

**Security Strategy**: JWT verification handled by backend (spec 002). Frontend only attaches token and handles 401/403 responses. Never trust client-side data - all validation happens on backend.

**Documentation Strategy**: Inline JSDoc comments for all exported functions/components. README for setup. quickstart.md for developer onboarding. PHR created after each major phase completion.

**Next Steps**:
1. Approve this plan and Phase 0/1 research/design artifacts
2. Run `/sp.tasks` to generate detailed task breakdown from this plan
3. Run `/sp.implement` to execute tasks using Red-Green-Refactor workflow
4. Run `/sp.adr` after implementation to document architectural decisions
5. Run `/sp.phr` to record prompt history for this planning session

---

**Plan Status**: ✅ Complete - Ready for review and Phase 0 execution

**Constitution Compliance**: ✅ All principles followed, no violations requiring justification

**Spec Coverage**: ✅ All 9 user stories, 87 FRs, 20 success criteria mapped to implementation phases
