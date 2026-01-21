/**
 * Utility functions for the frontend
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VALIDATION } from "./constants";

// ============================================================================
// Tailwind CSS Class Utilities
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence
 * Usage: cn("text-red-500", condition && "text-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncate a string to a maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with "..." if exceeds maxLength
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Trim whitespace and normalize whitespace in a string
 * @param str - String to trim
 * @returns Trimmed string
 */
export function trimWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Check if a string is whitespace-only or empty
 * @param str - String to check
 * @returns true if string is empty or whitespace-only
 */
export function isEmptyOrWhitespace(str: string): boolean {
  return str.trim().length === 0;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if email is valid
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validate password meets minimum requirements
 * @param password - Password to validate
 * @returns true if password meets requirements
 */
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
}

/**
 * Validate password field
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password is required";
  }
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
}

/**
 * Validate task title
 * @param title - Title to validate
 * @returns Error message if invalid, null if valid
 */
export function validateTitle(title: string): string | null {
  const trimmed = trimWhitespace(title);
  if (isEmptyOrWhitespace(trimmed)) {
    return "Title is required";
  }
  if (trimmed.length > VALIDATION.TITLE_MAX_LENGTH) {
    return `Title must be ${VALIDATION.TITLE_MAX_LENGTH} characters or less`;
  }
  return null;
}

/**
 * Validate task description
 * @param description - Description to validate
 * @returns Error message if invalid, null if valid
 */
export function validateDescription(description: string): string | null {
  const trimmed = trimWhitespace(description);
  if (trimmed.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return `Description must be ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters or less`;
  }
  return null;
}

// ============================================================================
// Date & Time Utilities
// ============================================================================

/**
 * Format ISO timestamp to human-readable date
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted date string (e.g., "Jan 6, 2026")
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format ISO timestamp to relative time (e.g., "2 hours ago")
 * @param isoString - ISO 8601 timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  return formatDate(isoString);
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Wait for a specified duration
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Check if an error is an API error
 * @param error - Error to check
 * @returns true if error is an ApiError
 */
export function isApiError(error: unknown): error is { message: string; status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    typeof (error as { status: unknown }).status === "number"
  );
}

/**
 * Extract error message from unknown error type
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
