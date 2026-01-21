# Research: Dark Mode Frontend UI

**Feature**: [spec.md](./spec.md)
**Date**: 2026-01-14

## Research Topics & Decisions

### 1. Design System Implementation

**Decision**: Use CSS custom properties combined with Tailwind's arbitrary values for a custom dark mode palette inspired by Linear/Vercel aesthetics.

**Rationale**:
- Custom properties allow global theming and easy updates
- Tailwind's arbitrary values provide pixel-perfect control without configuration
- Matches spec requirement for "slate/zinc neutral tones" with "blue/violet accents"
- Enables WCAG AA contrast compliance (4.5:1 for text, 3:1 for UI components)

**Implementation Approach**:
```css
:root {
  --bg-primary: #09090b;
  --bg-surface: #18181b;
  --text-primary: #e2e8f0;
  --text-muted: #a1a1aa;
  --border-default: #27272a;
  --accent-primary: #6366f1;
  --status-success: #22c55e;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
}
```

**Alternatives Considered**:
- Pure Tailwind palette (slate-950 to slate-600): Less control over exact hex values
- Hardcoded inline styles: Not maintainable, violates DRY principle

---

### 2. Component Architecture (Server vs Client Components)

**Decision**: Hybrid approach - Server Components for static content, Client Components for interactivity.

**Rationale**:
- Server Components reduce initial JavaScript bundle size
- Client Components needed for user interactions (forms, button clicks, state)
- Next.js 16 streaming provides progressive enhancement
- Optimizes time-to-interactive while maintaining interactivity

**Component Classification**:
- **Server Components**: `navbar.tsx`, `empty-state.tsx`, `page.tsx` (partial)
- **Client Components**: `todo-list.tsx`, `todo-item.tsx`, `todo-form.tsx`, `toast.tsx`

**Alternatives Considered**:
- All Client Components: Simpler but larger bundle, slower initial load
- All Server Components: No interactivity possible, invalidates spec requirements

---

### 3. API Integration Pattern

**Decision**: Centralized API client with axios interceptors for automatic JWT token handling and global error management.

**Rationale**:
- Single source of truth for all backend API calls
- Automatic token attachment eliminates manual boilerplate
- Global 401/403 handling for session management
- Consistent error messages and retry logic

**Implementation Pattern**:
```typescript
// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor: Attach JWT
apiClient.interceptors.request.use((config) => {
  const token = getTokenFromSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401/403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession();
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
```

**Alternatives Considered**:
- Fetch API: More verbose, no built-in interceptors
- SWR/React Query: Overkill for 1-100 items scale, adds complexity

---

### 4. Animation Implementation Strategy

**Decision**: CSS transitions for micro-interactions, native smooth scrolling for scroll animations, minimal Framer Motion for page transitions.

**Rationale**:
- CSS transitions are hardware-accelerated and lightweight
- Native `scroll-behavior: smooth` covers scroll animations
- Framer Motion only for complex page transitions if needed
- Meets 300ms animation target with minimal bundle impact

**Implementation Guidelines**:
```css
/* Hover states: 200ms transition */
.button {
  transition: background-color 200ms ease, transform 200ms ease;
}
.button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Page transitions: 300ms (Framer Motion if needed) */
.page-transition {
  animation: fadeIn 300ms ease;
}
```

**Alternatives Considered**:
- Pure Framer Motion: Heavier bundle (~60kb), overkill for simple hovers
- Pure CSS animations: Limited effects for complex transitions

---

### 5. Accessibility Testing Approach

**Decision**: Manual validation using browser DevTools accessibility audit and keyboard navigation testing.

**Rationale**:
- No test infrastructure required (spec allows automated E2E in Phase III)
- Chrome DevTools Lighthouse provides comprehensive accessibility audit
- Keyboard navigation test validates all interactive elements
- NVDA screen reader testing for dynamic content announcements

**Testing Checklist**:
1. Keyboard navigation: Tab through all interactive elements
2. Focus indicators: Verify visible focus rings
3. ARIA labels: Inspect icon-only buttons with DevTools
4. Color contrast: WebAIM contrast checker or axe DevTools
5. Screen reader: Test dynamic content with NVDA or VoiceOver

**Alternatives Considered**:
- Playwright/Puppeteer: Overkill for this phase, adds test infrastructure debt
- axe-core automated testing: Valuable but manual approach sufficient for now

---

## Technology Stack Summary

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React framework with App Router | 16+ |
| React | UI library | 19+ |
| TypeScript | Type safety | 5.3+ |
| Tailwind CSS | Utility-first styling | 4.0+ |
| Lucide React | Icon library | latest |
| Sonner | Toast notifications | latest |
| Axios | HTTP client | latest |

## Design Tokens Reference

See [plan.md](./plan.md#design-system-tokens) for complete color palette, spacing, and shadow tokens.

## Performance Benchmarks

See [plan.md](./plan.md#performance-targets) for measurable performance targets and validation methods.
