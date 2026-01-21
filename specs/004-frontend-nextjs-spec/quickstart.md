# Quickstart Guide: Next.js Frontend Implementation

**Feature**: 004-frontend-nextjs-spec
**Date**: 2026-01-06
**Target Audience**: Developers implementing the frontend

## Prerequisites

- Node.js 18+ (for Next.js 16 compatibility)
- npm, yarn, or pnpm package manager
- Backend API running (from spec 002-fullstack-task-management)
- Git repository initialized on branch `004-frontend-nextjs-spec`

## Step 1: Initialize Next.js Project

```bash
# From repository root (monorepo)
cd frontend

# Create new Next.js 16+ project with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Or use existing setup
npm install next@latest react@latest react-dom@latest
```

**Select options**:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- src directory: No (or Yes, adjust paths accordingly)
- Import alias: `@/*`

## Step 2: Install Dependencies

```bash
# Core dependencies
npm install better-auth  # JWT authentication
npm install sonner  # Toast notifications
npm install lucide-react  # Icons
npm install @radix-ui/react-dialog  # Accessible modals
npm install react-virtual  # Virtual scrolling

# Testing dependencies (Jest + React Testing Library)
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test  # E2E testing
npm install -D ts-jest @types/jest  # Jest TypeScript support

# Type checking
npm install -D @types/node @types/react @types/react-dom

# ESLint and Prettier (if not installed)
npm install -D eslint-config-prettier prettier
```

## Step 3: Configure Environment Variables

Create `.env.local` in the `frontend` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth configuration (if needed)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-here

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_VIRTUAL_SCROLL=true
```

Create `.env.example` for documentation:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
```

## Step 4: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

## Step 5: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 6: Set Up Project Structure

Create the directory structure:

```bash
# App router structure
mkdir -p app/\(auth\)/signup
mkdir -p app/\(auth\)/signin
mkdir -p app/\(dashboard\)/dashboard

# Components
mkdir -p components/auth
mkdir -p components/task
mkdir -p components/ui
mkdir -p components/layout

# Library
mkdir -p lib/context
mkdir -p hooks

# Tests
mkdir -p tests/unit/lib
mkdir -p tests/unit/components/task
mkdir -p tests/unit/hooks
mkdir -p tests/e2e
```

## Step 7: Configure Jest

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Step 8: Configure Playwright

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Step 9: Initialize Better Auth

Create `lib/auth.ts`:

```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:8000',
})

export const { signIn, signUp, signOut, getSession } = authClient
```

## Step 10: Create API Client

Create `lib/api.ts`:

```typescript
import { getSession } from './auth'

interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    status: number
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: await this.getAuthHeaders(),
      })
      return { data: await response.json() }
    } catch (error) {
      return { error: { message: 'Failed to fetch data', status: 500 } }
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      return { data: await response.json() }
    } catch (error) {
      return { error: { message: 'Failed to create resource', status: 500 } }
    }
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      return { data: await response.json() }
    } catch (error) {
      return { error: { message: 'Failed to update resource', status: 500 } }
    }
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      return { data: await response.json() }
    } catch (error) {
      return { error: { message: 'Failed to update resource', status: 500 } }
    }
  }

  async delete(endpoint: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      })
    } catch (error) {
      throw new Error('Failed to delete resource')
    }
  }
}

export const api = new ApiClient()
```

## Step 11: Create Root Layout with Toast

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Manage your tasks efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

## Step 12: Start Development Server

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Step 13: Run Tests

```bash
# Run unit tests (Jest)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Step 14: Build for Production

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## Next Steps

After completing this quickstart:

1. **Review the spec**: Read `/specs/004-frontend-nextjs-spec/spec.md`
2. **Review the plan**: Read `/specs/004-frontend-nextjs-spec/plan.md`
3. **Review data model**: Read `/specs/004-frontend-nextjs-spec/data-model.md`
4. **Review API contracts**: Read `/specs/004-frontend-nextjs-spec/contracts/api-contracts.md`
5. **Generate tasks**: Run `/sp.tasks` to break down implementation into testable tasks
6. **Start implementing**: Follow `/sp.implement` with Red-Green-Refactor TDD cycle

## Common Issues

### Better Auth Session Not Working

```bash
# Check environment variables
cat .env.local

# Verify backend is running
curl http://localhost:8000/health

# Check CORS headers in backend
```

### Tailwind Styles Not Applying

```bash
# Rebuild Tailwind
npm run build

# Check tailwind.config.ts content paths
# Ensure they match your file structure
```

### Jest Not Finding Tests

```bash
# Check jest.config.js paths
# Ensure moduleNameMapper matches tsconfig.json paths

# Clear cache
rm -rf .jest_cache
npm test -- --clearCache
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next .jest_cache
npm install
```

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [Sonner Documentation](https://sonner.emilkowal.ski)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)

## Support

- **Spec Issues**: Review spec.md and clarification session notes
- **Plan Issues**: Review plan.md and research.md
- **API Issues**: Review contracts/api-contracts.md
- **Data Model**: Review data-model.md

## Checklist Before Starting Implementation

- [ ] Next.js 16+ project initialized
- [ ] All dependencies installed (Jest instead of Vitest)
- [ ] Environment variables configured
- [ ] Tailwind CSS configured
- [ ] TypeScript configured with strict mode
- [ ] Project structure created
- [ ] Jest configured with React Testing Library
- [ ] Playwright configured for E2E tests
- [ ] Better Auth client configured
- [ ] API client skeleton created
- [ ] Root layout with Toaster set up
- [ ] Development server runs without errors
- [ ] All specs reviewed (spec, plan, research, data-model, contracts)

When all items checked, proceed to `/sp.tasks`.
