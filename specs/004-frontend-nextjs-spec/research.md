# Research: Next.js Frontend for Full-Stack Task Management

**Feature**: 004-frontend-nextjs-spec
**Date**: 2026-01-06
**Status**: Complete

## Overview

This document consolidates research findings and technology decisions for implementing the Next.js frontend for the full-stack task management application. All technology choices have been validated against the feature specification and production requirements.

## Technology Stack Decisions

### State Management: React Context + Hooks

**Decision**: Use React Context API with custom hooks for global state management.

**Rationale**:
- Native to React ecosystem, no additional dependencies
- Well-suited for application complexity (single user, simple CRUD operations)
- Aligns with Next.js 16+ best practices
- Minimal bundle size impact
- Sufficient scalability for this application's needs
- Can be upgraded to Redux/Zustand in future if needed

**Alternatives Considered**:
- **Zustand**: Lightweight and popular, but adds unnecessary complexity for this use case
- **Redux Toolkit**: Overkill for single-user CRUD application; introduces boilerplate and learning curve
- **Server Components only**: Not sufficient for interactive state (user session, optimistic updates)

**Implementation Pattern**:
```typescript
// lib/context/AuthContext.tsx - User session state
// lib/context/TaskContext.tsx - Task list state
// hooks/useAuth.ts - Auth state consumer
// hooks/useTasks.ts - Task state consumer
```

### Toast Notifications: Sonner

**Decision**: Use Sonner for toast notifications.

**Rationale**:
- Modern, actively maintained library
- Built for React 19+ and Next.js 16+ compatibility
- Supports Server Components
- Smaller bundle size than react-hot-toast
- Beautiful, accessible defaults
- Easy integration with TypeScript
- Provides auto-dismiss functionality out of the box

**Alternatives Considered**:
- **react-hot-toast**: Popular but older, larger bundle, not optimized for React 19
- **Custom implementation**: Would require significant effort to achieve same level of accessibility and UX

**Integration**:
```typescript
// components/ui/Toast.tsx - Sonner wrapper with custom styling
// Will use <Toaster /> in root layout
```

### Icon Library: Lucide React

**Decision**: Use Lucide React for UI icons.

**Rationale**:
- Modern, tree-shakeable library
- De facto standard for React/Next.js applications
- Consistent with shadcn/ui ecosystem
- Excellent TypeScript support
- Comprehensive icon set (1,000+ icons)
- Customizable with props (size, color, stroke width)
- Actively maintained

**Alternatives Considered**:
- **Heroicons**: Good alternative but smaller set, less consistent with modern React patterns
- **react-icons**: Too large, not tree-shakeable, leads to bundle bloat

**Usage Pattern**:
```typescript
// Direct imports for tree-shaking
import { Check, Trash2, Pencil, Plus, LogOut } from 'lucide-react'
```

### Modals: Radix UI Dialog

**Decision**: Use Radix UI Dialog for create/edit modals and confirmation dialogs.

**Rationale**:
- Fully accessible out of the box (keyboard navigation, focus trapping, screen reader support)
- Unstyled components allow full Tailwind CSS customization
- Industry-standard for accessible UI primitives
- React 19+ compatible
- Proper event handling (backdrop click, Escape key)
- TypeScript-first with excellent type safety

**Alternatives Considered**:
- **Headless UI Dialog**: Good alternative, but Radix has better accessibility patterns
- **Custom implementation with React Portal**: Would require significant effort to achieve same accessibility

**Integration**:
```typescript
// components/ui/Modal.tsx - Radix Dialog wrapper with Tailwind styling
// components/ui/ConfirmationDialog.tsx - Specialized for destructive actions
```

### Virtual Scrolling: react-virtual

**Decision**: Use react-virtual for task list performance with large datasets.

**Rationale**:
- Handles 1000+ tasks smoothly by rendering only visible items
- Minimal bundle size (less than 3KB)
- TypeScript support
- Works well with React 19
- Handles dynamic item heights
- Better DX than react-window

**Alternatives Considered**:
- **react-window**: Older, slightly more complex API
- **Simple pagination**: Doesn't meet requirement for viewing all tasks without pagination
- **Render all items**: Would cause performance issues with 100+ tasks

**Implementation**:
```typescript
// components/task/TaskList.tsx - Uses useVirtualizer from react-virtual
```

## Best Practices Research

### Next.js 16+ App Router Patterns

**Route Organization**:
- Use route groups `(auth)` and `(dashboard)` for logical separation without affecting URL structure
- Auth routes: `/signup`, `/signin`
- Protected routes: `/dashboard`
- Layout nesting for shared UI (Header, Navigation)

**Server vs Client Components**:
- Use Server Components by default for static content
- Use Client Components (`"use client"`) only when interactivity needed:
  - Forms (SignupForm, SigninForm)
  - Modals (CreateTaskModal, EditTaskModal)
  - Interactive lists (TaskList with virtual scrolling)
  - Context providers

**Data Fetching**:
- Use React Context + Client Components for client-side state
- Fetch data on Client Component mount with hooks
- Optimize with proper caching (avoid unnecessary re-fetches)

### Better Auth JWT Integration

**Session Management**:
- Use HTTP-only cookies as primary storage (more secure than localStorage)
- Fallback to localStorage only if cookies unavailable
- Session persistence: 7 days default
- Automatic token attachment to all API requests

**Authentication Flow**:
```typescript
// lib/auth.ts - Better Auth client configuration
// Context provider wraps app
// Protected route middleware redirects to /signin if no session
```

### Tailwind CSS Styling

**Design System**:
- Primary color: Brand blue/indigo
- Surface colors: White/gray-50 for backgrounds
- Danger color: Red for destructive actions
- Success color: Green for confirmations
- Muted color: Gray-400 for secondary text
- Consistent spacing: 4px base unit (Tailwind default)

**Responsive Design**:
- Mobile: ≥320px (single column, stacked layouts)
- Tablet: ≥768px (adjusted layouts)
- Desktop: ≥1024px (full layout)
- Test with Tailwind responsive classes

**Accessibility**:
- WCAG AA contrast: 4.5:1 for text
- Semantic HTML: proper headings, landmarks, form labels
- ARIA labels: for icon-only buttons
- Focus indicators: visible for keyboard navigation
- Screen reader: announcements for dynamic content

### API Client Architecture

**Centralized API Module** (`lib/api.ts`):
- Singleton pattern for axios or fetch wrapper
- Automatic JWT attachment via Better Auth session
- TypeScript interfaces for request/response types
- Consistent error handling
- Retry logic for transient failures
- Type-safe error responses

**API Contract**:
```typescript
// GET /api/{user_id}/tasks - List all tasks
// POST /api/{user_id}/tasks - Create task
// PUT /api/{user_id}/tasks/{task_id} - Update task
// DELETE /api/{user_id}/tasks/{task_id} - Delete task
// PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion
```

### Testing Strategy

**Unit Tests** (Jest + React Testing Library):
- Test utility functions in `/lib`
- Test custom hooks
- Test isolated components
- Mock API responses
- Use `jest-environment-jsdom` for DOM testing
- Use `next/jest` for Next.js integration

**E2E Tests** (Playwright):
- Full user flows (signup → create task → complete task)
- Authentication flows
- Cross-browser testing
- Responsive design validation

**Test Coverage Goals**:
- Unit tests: 80%+ code coverage for critical paths
- E2E tests: All user acceptance scenarios from spec

### Performance Optimization

**Rendering Performance**:
- Virtual scrolling for large lists (1000+ tasks)
- Loading skeletons for perceived performance
- Debounce rapid API requests (task completion toggles)
- Optimistic UI updates for instant feedback

**Bundle Optimization**:
- Tree-shake libraries (Lucide, Radix)
- Code splitting by route
- Dynamic imports for non-critical components

**Load Performance**:
- First Contentful Paint (FCP): < 2s on 3G
- Time to Interactive (TTI): < 5s
- API response time: < 200ms

### Error Handling Strategy

**User-Friendly Errors**:
- Never expose raw API errors or stack traces
- Clear, actionable messages
- Retry mechanisms for transient failures
- Toast notifications for feedback

**Error Scenarios**:
- 401 Unauthorized: Clear session, redirect to signin
- 403 Forbidden: Log out user, display "Access denied"
- 404 Not Found: Display "Task no longer exists"
- Network errors: "Unable to connect to server. Please check your internet connection"
- Timeouts: "Request timed out. Please try again"

### Data Validation

**Client-Side Validation**:
- Email format: Standard regex before submission
- Password: Min 8 characters
- Task title: Required, max 200 chars, trim whitespace
- Task description: Optional, max 500 chars, trim whitespace
- Character counters for title/description inputs

**Input Sanitization**:
- Trim whitespace before submission
- Don't sanitize emojis/special chars (preserve user intent)
- Backend responsible for XSS protection

## Integration Patterns

### Better Auth + Next.js Integration

**Configuration**:
```typescript
// Better Auth server: Handles JWT signing/verification
// Better Auth client: Stores session, provides session hooks
// Frontend uses: getSession() to get JWT claims (user_id, email)
```

**Session Flow**:
1. User signs up → Better Auth creates user, issues JWT
2. JWT stored in HTTP-only cookie
3. Each API request includes JWT via Authorization header
4. Frontend extracts user_id from JWT for API endpoints
5. Expired JWT → 401 response → redirect to signin

### React Context Pattern

**AuthContext**:
- State: user (from JWT), loading, error
- Actions: signup, signin, logout, refreshSession
- Provider wraps app in root layout

**TaskContext**:
- State: tasks array, loading, error
- Actions: fetchTasks, createTask, updateTask, deleteTask, toggleTask
- Provider wraps dashboard routes

### Component Architecture

**Atomic Design Pattern**:
- **Atoms**: Button, Input, Textarea, Spinner, Toast
- **Organisms**: TaskItem, TaskCard, CreateTaskModal, EditTaskModal
- **Templates**: TaskList, SignupForm, SigninForm
- **Pages**: Signup, Signin, Dashboard

**Feature-Based Organization**:
- `/components/auth/` - Authentication components
- `/components/task/` - Task management components
- `/components/ui/` - Reusable UI primitives
- `/components/layout/` - Layout components

## Security Considerations

**JWT Handling**:
- HTTP-only cookies as primary storage (XSS protection)
- Secure flag on cookies in production (HTTPS only)
- Better Auth handles token refresh automatically
- No sensitive data in localStorage

**XSS Protection**:
- React escapes content by default
- Avoid `dangerouslySetInnerHTML`
- Sanitize only if absolutely necessary (prefer backend validation)

**CSRF Protection**:
- Better Auth provides CSRF tokens
- Include in API requests as configured

**Content Security Policy**:
- Configure CSP headers in production
- Restrict script sources to trusted domains

## Browser Compatibility

**Target Browsers**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Progressive Enhancement**:
- Graceful degradation if JavaScript disabled: "JavaScript is required"
- Feature detection for modern APIs
- Polyfills only if absolutely necessary (avoid bundle bloat)

## Accessibility Compliance

**WCAG AA Standards**:
- Color contrast: 4.5:1 minimum for text
- Keyboard navigation: All interactive elements accessible via Tab/Enter/Escape
- Screen reader support: ARIA labels, landmarks, announcements
- Focus management: Visible focus indicators, logical tab order
- Semantic HTML: Proper heading hierarchy, form labels, button text

**Testing**:
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)
- Automated accessibility tools (axe DevTools, Lighthouse)

## Future Extensibility

**Phase II Limitations** (documented in spec):
- No offline mode (informative banner only)
- No real-time sync
- No multi-user collaboration
- No task categorization/tags
- No search/filtering

**Evolution Path**:
- State management: Context can be upgraded to Redux/Zustand
- Offline support: Service Workers + IndexedDB (PWA)
- Real-time: WebSockets or Server-Sent Events
- Advanced features: Add without breaking existing structure

## Conclusion

All technology decisions are production-ready and aligned with:
- Next.js 16+ best practices
- Better Auth JWT integration patterns
- Modern React ecosystem standards
- Accessibility requirements (WCAG AA)
- Performance targets (1000+ tasks with virtual scrolling)
- Security best practices (HTTP-only cookies, XSS protection)

No blockers or unknowns remaining. Ready for Phase 1: Design & Contracts.
