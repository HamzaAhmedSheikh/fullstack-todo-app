/**
 * Container Component
 * Responsive layout container with max-width constraints
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  /**
   * Container content
   */
  children: React.ReactNode;

  /**
   * Maximum width variant
   * @default "md"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * HTML element to render
   * @default "div"
   */
  as?: "div" | "main" | "section" | "article";
}

/**
 * Container component for consistent page layout
 */
export function Container({
  children,
  maxWidth = "md",
  className,
  as: Component = "div",
}: ContainerProps) {
  const maxWidthStyles = {
    sm: "max-w-2xl",   // 672px
    md: "max-w-4xl",   // 896px
    lg: "max-w-6xl",   // 1152px
    xl: "max-w-7xl",   // 1280px
    full: "max-w-full",
  };

  return (
    <Component
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8",
        maxWidthStyles[maxWidth],
        className
      )}
    >
      {children}
    </Component>
  );
}
