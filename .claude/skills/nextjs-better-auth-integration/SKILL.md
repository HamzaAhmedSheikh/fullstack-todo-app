---
name: nextjs-better-auth-integration
description: Build Next.js 16+ frontends with Better Auth JWT integration for full-stack Todo applications. Use when implementing authenticated UI, integrating with FastAPI backends, building spec-driven frontend features, or setting up JWT-secured API clients. Handles Server/Client Components, session management, and user-scoped data display.
---

# Next.js Frontend with Better Auth JWT Integration

Expert guidance for building Next.js 16+ App Router frontends with JWT-based authentication, integrating with FastAPI backends through Better Auth.

## Core Architectural Principles

### Spec-Driven Agentic Workflow
- **No Manual Coding**: All implementation follows the spec → plan → tasks → implement workflow
- **Spec-First**: Always read relevant specs from `/specs/**` before implementation
- **Reference Specs**: Use `@specs/...` paths in all planning
- **Follow Project Rules**: Respect all instructions in `/frontend/CLAUDE.md` and `/CLAUDE.md`

### Next.js 16+ App Router Architecture
- **Server Components by Default**: Use Server Components for static content, layouts, and data fetching
- **Client Components When Needed**: Use `'use client'` directive only for interactivity, state, or browser APIs
- **TypeScript Strict**: All code must be fully typed
- **Tailwind CSS**: Use Tailwind for all styling, follow design system if specified

### Authentication Flow
- **Better Auth**: Handles user signup/signin and JWT issuance
- **JWT Storage**: Store session tokens securely (cookies or secure storage)
- **Token Attachment**: Include `Authorization: Bearer <token>` on ALL API requests
- **401 Handling**: Redirect to login on unauthorized responses
- **Session State**: Manage authentication state globally (Context or state management)

### Security & Data Isolation
- **User-Scoped Data**: Display only the authenticated user's data
- **Frontend Validation**: Validate user ownership before mutations (trust but verify)
- **Backend Trust**: Rely on backend for final authorization
- **No User ID in URLs**: Never expose or accept user IDs from URL parameters

## Implementation Pattern

### Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Landing/home page
│   ├── (auth)/
│   │   ├── login/page.tsx   # Login page
│   │   └── signup/page.tsx  # Signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Protected layout
│   │   └── tasks/page.tsx   # Tasks list page
│   └── api/
│       └── auth/[...all]/route.ts  # Better Auth API route
├── lib/
│   ├── api.ts               # Centralized API client
│   ├── auth.ts              # Better Auth configuration
│   └── hooks/
│       └── useAuth.ts       # Auth state hook
├── components/
│   ├── TaskList.tsx         # Task display component
│   ├── TaskForm.tsx         # Task creation/edit form
│   └── ProtectedRoute.tsx   # Route protection wrapper
├── .env.local               # BETTER_AUTH_SECRET
└── package.json
```

### Better Auth Setup

**Install Better Auth:**
```bash
npm install better-auth
# or
pnpm add better-auth
```

**Configure Better Auth** (`lib/auth.ts`):
```typescript
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // Use same database as backend or separate auth DB
    url: process.env.DATABASE_URL,
    type: "postgres"
  },
  secret: process.env.BETTER_AUTH_SECRET!, // Must match backend
  jwt: {
    enabled: true,
    algorithm: "HS256",
    expiresIn: "7d"
  },
  emailAndPassword: {
    enabled: true
  }
})

export type Session = typeof auth.$Infer.Session
```

**Environment Variables** (`.env.local`):
```bash
BETTER_AUTH_SECRET=your-secret-min-32-characters-cryptographically-random
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Create Auth API Route** (`app/api/auth/[...all]/route.ts`):
```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### Authentication Context

**Create Auth Provider** (`lib/hooks/useAuth.tsx`):
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@/lib/auth'

type AuthContextType = {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) throw new Error('Sign in failed')

    const data = await res.json()
    setSession(data.session)
  }

  const signUp = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    if (!res.ok) throw new Error('Sign up failed')

    const data = await res.json()
    setSession(data.session)
  }

  const signOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    setSession(null)
  }

  const getToken = () => {
    // Extract JWT from session
    return session?.accessToken || null
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

**Wrap App with Provider** (`app/layout.tsx`):
```typescript
import { AuthProvider } from '@/lib/hooks/useAuth'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### API Client with JWT

**Centralized API Client** (`lib/api.ts`):
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class ApiClient {
  private getToken(): string | null {
    // Get token from session storage, cookie, or auth context
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Attach JWT token to all requests
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  }

  // Tasks API
  async getTasks() {
    return this.request<Task[]>('/api/tasks')
  }

  async createTask(data: { title: string; description?: string }) {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: number, data: Partial<Task>) {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: number) {
    return this.request<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  async toggleTask(id: number) {
    return this.request<Task>(`/api/tasks/${id}/toggle`, {
      method: 'PATCH',
    })
  }
}

export const apiClient = new ApiClient()

// Type definitions
export type Task = {
  id: number
  title: string
  description?: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}
```

### Protected Routes

**Protected Route Wrapper** (`components/ProtectedRoute.tsx`):
```typescript
'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login')
    }
  }, [session, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

**Protected Dashboard Layout** (`app/(dashboard)/layout.tsx`):
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          {/* Navigation */}
        </nav>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
```

### Component Patterns

**Task List Component** (`components/TaskList.tsx`):
```typescript
'use client'

import { useEffect, useState } from 'react'
import { apiClient, Task } from '@/lib/api'

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await apiClient.toggleTask(id)
      // Optimistic update
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ))
    } catch (err) {
      console.error('Failed to toggle task:', err)
      // Revert on error
      loadTasks()
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.deleteTask(id)
      setTasks(tasks.filter(task => task.id !== id))
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  if (loading) return <div>Loading tasks...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Create your first task!</p>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id)}
              className="w-5 h-5"
            />
            <span className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.title}
            </span>
            <button
              onClick={() => handleDelete(task.id)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  )
}
```

**Task Form Component** (`components/TaskForm.tsx`):
```typescript
'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

type TaskFormProps = {
  onSuccess?: () => void
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    try {
      setLoading(true)
      await apiClient.createTask({ title, description })
      setTitle('')
      setDescription('')
      onSuccess?.()
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}
```

### Login/Signup Pages

**Login Page** (`app/(auth)/login/page.tsx`):
```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
      router.push('/tasks')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

## Spec-Driven Workflow Integration

### Reading Specs

**Before ANY implementation:**
```typescript
// 1. Read the relevant spec
// Example: Read /specs/002-fullstack-task-management/spec.md

// 2. Understand requirements
// - What features are needed?
// - What are the API contracts?
// - What are the UI requirements?

// 3. Reference spec in planning
// Use @specs/002-fullstack-task-management/spec.md in todos and plans
```

### Following Project Instructions

**Check `/frontend/CLAUDE.md`:**
- Project-specific conventions
- Component patterns
- Styling guidelines
- Testing requirements

**Check `/CLAUDE.md`:**
- SpecKit Plus workflow
- PHR creation rules
- ADR requirements
- Development standards

### Workflow Steps

1. **Read Spec** → Understand requirements
2. **Generate Plan** → Architecture and approach
3. **Break into Tasks** → Actionable implementation steps
4. **Implement** → Build features following spec exactly
5. **Create PHR** → Document the work done

## API Integration Patterns

### Contract Adherence

**ALWAYS match backend API exactly:**
```typescript
// Backend defines: GET /api/tasks
// Frontend implements: apiClient.getTasks()

// Backend defines: POST /api/tasks with { title, description }
// Frontend sends: { title, description } - nothing more, nothing less
```

### Error Handling

```typescript
try {
  const tasks = await apiClient.getTasks()
  setTasks(tasks)
} catch (error) {
  if (error.message === 'Unauthorized') {
    // Already handled by redirect in apiClient
    return
  }
  setError('Failed to load tasks. Please try again.')
}
```

### Optimistic Updates

```typescript
const handleToggle = async (id: number) => {
  // Update UI immediately
  setTasks(tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  ))

  try {
    // Sync with backend
    await apiClient.toggleTask(id)
  } catch (err) {
    // Revert on error
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }
}
```

## Security Best Practices

### JWT Token Management

**DO:**
- Store tokens securely (httpOnly cookies preferred)
- Clear tokens on logout
- Refresh tokens before expiry
- Validate token presence before API calls

**DON'T:**
- Store tokens in localStorage if avoidable (XSS risk)
- Log tokens to console
- Send tokens in URL parameters
- Expose tokens in client-side code

### Data Validation

```typescript
// Validate on client AND server
const validateTask = (title: string) => {
  if (!title.trim()) {
    throw new Error('Title is required')
  }
  if (title.length > 200) {
    throw new Error('Title too long')
  }
}
```

### Route Protection

**NEVER skip protection:**
```typescript
// WRONG: Unprotected dashboard
export default function TasksPage() {
  return <TaskList />
}

// CORRECT: Protected with layout
// app/(dashboard)/layout.tsx wraps with ProtectedRoute
```

## Monorepo Integration

### Folder Structure Awareness

```
fullstack-todo-app/
├── frontend/          # Your domain
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/           # Reference only, don't modify
│   ├── main.py
│   └── models.py
└── specs/             # Source of truth
    ├── 001-cli-todo-app/
    ├── 002-fullstack-task-management/
    └── 003-jwt-verification-api-skill/
```

### Cross-Layer Coordination

**Read backend specs but don't modify backend code:**
```typescript
// Read /specs/002-fullstack-task-management/plan.md
// Understand backend API contracts
// Implement frontend to match exactly
// Never change backend unless explicitly instructed
```

## Common Patterns

### Loading States

```typescript
const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

// In component
{state === 'loading' && <Spinner />}
{state === 'error' && <ErrorMessage />}
{state === 'success' && <TaskList tasks={tasks} />}
```

### Form Validation

```typescript
const [errors, setErrors] = useState<Record<string, string>>({})

const validate = () => {
  const newErrors: Record<string, string> = {}

  if (!title.trim()) newErrors.title = 'Title is required'
  if (title.length > 200) newErrors.title = 'Title too long'

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validate()) return
  // Submit...
}
```

### Pagination

```typescript
const [page, setPage] = useState(0)
const [limit] = useState(20)

const loadTasks = async () => {
  const tasks = await apiClient.getTasks({ skip: page * limit, limit })
  setTasks(tasks)
}
```

## Testing Strategy

### Component Testing

```typescript
// __tests__/TaskList.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { TaskList } from '@/components/TaskList'

jest.mock('@/lib/api', () => ({
  apiClient: {
    getTasks: jest.fn(() => Promise.resolve([
      { id: 1, title: 'Test Task', completed: false, user_id: '123' }
    ]))
  }
}))

test('renders task list', async () => {
  render(<TaskList />)

  await waitFor(() => {
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })
})
```

### Integration Testing

```typescript
// Test full auth + API flow
test('authenticated user can create task', async () => {
  // Mock auth
  // Mock API
  // Test flow
})
```

## Performance Optimization

### Server Components

```typescript
// Use Server Components for static content
// app/tasks/page.tsx
export default async function TasksPage() {
  // This runs on server
  return (
    <div>
      <h1>Tasks</h1>
      <TaskList /> {/* Client Component */}
    </div>
  )
}
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic'

const TaskForm = dynamic(() => import('@/components/TaskForm'), {
  loading: () => <p>Loading...</p>
})
```

### Caching

```typescript
// Use SWR or React Query for caching
import useSWR from 'swr'

function useTasks() {
  const { data, error, mutate } = useSWR('/api/tasks', apiClient.getTasks)

  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  }
}
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] BETTER_AUTH_SECRET matches backend
- [ ] API_URL points to production backend
- [ ] HTTPS enabled
- [ ] CORS configured on backend
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] 401 redirects to login
- [ ] Tokens stored securely
- [ ] All routes protected appropriately
- [ ] No hardcoded secrets in code
- [ ] TypeScript strict mode enabled
- [ ] Build passes without errors
- [ ] Responsive design tested

## Debugging Common Issues

### Issue: "Unauthorized" on every request
**Cause**: Token not attached or invalid
**Solution**:
1. Check token is stored after login
2. Verify `apiClient.getToken()` returns token
3. Confirm `Authorization` header is set
4. Check token format: `Bearer <token>`

### Issue: Token expires immediately
**Cause**: Clock skew or wrong expiration
**Solution**:
1. Verify `expiresIn` in Better Auth config
2. Check server time sync
3. Implement token refresh

### Issue: User sees other users' data
**Cause**: Backend not filtering by user_id
**Solution**: This is a backend issue - report to backend team

### Issue: Login succeeds but redirects to login
**Cause**: Session not persisting
**Solution**:
1. Check cookie settings
2. Verify session storage
3. Test auth context state updates

## Production Security Hardening

1. **Use httpOnly cookies** for token storage
2. **Enable CSRF protection** for state-changing operations
3. **Implement rate limiting** on auth endpoints
4. **Add CSP headers** to prevent XSS
5. **Validate all inputs** before sending to backend
6. **Sanitize user content** before display
7. **Use HTTPS** exclusively
8. **Implement logout** on token expiry
9. **Clear sensitive data** on unmount
10. **Monitor for security updates** in dependencies

## Expected Workflow

When user requests frontend work:

1. **Read relevant specs** from `/specs/**`
2. **Check `/frontend/CLAUDE.md`** for project rules
3. **Use TodoWrite** to track tasks
4. **Generate plan** if needed (complex features)
5. **Implement** following spec exactly
6. **Test** authentication and API integration
7. **Create PHR** to document work
8. **Suggest ADR** if architectural decisions made

## Key Success Metrics

✅ All API calls include JWT token
✅ Unauthenticated users redirected to login
✅ Only authenticated user's data displayed
✅ All specs followed exactly
✅ TypeScript has no errors
✅ No manual coding - all spec-driven
✅ PHR created for all work
✅ Zero backend modifications (unless instructed)

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Better Auth Documentation](https://www.better-auth.com/)
- [FastAPI + Next.js Integration Guide](https://fastapi.tiangolo.com/advanced/custom-response/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
