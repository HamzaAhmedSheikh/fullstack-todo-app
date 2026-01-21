/**
 * Button Component
 * Modern dark-mode button with variants and micro-interactions
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";

  /**
   * Size of the button
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether button is in loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button component with modern dark-mode styling
 * Features: smooth transitions, hover effects, loading spinner
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = cn(
    // Base layout and typography
    "inline-flex items-center justify-center gap-2 font-medium",
    // Border radius - rounded-md for buttons
    "rounded-md",
    // Transitions for smooth micro-interactions
    "transition-all duration-200 ease-out",
    // Transform on hover for subtle lift effect
    "hover:translate-y-[-1px] active:translate-y-0",
    // Focus styles for accessibility
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Disabled state
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  );

  const variantStyles = {
    primary: cn(
      "bg-primary text-primary-foreground",
      "hover:bg-primary-hover hover:shadow-md hover:shadow-primary/20",
      "active:bg-primary"
    ),
    secondary: cn(
      "bg-surface text-foreground border border-border",
      "hover:bg-surface-hover hover:border-border-hover",
      "active:bg-surface"
    ),
    danger: cn(
      "bg-danger text-danger-foreground",
      "hover:bg-danger/90 hover:shadow-md hover:shadow-danger/20",
      "active:bg-danger"
    ),
    ghost: cn(
      "bg-transparent text-muted-foreground",
      "hover:bg-surface hover:text-foreground",
      "active:bg-surface-hover"
    ),
    outline: cn(
      "bg-transparent text-foreground border border-border",
      "hover:bg-surface hover:border-border-hover",
      "active:bg-surface-hover"
    ),
  };

  const sizeStyles = {
    sm: "text-sm px-3 py-1.5 h-8",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-6 py-2.5 h-12",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
