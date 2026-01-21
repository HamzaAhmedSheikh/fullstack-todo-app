/**
 * Input Component
 * Modern dark-mode input with label and error state
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Full width input
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Helper text below input
   */
  helperText?: string;
}

/**
 * Input component with modern dark-mode styling
 * Features: focus glow effect, error states, helper text
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const baseStyles = cn(
      // Layout
      "block w-full px-3 py-2 h-10",
      // Background and border
      "bg-input border border-border rounded-md",
      // Typography
      "text-sm text-foreground placeholder:text-muted",
      // Transitions
      "transition-all duration-200 ease-out",
      // Focus states
      "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
      // Hover state
      "hover:border-border-hover",
      // Disabled state
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border"
    );

    const errorStyles = error
      ? "border-danger focus:border-danger focus:ring-danger/20 hover:border-danger"
      : "";

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(baseStyles, errorStyles, widthStyles, className)}
          {...props}
        />
        {error && (
          <span className="text-sm text-danger flex items-center gap-1" role="alert">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-sm text-muted-foreground">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
