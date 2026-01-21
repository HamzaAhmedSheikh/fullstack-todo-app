/**
 * Skeleton Component
 * Modern dark-mode loading skeleton with shimmer effect
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Width of the skeleton
   */
  width?: string | number;

  /**
   * Height of the skeleton
   */
  height?: string | number;

  /**
   * Border radius
   * @default "md"
   */
  radius?: "sm" | "md" | "lg" | "full";
}

/**
 * Skeleton component with shimmer animation
 * Provides visual loading feedback in dark mode
 */
export function Skeleton({
  className,
  width,
  height,
  radius = "md",
}: SkeletonProps) {
  const radiusStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface",
        "before:absolute before:inset-0",
        "before:translate-x-[-100%]",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-border/30 before:to-transparent",
        radiusStyles[radius],
        className
      )}
      style={{
        width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
      }}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * Task card skeleton for task list loading state
 * Matches TaskItem component structure
 */
export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox skeleton */}
        <Skeleton width={20} height={20} radius="sm" className="mt-0.5 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <Skeleton width="65%" height={18} radius="sm" />
          {/* Description */}
          <Skeleton width="85%" height={14} radius="sm" />
          {/* Metadata */}
          <div className="flex items-center gap-3 pt-1">
            <Skeleton width={90} height={12} radius="sm" />
            <Skeleton width={70} height={12} radius="sm" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2 flex-shrink-0">
          <Skeleton width={32} height={32} radius="md" />
          <Skeleton width={32} height={32} radius="md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Task list skeleton with multiple task cards
 */
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={16} radius="sm" />
      </div>

      {/* Task cards skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
