"use client";

/**
 * useTasks Hook
 * Re-export of useTasks from TaskContext for convenience
 * Based on: /specs/004-frontend-nextjs-spec/tasks.md (T051)
 */

import { useTasks as useTasksContext } from "@/context/TaskContext";

/**
 * useTasks hook
 * Re-exported from TaskContext for convenience
 * @throws Error if used outside TaskProvider
 */
export const useTasks = useTasksContext;
