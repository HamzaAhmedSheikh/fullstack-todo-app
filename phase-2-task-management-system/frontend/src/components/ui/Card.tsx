/**
 * Card Component
 * Modern dark-mode card with glass-morphism effects and elevation variants
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Visual variant
   * @default "default"
   */
  variant?: "default" | "glass" | "elevated" | "interactive";

  /**
   * Padding size
   * @default "md"
   */
  padding?: "none" | "sm" | "md" | "lg";

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler for interactive cards
   */
  onClick?: () => void;
}

/**
 * Card component with glass-morphism and elevation variants
 * Features: Multiple variants, smooth transitions, hover effects
 */
export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  onClick,
}: CardProps) {
  const baseStyles = cn(
    "rounded-lg border transition-all duration-200"
  );

  const variantStyles = {
    default: cn(
      "border-border bg-surface"
    ),
    glass: cn(
      "border-glass-border bg-glass-bg",
      "backdrop-blur-xl",
      "shadow-lg shadow-black/10"
    ),
    elevated: cn(
      "border-border bg-surface",
      "shadow-md shadow-black/20",
      "hover:shadow-lg hover:shadow-black/30"
    ),
    interactive: cn(
      "border-border bg-surface",
      "cursor-pointer",
      "hover:border-border-hover hover:bg-surface-hover",
      "hover:shadow-md hover:shadow-black/20",
      "active:scale-[0.99]"
    ),
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        onClick && "w-full text-left",
        className
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Component>
  );
}

/**
 * Card Header component
 */
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

/**
 * Card Title component
 */
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

/**
 * Card Description component
 */
export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

/**
 * Card Content component
 */
export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * Card Footer component
 */
export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 flex items-center gap-3", className)}>
      {children}
    </div>
  );
}
