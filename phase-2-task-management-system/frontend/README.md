# TaskFlow - Frontend

Next.js 16 frontend for the Task Management System with JWT authentication and full CRUD operations.

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 4.0+
- **Authentication**: Better Auth (JWT-based)
- **UI Components**: Radix UI Dialog, Lucide React icons
- **Notifications**: Sonner toast notifications
- **Runtime**: React 19, Node.js 18+

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing page
│   │   ├── signin/             # Sign in page
│   │   ├── signup/             # Sign up page
│   │   └── dashboard/          # Dashboard with task management
│   ├── components/
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components (Navbar, Container)
│   │   ├── tasks/              # Task management components
│   │   └── ui/                 # Reusable UI primitives
│   ├── context/                # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configurations
│   │   ├── api.ts              # Centralized API client
│   │   ├── auth.ts             # Better Auth configuration
│   │   ├── constants.ts        # App constants
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # Utility functions
│   └── middleware.ts           # Next.js middleware for route protection
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── .env.local                  # Environment variables (local development)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on http://localhost:8000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your configuration:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000

   # Better Auth Configuration
   BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
   BETTER_AUTH_URL=http://localhost:3000
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

### Production Build

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Features

### Authentication
- **User Registration** - Create new account with email and password
- **User Sign In** - Authenticate with existing credentials
- **Session Management** - JWT-based sessions with 7-day expiry
- **Secure Logout** - Clear session and redirect to sign in

### Task Management
- **View Tasks** - See all tasks sorted by creation date (newest first)
- **Create Task** - Add new tasks with title (required) and description (optional)
- **Edit Task** - Modify existing task details
- **Delete Task** - Remove tasks with confirmation dialog
- **Toggle Completion** - Mark tasks as complete/incomplete

### User Experience
- **Loading States** - Skeleton loaders during data fetch
- **Error Handling** - Graceful error messages with retry options
- **Toast Notifications** - Success and error feedback
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Accessibility** - WCAG AA compliant with keyboard navigation

## API Integration

All API calls go through the centralized API client (`src/lib/api.ts`) which:

- Automatically attaches JWT token to every request
- Handles 401/403 errors globally
- Extracts user ID from JWT claims
- Provides typed request/response payloads

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | Fetch all user tasks |
| POST | `/api/{user_id}/tasks` | Create a new task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle task completion |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `BETTER_AUTH_SECRET` | Secret key for JWT signing | Yes |
| `BETTER_AUTH_URL` | Frontend URL for auth callbacks | Yes |

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines including:

- Component structure and organization
- API client rules
- Authentication patterns
- Error handling requirements
- Accessibility standards
- Performance optimization

## Related Documentation

- [Backend README](../backend/README.md) - Backend API documentation
- [Full Spec](../specs/004-frontend-nextjs-spec/spec.md) - Feature specification
- [API Contracts](../specs/004-frontend-nextjs-spec/contracts/api-contracts.md) - API endpoint contracts

## License

This project is part of the TaskFlow task management system.
