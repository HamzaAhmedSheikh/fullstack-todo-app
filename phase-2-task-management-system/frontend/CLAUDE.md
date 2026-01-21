# Frontend Engineer Agent Guidelines

You are operating as the **Frontend Engineer agent** using Claude Code in a
Spec-Kit Plus, spec-driven development workflow.

## Stack
- Next.js 16+ (App Router)
- TypeScript 5.3+
- Tailwind CSS 4.0+
- Better Auth (JWT-based authentication)
- Sonner (toast notifications)
- Lucide React (icons)
- Radix UI (accessible modals)

## Core Rules
- Follow specifications under `/specs/**` exactly
- Do not invent requirements
- Do not modify backend code unless explicitly instructed
- Frontend changes only

## Rendering Rules
- Use **Server Components by default**
- Use **Client Components only when required** (forms, modals, auth, interactivity)
- Keep client boundaries minimal
- Add `"use client"` directive only when necessary

## Styling Rules
- Tailwind CSS only
- No inline styles
- No arbitrary pixel-perfect hardcoding
- Use spacing, color, and layout tokens consistently
- Prefer clean, professional, commercial-grade UI patterns
- Use custom color variables defined in `globals.css`:
  - `text-primary`, `bg-primary`, `bg-surface`, `text-danger`, etc.

## Component Structure
- `/src/components/ui` – reusable UI primitives (Button, Input, Modal, etc.)
- `/src/components/auth` – authentication components (SignupForm, SigninForm, etc.)
- `/src/components/tasks` – task management components (TaskList, TaskItem, etc.)
- `/src/components/layout` – layout components (Navbar, Container, etc.)
- `/src/app` – routes, layouts, pages
- `/src/lib` – API client, auth helpers, utilities
- `/src/hooks` – custom React hooks
- `/src/context` – React Context providers

## API Client Rules
- All backend calls must go through the centralized API client (`/lib/api.ts`)
- Automatically attach JWT token to every request:
  `Authorization: Bearer <token>`
- Handle 401 Unauthorized globally → clear session, redirect to Sign In
- Handle 403 Forbidden → display "Access denied" message
- Assume all endpoints require authentication
- User ID is extracted from JWT claims for API endpoint construction

## Authentication Rules
- Use Better Auth for signup, signin, and session management
- JWT is issued by Better Auth and verified by backend
- Never expose or trust cross-user data
- All task operations are scoped to the authenticated user
- Session expiration (401) triggers automatic logout and redirect

## Error Handling
- Always define loading, empty, error, and success states
- No silent failures
- User-facing feedback is required for all actions
- Use toast notifications for success/error messages (Sonner)
- Display inline validation errors for form fields

## Accessibility
- Follow WCAG AA standards
- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<form>`, `<nav>`, etc.)
- Add ARIA labels for icon-only buttons
- Implement focus indicators for keyboard navigation
- Screen reader announcements for dynamic content (aria-live)

## Performance
- Minimize client-side JavaScript
- Use Server Components for static content
- Implement optimistic UI updates for task operations
- Virtual scrolling for large lists (react-virtual, if needed)
- Debounce rapid user actions (e.g., completion toggles)

## Development Discipline
- Always read relevant specs before implementing
- Reference specs using `@specs/...`
- If something is unclear, update the spec before coding
- Specs control behavior; code follows specs
- Mark tasks as [X] in tasks.md after completion
- Create PHR (Prompt History Record) after major milestones

## File Organization
- One component per file
- File name matches component name (PascalCase)
- Index files for barrel exports (if needed)
- Group related components in subdirectories

## TypeScript
- Strict mode enabled
- All functions must have type annotations
- Use interfaces from `/lib/types.ts`
- Avoid `any` type (use `unknown` if necessary)
- Define component props interfaces explicitly

## Testing Strategy (Phase II)
- Manual testing via acceptance scenarios (from spec.md)
- Automated E2E tests deferred to Phase III
- Verify each user story independently before proceeding
- Test all edge cases documented in spec

You are building a **secure, polished, demo-ready frontend**
suitable for professional review and hackathon judging.
