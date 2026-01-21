"use client";

/**
 * TaskList Component
 * Modern dark-mode task list with smooth animations
 * Based on: /specs/001-dark-mode-ui/spec.md (US2)
 */

import { useEffect } from "react";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { TaskListSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/hooks/useTasks";
import { RefreshCw, AlertTriangle, ListTodo } from "lucide-react";

/**
 * TaskList component with all states
 * Features: Smooth scroll, loading skeletons, error handling
 */
export function TaskList() {
  const { tasks, loading, error, fetchTasks } = useTasks();

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Loading state with skeleton
  if (loading && tasks.length === 0) {
    return <TaskListSkeleton count={4} />;
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface p-12 text-center animate-fade-in">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Unable to load tasks
        </h3>
        <p className="mb-6 text-sm text-muted-foreground max-w-sm">
          {error}
        </p>
        <Button variant="primary" onClick={() => fetchTasks()}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return <EmptyState />;
  }

  // Calculate stats
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Task list
  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ListTodo className="h-4 w-4" />
            <span>
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                {completedCount} done
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {pendingCount} pending
                </span>
              )}
            </div>
          )}
        </div>
        {loading && <Spinner size="sm" />}
      </div>

      {/* Task list with smooth scroll */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskItem task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}
