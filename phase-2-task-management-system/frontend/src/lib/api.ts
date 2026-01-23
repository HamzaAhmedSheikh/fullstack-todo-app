/**
 * Centralized API Client
 * Handles all backend API communication with JWT auto-attachment
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import { getSession, getToken, getUserId, signOut } from "./auth";
import { HTTP_STATUS, ERROR_MESSAGES } from "./constants";
import type { ApiError } from "./types";

/**
 * API Client Configuration
 * Note: Remove trailing slash from API_BASE_URL to avoid double slashes in URLs
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://hamzascrift-docker-compose.hf.space"
    : "http://localhost:8000")
).replace(/\/+$/, ""); // Remove trailing slashes

/**
 * Get authorization headers with JWT token
 * @returns Headers object with Authorization and Content-Type
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.debug("[api.ts] Auth header set with token");
  } else {
    console.warn("[api.ts] No JWT token available - request will be unauthenticated");
  }

  return headers;
}

/**
 * Get user ID from current session
 * @returns User ID (UUID) or throws error if not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  const userId = getUserId(session);

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}

/**
 * Handle API errors globally
 * @param response - Fetch response
 * @throws ApiError with appropriate message
 */
async function handleApiError(response: Response): Promise<never> {
  // Handle 401 Unauthorized - session expired
  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    // Show toast message
    if (typeof window !== "undefined") {
      const { toast } = require("sonner");
      toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
    }

    // Clear session and redirect to signin
    await signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }

    // Dispatch custom event to notify other tabs
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("session-cleared"));
    }

    throw {
      message: ERROR_MESSAGES.SESSION_EXPIRED,
      status: HTTP_STATUS.UNAUTHORIZED,
    } as ApiError;
  }

  // Handle 403 Forbidden - access denied
  if (response.status === HTTP_STATUS.FORBIDDEN) {
    throw {
      message: ERROR_MESSAGES.ACCESS_DENIED,
      status: HTTP_STATUS.FORBIDDEN,
    } as ApiError;
  }

  // Handle 404 Not Found
  if (response.status === HTTP_STATUS.NOT_FOUND) {
    throw {
      message: ERROR_MESSAGES.TASK_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND,
    } as ApiError;
  }

  // Try to parse error message from response
  try {
    const errorData = await response.json();
    throw {
      message: errorData.message || errorData.detail || ERROR_MESSAGES.SERVER_ERROR,
      status: response.status,
      details: errorData,
    } as ApiError;
  } catch (parseError) {
    // If parsing fails, return generic error
    throw {
      message: ERROR_MESSAGES.SERVER_ERROR,
      status: response.status,
    } as ApiError;
  }
}

/**
 * Make an API request
 * @param endpoint - API endpoint path (e.g., "/api/users/123/tasks")
 * @param options - Fetch options
 * @returns Promise with response data
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getAuthHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle error responses
    if (!response.ok) {
      await handleApiError(response);
    }

    // Handle 204 No Content (e.g., DELETE requests)
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return null as T;
    }

    // Parse and return JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Handle network errors (connection failed, timeout, etc.)
    if (error instanceof TypeError) {
      throw {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      } as ApiError;
    }

    // Re-throw API errors
    throw error;
  }
}

/**
 * GET request
 * @param endpoint - API endpoint path
 * @returns Promise with response data
 */
export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "GET",
  });
}

/**
 * POST request
 * @param endpoint - API endpoint path
 * @param body - Request body
 * @returns Promise with response data
 */
export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 * @param endpoint - API endpoint path
 * @param body - Request body
 * @returns Promise with response data
 */
export async function put<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * PATCH request
 * @param endpoint - API endpoint path
 * @param body - Request body
 * @returns Promise with response data
 */
export async function patch<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 * @param endpoint - API endpoint path
 * @returns Promise (void for successful deletion)
 */
export async function del(endpoint: string): Promise<void> {
  return apiRequest<void>(endpoint, {
    method: "DELETE",
  });
}

/**
 * API Client object with all HTTP methods
 */
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  getCurrentUserId,
};

export default api;
