# Implementation Plan: Dark Mode Frontend UI

**Branch**: `001-dark-mode-ui` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dark-mode-ui/spec.md`

## Summary

Build a modern, dark-mode frontend UI for a Todo application with clean UX and SaaS-style aesthetics. The implementation focuses on design-first approach using Claude's Frontend-Design skill, Next.js framework, Tailwind CSS styling, and production-ready UI components including navbar, todo list/cards, action buttons, and empty states with smooth animations and full responsiveness.

## Technical Context

**Language/Version**: TypeScript 5.3+, JavaScript (ES2022+)
**Primary Dependencies**: Next.js 16+, React 19+, Tailwind CSS 4.0+, Lucide React (icons), Sonner (toast notifications)
**Storage**: Client-side state management (React hooks), data from backend REST API
**Testing**: Manual testing via acceptance scenarios (automated E2E deferred to Phase III)
**Target Platform**: Modern web browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
**Project Type**: Web application (frontend only - consumes backend API)
**Performance Goals**: < 2s page load, < 100ms interaction response, < 300ms animation duration
**Constraints**: WCAG AA accessibility (4.5:1 text contrast), 320px minimum viewport width, 1-100 todos per user (no pagination)
**Scale/Scope**: 6 user stories, 30 functional requirements, 13 success criteria, single-page dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Accuracy & Verification: PASS - All features aligned with spec, APIs will be verified through manual acceptance testing
- Specification First: PASS - Complete specification exists at [spec.md](./spec.md), all implementation will align with approved spec
- Clean Code: PASS - TypeScript strict mode, descriptive naming, organized imports (standard, third-party, local), modular component structure
- Test-First Development: PASS - Manual acceptance testing defined for each user story, automated E2E deferred per Phase III requirement
- Evolutionary Architecture: PASS - Component-based architecture with clear interfaces, YAGNI principles followed (no premature virtualization/pagination), state management swappable
- User Experience First: PASS - Dark mode only, clear hierarchy, immediate feedback, explicit validation, accessible navigation

## Project Structure

### Documentation (this feature)

```text
specs/001-dark-mode-ui/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── api-contracts.md # API contracts for backend integration
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with theme provider
│   │   ├── page.tsx             # Main dashboard page
│   │   └── globals.css           # Tailwind directives and custom variables
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   └── toast.tsx
│   │   ├── layout/
│   │   │   └── navbar.tsx       # Top navigation with logo, username, logout
│   │   └── tasks/
│   │       ├── todo-list.tsx      # Main list container
│   │       ├── todo-item.tsx      # Individual todo card
│   │       ├── todo-form.tsx      # Add/edit modal
│   │       ├── empty-state.tsx     # Empty list state with CTA
│   │       └── loading-state.tsx  # Skeleton screen for loading
│   ├── lib/
│   │   ├── api.ts                # Centralized API client
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── utils.ts             # Helper functions (debounce, truncate)
│   └── hooks/
│       ├── use-todos.ts          # Custom hook for todo operations
│       └── use-toast.ts          # Custom hook for toast notifications
├── public/
│   └── favicon.ico
└── package.json
```

**Structure Decision**: Web application structure with frontend-only scope. This feature implements the UI layer that consumes the existing backend REST API. The structure follows Next.js 16 App Router conventions with component organization by domain (ui, layout, tasks) and separation of concerns (components, lib, hooks). Real directories captured from existing frontend repository at `/home/hamza_ahmed/fullstack-todo-app/phase-2-task-management-system/frontend`.

## Complexity Tracking

> No constitution violations - this section remains empty as all checks pass

---

## Phase 0: Outline & Research

### Unknowns Identified

1. **Design System Implementation**: How to translate "slate/zinc neutral tones, blue/violet accents, subtle gradients" into Tailwind CSS variables and utilities
2. **Component Architecture**: Balance between Server vs Client Components for optimal performance while maintaining interactivity
3. **API Integration Pattern**: Authentication token handling and error management strategy for backend communication
4. **Animation Implementation**: Best practices for smooth scrolling, micro-interactions, and transitions in Next.js without performance overhead
5. **Accessibility Testing Approach**: Manual validation methods for ARIA labels, keyboard navigation, and screen reader support

### Research Findings

| Topic | Decision | Rationale | Alternatives Considered |
|--------|-----------|------------|--------------------------|
| **Dark Mode Color Palette** | Use CSS custom properties with Tailwind's arbitrary values for slate/zinc base (#09090b background, #18181b surface, #e2e8f0 text), blue/violet accents (#6366f1 primary), green success (#22c55e), amber warning (#f59e0b) | Matches Linear/Vercel aesthetic, meets WCAG AA contrast requirements | Pure Tailwind palette (less control), hardcoded values (less maintainable) |
| **Component Architecture** | Server Components for static content (navbar skeleton, empty state), Client Components for interactivity (todo list with actions, forms, toasts) | Optimizes initial load, leverages Next.js 16 streaming, reduces client-side JS | All Client Components (simpler but slower), All Server Components (no interactivity) |
| **API Integration** | Centralized API client with axios interceptors for automatic JWT token attachment, global 401/403 handling, debounce wrapper for rapid clicks | Single source of truth for all backend calls, consistent error handling, prevents duplicate operations | Fetch API (more verbose), SWR/React Query (overkill for 1-100 items) |
| **Animation Strategy** | CSS transitions for hover states (200ms), Framer Motion for page transitions (300ms), native smooth scrolling for scroll animations | Performance-optimized, minimal bundle impact, meets 300ms animation target | Pure Framer Motion (heavier), pure CSS (limited effects) |
| **Accessibility Testing** | Manual keyboard navigation test, browser DevTools accessibility audit, NVDA screen reader testing for dynamic content | Meets spec requirement without test infrastructure, validates all WCAG AA criteria | Playwright/Puppeteer (Phase III, overkill now) |

### Technology Stack

**Core Framework**: Next.js 16+ with App Router
- Server Components by default for optimal performance
- Client Components only when state/interactivity required
- Streaming for progressive enhancement

**Styling**: Tailwind CSS 4.0+ with custom design tokens
- CSS custom properties for theme variables
- Arbitrary values for precise spacing and colors
- Dark mode only (no light mode support per spec)

**Icons**: Lucide React
- Lightweight tree-shakeable icons
- Consistent visual language
- Accessible by default

**Notifications**: Sonner
- Toast notifications for success/error feedback
- Non-intrusive, dismissible
- Supports stacking for simultaneous notifications

**Type Safety**: TypeScript 5.3+ with strict mode
- Interfaces for all data structures
- Type-safe API calls
- Prevents runtime errors

### Design System Tokens

```css
/* Custom variables for dark mode palette */
--bg-primary: #09090b;      /* Deepest background */
--bg-surface: #18181b;     /* Card/surface backgrounds */
--text-primary: #e2e8f0;    /* Main text */
--text-muted: #a1a1aa;       /* Secondary text */
--border-default: #27272a;   /* Subtle borders */

--accent-primary: #6366f1;   /* Blue/violet accent */
--accent-hover: #818cf8;      /* Lighter accent for hover */

--status-success: #22c55e;    /* Green for completed */
--status-warning: #f59e0b;    /* Amber for high priority/errors */
--status-error: #ef4444;      /* Red for delete/error */

--shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|--------------|
| Page Load (TTC) | < 2 seconds | Network tab DevTools, initial render |
| Interaction Response | < 100ms | Performance API, first input delay |
| Animation Duration | < 300ms | CSS transition time properties |
| Touch Targets | ≥ 44x44px | DevTools device toolbar measurement |
| Contrast Ratio | 4.5:1 text, 3:1 UI | WebAIM contrast checker, axe DevTools |

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions, field specifications, validation rules, and state transitions.

### API Contracts

See [contracts/api-contracts.md](./contracts/api-contracts.md) for REST API endpoint specifications including request/response formats, authentication requirements, and error handling.

### Quickstart Guide

See [quickstart.md](./quickstart.md) for development environment setup, local running instructions, and testing procedures.

### Agent Context Update

Agent context has been updated to include:
- TypeScript 5.3+ with strict mode
- Next.js 16+ App Router architecture
- Tailwind CSS 4.0+ with custom design tokens
- Lucide React for icons
- Sonner for toast notifications
- Dark mode only (no light mode toggle)

See `.specify/memory/agent-context-claude.md` for complete context file.

### Re-evaluation: Constitution Check (Post-Design)

*GATE: Must pass before Phase 2 task generation.*

- Accuracy & Verification: PASS - Data model and contracts clearly defined, all features testable
- Specification First: PASS - All design decisions trace back to spec requirements
- Clean Code: PASS - Type-safe interfaces, modular components, organized imports
- Test-First Development: PASS - Manual acceptance scenarios defined for each user story
- Evolutionary Architecture: PASS - Component abstractions support future features, no premature optimization
- User Experience First: PASS - Design tokens ensure consistency, accessibility baked in, feedback mechanisms clear

**All gates passed. Ready for Phase 2: `/sp.tasks`**
