# Tasks: Dark Mode Frontend UI

**Input**: Design documents from `/specs/001-dark-mode-ui/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Manual testing via acceptance scenarios (automated E2E deferred to Phase III per spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` (frontend only feature)
- Base path: `/home/hamza_ahmed/fullstack-todo-app/phase-2-task-management-system/frontend`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, design system setup, and base component structure

- [X] T001 Create design system CSS variables in frontend/src/app/globals.css with dark mode color palette (--bg-primary, --bg-surface, --text-primary, --accent-primary, etc.)
- [X] T002 [P] Update frontend/tailwind.config.ts with custom colors mapping to CSS variables and rounded corner tokens
- [X] T003 [P] Create TypeScript types for UI entities in frontend/src/lib/ui-types.ts (TodoItem, Priority, TodoStatus enums)
- [X] T004 [P] Install and configure Lucide React icons package if not already installed
- [X] T005 [P] Verify Sonner toast notifications are configured in frontend/src/app/layout.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create base Button component in frontend/src/components/ui/Button.tsx with variants (primary, secondary, ghost, danger), sizes, loading state, and rounded-md corners
- [X] T007 [P] Create base Card component in frontend/src/components/ui/Card.tsx with glass-morphism effects, soft shadows, and rounded-lg corners
- [X] T008 [P] Create base Input component in frontend/src/components/ui/Input.tsx with dark mode styling and focus states
- [X] T009 [P] Create base Modal component in frontend/src/components/ui/Modal.tsx with backdrop blur, animations, and keyboard accessibility
- [X] T010 Create Skeleton loading component in frontend/src/components/ui/Skeleton.tsx for loading states
- [X] T011 [P] Create utility functions in frontend/src/lib/ui-utils.ts (truncateText, formatDate, debounce)
- [X] T012 Add smooth scroll behavior and base animations in frontend/src/app/globals.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Dashboard Navigation and Branding (Priority: P1) 🎯 MVP

**Goal**: Clean, professional navbar with brand logo, username display, and logout button

**Independent Test**: Load application as logged-in user, verify navbar displays correctly with brand, username (not email), and logout button in proper layout across all breakpoints

### Implementation for User Story 1

- [X] T013 [US1] Create Navbar component in frontend/src/components/layout/Navbar.tsx with brand logo on left, user controls on right
- [X] T014 [US1] Implement brand logo/name display in Navbar with proper typography and spacing
- [X] T015 [US1] Implement username display (not email) with text truncation for long names
- [X] T016 [US1] Implement logout button with LogOut icon from Lucide, hover states, and click handler
- [X] T017 [US1] Add responsive layout for mobile (< 768px) with proper stacking and touch targets (44x44px minimum)
- [X] T018 [US1] Add responsive layout for tablet (768px - 1024px) with appropriate spacing
- [X] T019 [US1] Add responsive layout for desktop (> 1024px) with full horizontal layout
- [X] T020 [US1] Integrate Navbar into frontend/src/app/dashboard/page.tsx or layout

**Checkpoint**: User Story 1 should be fully functional - navbar displays correctly on all screen sizes with working logout

---

## Phase 4: User Story 2 - Todo List Display (Priority: P1)

**Goal**: Clean, organized todo list with consistent card layout showing all required fields

**Independent Test**: Load todos (real or mock data), verify each item displays title, description, status, priority, due date in consistent card layout with smooth scrolling

### Implementation for User Story 2

- [X] T021 [P] [US2] Create TodoItem component in frontend/src/components/tasks/TodoItem.tsx with card layout showing title, description, status, priority, due date
- [X] T022 [P] [US2] Create priority badge component showing low/medium/high with appropriate colors (green/amber/red)
- [X] T023 [P] [US2] Create status indicator component for pending/completed states with visual differentiation
- [X] T024 [US2] Create TodoList container in frontend/src/components/tasks/TodoList.tsx with smooth scroll animation
- [X] T025 [US2] Implement responsive card layout - vertical stacking on mobile, optimized spacing on desktop
- [X] T026 [US2] Add text truncation with ellipsis for long titles/descriptions with full text on hover
- [X] T027 [US2] Handle missing optional fields (no description shows placeholder or is hidden, no due date handled gracefully)

**Checkpoint**: User Story 2 should be fully functional - todos display in clean, readable card layout across all devices

---

## Phase 5: User Story 3 - Todo Actions and Interactions (Priority: P1)

**Goal**: Intuitive action buttons for Add, Edit, Complete, Delete with clear visual feedback

**Independent Test**: Click each action button, verify: Add opens form, Edit opens pre-filled form, Complete toggles status with visual confirmation, Delete shows confirmation dialog

### Implementation for User Story 3

- [X] T028 [US3] Create Add Todo button/FAB in frontend/src/components/tasks/AddTodoButton.tsx with prominent styling and icon
- [X] T029 [P] [US3] Create TodoForm component in frontend/src/components/tasks/TodoForm.tsx for Add/Edit modal with fields: title, description, priority, due date
- [X] T030 [US3] Implement form validation with inline error messages for required fields
- [X] T031 [US3] Add action buttons to TodoItem component - Edit (Pencil icon), Complete (CheckCircle icon), Delete (Trash icon)
- [X] T032 [US3] Implement hover states showing/revealing action buttons with subtle animation
- [X] T033 [US3] Implement Complete toggle with optimistic UI update and status change animation
- [X] T034 [US3] Create DeleteConfirmDialog component in frontend/src/components/tasks/DeleteConfirmDialog.tsx with confirmation prompt
- [X] T035 [US3] Add micro-interactions on button hover (color change, subtle scale transform)
- [X] T036 [US3] Implement debounce/loading state to prevent duplicate operations on rapid clicks

**Checkpoint**: User Story 3 should be fully functional - all CRUD operations work with proper feedback

---

## Phase 6: User Story 4 - Visual Design System and Aesthetics (Priority: P2)

**Goal**: Modern, professional dark mode design matching Linear/Vercel aesthetic quality

**Independent Test**: Visual inspection of color palette, gradients, shadows, typography, and rounded corners across all components

### Implementation for User Story 4

- [X] T037 [US4] Refine color palette application - verify slate/zinc neutral tones throughout UI
- [X] T038 [US4] Apply blue/violet accent colors to all primary action buttons consistently
- [X] T039 [US4] Apply success (green), warning (amber), error (red) colors to status indicators
- [X] T040 [P] [US4] Add subtle gradient overlays to card backgrounds where appropriate
- [X] T041 [P] [US4] Add glass-morphism effects to modals and elevated surfaces (backdrop blur, transparency)
- [X] T042 [US4] Refine shadow system - ensure proper depth layering (sm, md, lg shadows)
- [X] T043 [US4] Verify typography hierarchy using Inter/system fonts with proper sizing and spacing
- [X] T044 [US4] Audit all rounded corners - rounded-lg for cards, rounded-md for buttons

**Checkpoint**: User Story 4 should be complete - UI achieves production-ready SaaS aesthetic

---

## Phase 7: User Story 5 - Loading States and Feedback (Priority: P2)

**Goal**: Clear loading indicators and feedback notifications for all user actions

**Independent Test**: Trigger operations with delays (simulated if needed), verify skeleton screens appear during load, toast notifications show for success/error states

### Implementation for User Story 5

- [X] T045 [US5] Create LoadingState component in frontend/src/components/tasks/LoadingState.tsx with skeleton cards (3-5 items)
- [X] T046 [US5] Integrate skeleton loading on initial page load before todos are fetched
- [X] T047 [US5] Add inline loading indicators on individual items during operations (spinner on complete/delete)
- [X] T048 [US5] Implement success toast notifications for: todo created, todo updated, todo completed, todo deleted
- [X] T049 [US5] Implement error toast notifications for: validation errors, network failures, server errors
- [X] T050 [US5] Configure toast stacking (multiple notifications don't overlap)
- [X] T051 [US5] Add smooth page/section transitions with fade/slide animations (300ms duration)

**Checkpoint**: User Story 5 should be complete - users receive clear feedback during all operations

---

## Phase 8: User Story 6 - Accessibility (Priority: P2)

**Goal**: Full keyboard navigation and screen reader support meeting WCAG AA standards

**Independent Test**: Navigate with keyboard only (Tab), verify all elements reachable with visible focus indicators. Use screen reader to verify ARIA labels on icon buttons

### Implementation for User Story 6

- [X] T052 [US6] Add keyboard navigation support - ensure logical Tab order through all interactive elements
- [X] T053 [US6] Add visible focus indicators (focus ring) to all focusable elements
- [X] T054 [US6] Add ARIA labels to all icon-only buttons (edit, delete, complete, logout)
- [X] T055 [US6] Add aria-live regions for dynamic content announcements (todo added, deleted, completed)
- [X] T056 [US6] Ensure proper label associations for all form fields
- [X] T057 [US6] Audit semantic HTML - use button, form, nav, main, aside where appropriate instead of generic divs
- [X] T058 [US6] Verify color contrast ratios (4.5:1 for text, 3:1 for UI components) using WebAIM or axe DevTools

**Checkpoint**: User Story 6 should be complete - application is fully accessible

---

## Phase 9: Edge Cases and Empty States

**Goal**: Handle all edge cases gracefully with appropriate UI states

- [X] T059 Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx with helpful message and "Add your first todo" CTA
- [X] T060 Handle very long usernames (truncate with ellipsis in navbar)
- [X] T061 Handle very narrow screens (320px minimum) with vertical stacking and touch-friendly targets
- [X] T062 Handle network error states with retry options
- [X] T063 Handle loading timeout gracefully (don't hide skeleton prematurely)

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [ ] T064 Run Lighthouse accessibility audit - target score ≥ 90
- [ ] T065 Run performance audit - verify < 2s page load, < 100ms interaction response
- [ ] T066 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] T067 Responsive testing across mobile, tablet, desktop breakpoints
- [ ] T068 Code cleanup - remove console.logs, ensure consistent naming, organize imports
- [ ] T069 Run through all acceptance scenarios from spec.md for final validation
- [ ] T070 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1, US2, US3 are P1 priority - implement in order
  - US4, US5, US6 are P2 priority - implement after P1 stories
- **Edge Cases (Phase 9)**: Depends on core user stories (3-5) being complete
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Uses base components from foundational
- **User Story 3 (P1)**: Depends on US2 (TodoItem component) for action button integration
- **User Story 4 (P2)**: Can start after Foundational - Visual refinement pass, no functional dependencies
- **User Story 5 (P2)**: Can start after US2 (needs TodoList for loading states integration)
- **User Story 6 (P2)**: Can start after US1-3 complete - Accessibility audit requires functional components

### Within Each User Story

- Components with [P] marker can be built in parallel
- Integrate components after parallel work completes
- Story complete before moving to next priority (P1 before P2)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- T021, T022, T023 (US2 components) can run in parallel
- T029, T034 (US3 form and dialog) can run in parallel
- T040, T041 (US4 visual effects) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all parallelizable US2 components together:
Task: "Create TodoItem component in frontend/src/components/tasks/TodoItem.tsx"
Task: "Create priority badge component"
Task: "Create status indicator component"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (design system, config)
2. Complete Phase 2: Foundational (base UI components)
3. Complete Phase 3: User Story 1 (Navbar) - **First visible milestone**
4. Complete Phase 4: User Story 2 (Todo List Display)
5. Complete Phase 5: User Story 3 (Todo Actions)
6. **STOP and VALIDATE**: Test US1-3 independently
7. Deploy/demo if ready - Core functionality complete

### Incremental Delivery

1. Setup + Foundational → Base components ready
2. Add User Story 1 → Navbar visible → Demo
3. Add User Story 2 → Todos display → Demo
4. Add User Story 3 → Full CRUD → Demo (MVP!)
5. Add User Story 4 → Polish visual design → Demo
6. Add User Story 5 → Loading/feedback → Demo
7. Add User Story 6 → Accessibility → Demo
8. Edge Cases + Polish → Production Ready

### Frontend-Design Skill Usage

Use the `/frontend-design` skill during implementation for:
- Initial component design (T006-T012, T021, T029)
- Visual refinement pass (Phase 6: US4)
- Final polish (Phase 10)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual acceptance testing per quickstart.md scenarios
- Use Frontend-Design skill for high-quality visual output
