# Quickstart Guide: Dark Mode Frontend UI

**Feature**: [spec.md](./spec.md)
**Branch**: `001-dark-mode-ui`
**Date**: 2026-01-14

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Modern web browser (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
- Backend API server running (see integration section)

## Environment Setup

### 1. Navigate to Frontend Directory

```bash
cd /home/hamza_ahmed/fullstack-todo-app/phase-2-task-management-system/frontend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Configure Environment Variables

Create `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: App name
NEXT_PUBLIC_APP_NAME="Todo App"
```

### 4. Verify TypeScript Configuration

Ensure `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 5. Verify Tailwind Configuration

Ensure `tailwind.config.ts` includes custom design tokens:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // We only use dark mode
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent-primary)',
        'primary-hover': 'var(--accent-hover)',
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        error: 'var(--status-error)',
      },
      borderRadius: {
        lg: '0.75rem',  // rounded-lg for cards
        md: '0.375rem', // rounded-md for buttons
      },
    },
  },
  plugins: [],
}
export default config
```

## Running the Development Server

### Start Dev Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The server will start at `http://localhost:3000`

### Build for Production

```bash
# Using npm
npm run build

# Using yarn
yarn build
```

### Start Production Server

```bash
# Using npm
npm start

# Using yarn
yarn start
```

## Backend API Integration

### Backend Server Setup

Ensure the backend API server is running:

```bash
cd /path/to/backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000/api`

### Test API Connection

1. Open `http://localhost:3000` in your browser
2. The application should redirect to sign-in if not authenticated
3. Sign in with existing credentials (auth handled by Better Auth)
4. Navigate to dashboard to see the UI

### Authentication Flow

The frontend uses Better Auth for authentication:
1. Better Auth handles sign-in/sign-up
2. JWT token is issued and stored in session
3. API client automatically attaches JWT to all requests
4. 401 responses trigger automatic logout and redirect

## Testing

### Manual Testing via Acceptance Scenarios

Run through each user story's acceptance scenarios:

**User Story 1 - Dashboard Navigation**:
1. Load dashboard → Verify navbar with logo on left
2. Verify username (not email) on right
3. Verify logout button next to username
4. Click logout → Verify redirect
5. Resize browser to mobile (<768px) → Verify responsive navbar
6. Resize to tablet (768px-1024px) → Verify spacing

**User Story 2 - Todo List Display**:
1. Load todos → Verify all fields display (title, description, status, priority, due date)
2. Verify consistent layout (all items list or all cards)
3. Scroll → Verify smooth animation
4. Mobile view → Verify vertical stacking
5. Desktop view → Verify proper spacing

**User Story 3 - Todo Actions**:
1. Click Add → Verify form/modal opens
2. Hover todo → Verify action buttons appear
3. Click Edit → Verify form pre-filled
4. Click Complete → Verify status updates
5. Click Delete → Verify confirmation dialog
6. Hover buttons → Verify micro-interactions

**User Story 4 - Visual Design**:
1. Inspect colors → Verify slate/zinc base
2. Check action buttons → Verify blue/violet accents
3. Check status → Verify green success colors
4. Inspect cards → Verify subtle gradients/glass-morphism
5. Inspect shadows → Verify proper depth
6. Check corners → Verify rounded-lg for cards, rounded-md for buttons
7. Check typography → Verify Inter/system fonts

**User Story 5 - Loading States**:
1. Trigger operation → Verify loading indicator appears
2. Complete operation → Verify success toast
3. Fail operation → Verify error toast/message
4. Reload page → Verify skeleton screens
5. Navigate sections → Verify smooth transitions

**User Story 6 - Accessibility**:
1. Tab through elements → Verify logical order
2. Check focus → Verify visible indicator
3. Inspect icon buttons → Verify ARIA labels
4. Add todo → Verify screen reader announces
5. Inspect forms → Verify label associations
6. Inspect HTML → Verify semantic elements

### Browser DevTools Validation

**Performance Testing**:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page → Verify < 2s total load time
4. Click interactive elements → Verify < 100ms response

**Accessibility Testing**:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run Lighthouse audit → Verify Accessibility score ≥ 90
4. Check contrast ratios using axe DevTools → Verify 4.5:1 text, 3:1 UI

**Keyboard Navigation Test**:
1. Press Tab to navigate → Verify all elements reachable
2. Check focus indicators → Verify visible rings
3. Press Enter/Space on buttons → Verify activation

## Using the Frontend-Design Skill

Per spec requirement, use Claude's Frontend-Design skill during implementation:

### Invoke the Skill

```bash
# When building UI components, use the skill:
Skill tool with skill: "frontend-design"
```

Or via slash command:

```
/frontend-design
```

### Skill Capabilities

The Frontend-Design skill specializes in:
- Modern UI/UX design patterns
- SaaS-style interfaces (Linear, Vercel aesthetic)
- Production-grade visuals avoiding generic AI aesthetics
- Dark mode design systems
- Component architecture recommendations

### When to Use

Use the Frontend-Design skill for:
- Initial component design and layout
- Refining visual polish and aesthetics
- Ensuring consistent design system application
- Reviewing production-ready feel

## Common Development Tasks

### Adding a New Component

1. Create file in appropriate directory:
   - `src/components/ui/` for reusable primitives
   - `src/components/layout/` for layout components
   - `src/components/tasks/` for todo-specific components

2. Use TypeScript with strict typing:
```typescript
'use client'; // If interactivity needed

interface MyComponentProps {
  // Define props here
}

export function MyComponent({ }: MyComponentProps) {
  return (
    <div className="/* Tailwind classes */">
      {/* Component content */}
    </div>
  );
}
```

### Creating a Custom Hook

1. Create file in `src/hooks/`
2. Export hook with TypeScript types:
```typescript
import { useState, useEffect } from 'react';

interface UseMyHookResult {
  // Define return type
}

export function useMyHook(): UseMyHookResult {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects here
  }, []);

  return { /* return values */ };
}
```

### Adding API Call

1. Add function to `src/lib/api.ts`:
```typescript
import { apiClient } from './api';

export async function getMyData() {
  const response = await apiClient.get('/my-endpoint');
  return response.data;
}
```

### Styling Guidelines

- Use Tailwind utility classes from design tokens
- Reference custom variables for colors: `var(--accent-primary)`
- Follow component-specific corner rules: `rounded-lg` for cards, `rounded-md` for buttons
- Add hover states with `hover:` prefix
- Use transitions for smooth effects: `transition-all duration-200`

## Troubleshooting

### Page Not Loading

1. Verify dev server is running: `http://localhost:3000`
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` is set correctly

### API Calls Failing

1. Verify backend server is running: `http://localhost:8000/api`
2. Check Network tab in DevTools for 401/403 errors
3. Verify JWT token is valid (sign out and sign in again)

### Styling Issues

1. Verify Tailwind is configured correctly
2. Check `globals.css` includes `@tailwind` directives
3. Verify custom CSS variables are defined

### TypeScript Errors

1. Ensure all imports are valid
2. Check interfaces match props/interfaces
3. Verify `tsconfig.json` has `strict: true`

## Next Steps

1. Complete all acceptance scenario tests for each user story
2. Verify all success criteria are met
3. Run accessibility audit (Lighthouse/axe DevTools)
4. Test on multiple browsers and devices
5. Review design with Frontend-Design skill
6. Proceed to `/sp.tasks` for implementation tasks (if not yet created)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Lucide React Icons](https://lucide.dev/)
- [Sonner Toast Notifications](https://sonner.emilkowal.ski/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
