# Frontend Specification: Next.js v16 Task Management Application

**Feature**: `frontend-implementation`
**Created**: 2025-12-20
**Status**: Draft
**Input**: User requirements for Next.js v16 frontend with TypeScript and proxy configuration

## Overview

This specification defines the implementation of a Next.js v16 frontend application for the Full-Stack Task Management System. The frontend will be built with TypeScript and will utilize Next.js v16's new "Proxy" feature (formerly middleware) for request handling.

## Project Setup

### Directory Structure
The frontend application will be created in the following location:
```
/fullstack-todo-app/phase-2-task-management-system/frontend/
```

### Next.js v16 Project Initialization
Initialize the Next.js v16 project with TypeScript using the following command:

```bash
cd /fullstack-todo-app/phase-2-task-management-system
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd frontend
```

This command will:
- Create a new Next.js v16 application in the `frontend` directory
- Include TypeScript configuration
- Set up Tailwind CSS for styling
- Configure ESLint for code quality
- Use the App Router (`app` directory)
- Create a `src` directory structure
- Set up import aliasing with `@/*`

## Next.js v16 Proxy Configuration

**Important**: Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

Proxy allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

### Use Cases for Proxy:
- Modifying headers for all pages or a subset of pages
- Rewriting to different pages based on A/B tests or experiments
- Programmatic redirects based on incoming request properties

### Proxy Implementation
Create a `proxy.js` file in the project root directory:

```javascript
// proxy.js
export async function proxy(request) {
  // Example: Add custom headers to all requests
  const headers = new Headers(request.headers);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');

  // Example: Authentication check
  const token = request.cookies.get('authjs.session-token') ||
                request.cookies.get('next-auth.session-token');

  // Example: Redirect unauthenticated users from protected routes
  const protectedPaths = ['/dashboard', '/dashboard/tasks'];
  const isProtectedRoute = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    return Response.redirect(url);
  }

  // Continue with the request
  return {
    headers,
    next: true
  };
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    // Exclude static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
```

## Project Structure

After running the create-next-app command, the project will have the following structure:

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── next.svg
│   └── vercel.svg
├── .env.local
├── .gitignore
├── next.config.mjs
├── proxy.js
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Technology Stack

- **Framework**: Next.js v16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm (default with create-next-app)
- **Runtime**: Node.js 20.9.0+ (as required by Next.js v16)

## Configuration Files

### next.config.mjs
The configuration file will be automatically created with Next.js v16 defaults:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js v16 features can be configured here
  },
}

module.exports = nextConfig
```

### tsconfig.json
TypeScript configuration will be set up for optimal Next.js v16 development:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
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
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Development Workflow

### 1. Initial Setup
```bash
cd /fullstack-todo-app/phase-2-task-management-system
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd frontend
```

### 2. Install Additional Dependencies (if needed)
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The development server will start on http://localhost:3000

### 4. Build for Production
```bash
npm run build
```

### 5. Run Production Server
```bash
npm start
```

## Environment Configuration

Create `.env.local` for environment-specific variables:

```env
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8000

# Next.js configuration
NEXT_PUBLIC_APP_NAME="Task Management App"
```

## Key Features of Next.js v16

### Modern Sass API
Next.js 16 includes an updated `sass-loader` (v16) that supports modern Sass syntax and new features.

### Async Request APIs
Next.js 16 introduces async request APIs (cookies, headers, params) that enhance security by preventing accidental data leakage during prerendering.

### Component-Level Caching
The "use cache" directive with `cacheLife()` and `cacheTag()` enables fine-grained component-level caching.

### Stable after() API
The stable `after()` API for scheduling post-response work like analytics and logging without blocking the response.

### Connection API
The `connection()` API enables request-aware rendering, ensuring code only executes during actual requests rather than prerendering.

## Success Criteria

- [ ] Next.js v16 project successfully created in the specified directory
- [ ] TypeScript configuration properly set up
- [ ] Tailwind CSS integrated and working
- [ ] Proxy file created and configured (not middleware)
- [ ] Development server runs without errors
- [ ] Project follows Next.js v16 best practices
- [ ] Import aliasing with `@/*` working correctly
- [ ] ESLint and formatting tools configured

## Dependencies

The following dependencies will be automatically installed by create-next-app:
- react
- react-dom
- next
- typescript
- @types/node
- @types/react
- @types/react-dom
- eslint
- eslint-config-next
- tailwindcss
- postcss
- autoprefixer

## Next Steps

1. Execute the create-next-app command in the specified directory
2. Verify the project structure is correctly set up
3. Configure the proxy file according to Next.js v16 standards
4. Run the development server to ensure everything works
5. Begin implementing the task management UI components