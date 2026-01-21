/**
 * Application constants
 * Centralized configuration values for the frontend
 */

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://hamzascrift-docker-compose.hf.space"
    : "http://localhost:8000");

export const API_ENDPOINTS = {
  TASKS: (userId: string) => `/api/${userId}/tasks`,
  TASK_BY_ID: (userId: string, taskId: string) => `/api/${userId}/tasks/${taskId}`,
  TASK_COMPLETE: (userId: string, taskId: string) =>
    `/api/${userId}/tasks/${taskId}/complete`,
  AUTH_SIGNUP: "/auth/signup",
  AUTH_SIGNIN: "/auth/signin",
  AUTH_LOGOUT: "/auth/logout",
} as const;

// ============================================================================
// Validation Limits
// ============================================================================

export const VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI_CONFIG = {
  TOAST_DURATION: 3000, // milliseconds
  TOAST_POSITION: "bottom-right" as const,
  MODAL_ANIMATION_DURATION: 200, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds for input debouncing
  DESCRIPTION_TRUNCATE_LENGTH: 100, // characters before truncation
} as const;

// ============================================================================
// Application Routes
// ============================================================================

export const ROUTES = {
  HOME: "/",
  SIGNUP: "/signup",
  SIGNIN: "/signin",
  DASHBOARD: "/dashboard",
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Validation Errors
  TITLE_REQUIRED: "Title is required",
  TITLE_TOO_LONG: `Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`,
  DESCRIPTION_TOO_LONG: `Description must be ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`,
  EMAIL_INVALID: "Please enter a valid email",
  EMAIL_REQUIRED: "Email is required",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,

  // API Errors
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  ACCESS_DENIED: "Access denied. You don't have permission to perform this action.",
  TASK_NOT_FOUND: "Task no longer exists",
  NETWORK_ERROR: "Unable to connect to server. Please check your internet connection.",
  REQUEST_TIMEOUT: "Request timed out. Please try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",

  // Auth Errors
  EMAIL_ALREADY_REGISTERED: "Email already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  SIGNUP_FAILED: "Unable to create account. Please try again later.",
  SIGNIN_FAILED: "Unable to sign in. Please try again later.",
  LOGOUT_FAILED: "Unable to log out. Please try again.",

  // Task Errors
  TASK_CREATE_FAILED: "Unable to create task. Please try again.",
  TASK_UPDATE_FAILED: "Unable to update task. Please try again.",
  TASK_DELETE_FAILED: "Unable to delete task. Please try again.",
  TASK_TOGGLE_FAILED: "Unable to update task completion. Please try again.",
  TASKS_LOAD_FAILED: "Unable to load tasks. Please try again.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: "Account created successfully! Welcome!",
  SIGNIN_SUCCESS: "Signed in successfully! Welcome back!",
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  LOGOUT_SUCCESS: "You have been logged out successfully",
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;
