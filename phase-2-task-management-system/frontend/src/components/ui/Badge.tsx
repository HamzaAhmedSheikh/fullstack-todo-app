/**
 * Badge Component
 * Modern dark-mode badge for status indicators and labels
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;

  /**
   * Visual variant
   * @default "default"
   */
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "outline";

  /**
   * Size of the badge
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for status and labels
 * Features: Multiple variants, pill shape, subtle backgrounds
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium rounded-full",
    "transition-colors duration-200"
  );

  const variantStyles = {
    default: cn(
      "bg-surface border border-border text-muted-foreground"
    ),
    primary: cn(
      "bg-primary/15 text-primary border border-primary/20"
    ),
    success: cn(
      "bg-success/15 text-success border border-success/20"
    ),
    warning: cn(
      "bg-warning/15 text-warning border border-warning/20"
    ),
    danger: cn(
      "bg-danger/15 text-danger border border-danger/20"
    ),
    outline: cn(
      "bg-transparent border border-border text-foreground"
    ),
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
