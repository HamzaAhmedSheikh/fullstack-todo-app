"use client";

/**
 * TaskItem Component
 * Modern dark-mode task card with hover effects and actions
 * Based on: /specs/001-dark-mode-ui/spec.md (US2, US3)
 */

import React, { useState } from "react";
import { Check, Pencil, Trash2, Calendar } from "lucide-react";
import { Task } from "@/lib/types";
import { UI_CONFIG } from "@/lib/constants";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";

interface TaskItemProps {
  task: Task;
}

/**
 * Format date to relative or absolute based on proximity
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * TaskItem component with modern dark-mode styling
 * Features: Hover reveal actions, smooth animations, visual feedback
 */
export function TaskItem({ task }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { openEditModal, openDeleteConfirm, toggleTaskCompletion } = useTasks();

  // Truncate description if > 100 characters
  const needsTruncation =
    task.description && task.description.length > UI_CONFIG.DESCRIPTION_TRUNCATE_LENGTH;
  const displayDescription = needsTruncation
    ? isExpanded
      ? task.description
      : task.description?.slice(0, UI_CONFIG.DESCRIPTION_TRUNCATE_LENGTH) + "..."
    : task.description;

  const isCompleted = task.completed;

  return (
    <div
      className={`group relative rounded-lg border transition-all duration-200 ${
        isCompleted
          ? "border-border/50 bg-surface/30"
          : "border-border bg-surface hover:border-border-hover hover:bg-surface-hover"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Completion checkbox */}
          <button
            type="button"
            onClick={() => toggleTaskCompletion(task.id, !task.completed)}
            className="mt-0.5 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
            aria-checked={isCompleted}
            role="checkbox"
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                isCompleted
                  ? "border-success bg-success text-success-foreground"
                  : "border-border hover:border-primary bg-transparent"
              }`}
            >
              {isCompleted && <Check className="h-3 w-3" strokeWidth={3} />}
            </div>
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            {/* Task title */}
            <h3
              className={`font-medium leading-tight transition-colors duration-200 ${
                isCompleted
                  ? "line-through text-muted decoration-muted"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>

            {/* Task description (if exists) */}
            {displayDescription && (
              <p
                className={`mt-1.5 text-sm leading-relaxed transition-colors duration-200 ${
                  isCompleted ? "text-muted/70" : "text-muted-foreground"
                }`}
              >
                {displayDescription}
                {needsTruncation && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="ml-1 text-primary hover:text-primary-hover underline-offset-2 hover:underline transition-colors"
                  >
                    {isExpanded ? "less" : "more"}
                  </button>
                )}
              </p>
            )}

            {/* Task metadata */}
            <div className="mt-3 flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.created_at)}
              </span>
              {task.updated_at !== task.created_at && (
                <span className="text-muted/70">
                  · edited {formatDate(task.updated_at)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons - revealed on hover */}
          <div
            className={`flex gap-1 flex-shrink-0 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0 sm:opacity-0"
            } group-focus-within:opacity-100`}
          >
            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(task)}
              aria-label="Edit task"
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteConfirm(task)}
              aria-label="Delete task"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Completion indicator line */}
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-success rounded-l-lg" />
      )}
    </div>
  );
}
