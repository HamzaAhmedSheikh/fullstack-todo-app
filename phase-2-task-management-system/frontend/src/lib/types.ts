/**
 * TypeScript type definitions for the Task Management frontend
 * Based on: /specs/004-frontend-nextjs-spec/data-model.md
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface UserSession {
  user_id: string; // UUID - User identifier
  email: string; // User email address
  token?: string; // JWT token (if accessible via Better Auth)
  expires_at: string; // ISO timestamp - Token expiration (7 days default)
}

export interface AuthState {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  signup: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  sessionCleared: () => void; // Called when session is cleared (e.g., 401 error)
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string; // UUID - Unique task identifier
  user_id: string; // UUID - Owner of the task
  title: string; // Required, max 200 chars, trimmed
  description: string | null; // Optional, max 500 chars, trimmed, can be empty
  completed: boolean; // Completion status
  version: number; // Version for optimistic locking
  created_at: string; // ISO timestamp - Creation time
  updated_at: string; // ISO timestamp - Last update time
}

export interface CreateTaskInput {
  title: string; // Required, 1-200 chars after trim
  description?: string; // Optional, 0-500 chars after trim
}

export interface UpdateTaskInput {
  title: string; // Required, 1-200 chars after trim
  description: string; // Optional, 0-500 chars after trim
  version: number; // Current version for optimistic locking
}

export interface ToggleTaskCompletionInput {
  completed: boolean; // New completion status
}

// ============================================================================
// Task State Management Types
// ============================================================================

export interface TaskState {
  tasks: Task[]; // Array of tasks, sorted by created_at (newest first)
  loading: boolean; // Fetching tasks
  error: string | null; // Error message
  selectedTask: Task | null; // Currently selected task for editing
  isCreateModalOpen: boolean; // Create modal visibility
  isEditModalOpen: boolean; // Edit modal visibility
  deleteConfirmTask: { id: string; title: string } | null; // Task pending deletion confirmation
}

export interface TaskActions {
  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (taskId: string, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;
  selectTask: (task: Task | null) => void;
  openDeleteConfirm: (task: Task) => void;
  closeDeleteConfirm: () => void;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  message: string; // User-friendly error message
  status: number; // HTTP status code
  code?: string; // Optional error code
  details?: unknown; // Optional additional error details
}

export type ApiResponse<T> = T | ApiError;

// ============================================================================
// UI State Types
// ============================================================================

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ModalState {
  isOpen: boolean;
  isClosing: boolean; // For animation
  data?: unknown; // Modal-specific data
}

export interface ConfirmationDialogState extends ModalState {
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // Default: 3000ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  delay?: number; // Delay before showing spinner
  error?: string;
}

// ============================================================================
// API Client Types
// ============================================================================

export interface ApiClientConfig {
  baseUrl: string; // NEXT_PUBLIC_API_URL
  getAuthHeaders: () => Record<string, string>; // Attach JWT
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string; // API path (e.g., `/api/${user_id}/tasks`)
  body?: unknown; // Request payload
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, body: unknown): Promise<T>;
  put<T>(endpoint: string, body: unknown): Promise<T>;
  patch<T>(endpoint: string, body: unknown): Promise<T>;
  delete(endpoint: string): Promise<void>;
}
