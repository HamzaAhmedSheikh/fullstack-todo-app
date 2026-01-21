"use client";

/**
 * TaskContext - Global task state management
 * Provides task list, CRUD operations, and modal state
 * Based on: /specs/004-frontend-nextjs-spec/data-model.md
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTaskAnnouncer } from "@/components/ui/LiveAnnouncer";
import { api } from "@/lib/api";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";
import type {
  Task,
  TaskState,
  TaskActions,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/types";
import { toast } from "sonner";

/**
 * Combined Task Context type
 */
type TaskContextType = TaskState & TaskActions;

/**
 * Task Context
 */
const TaskContext = createContext<TaskContextType | undefined>(undefined);

/**
 * TaskProvider Component
 * Wraps the application to provide task management context
 */
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const {
    announceTaskCreated,
    announceTaskUpdated,
    announceTaskDeleted,
    announceTaskCompleted,
    announceTaskIncomplete,
    announceError,
  } = useTaskAnnouncer();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<{ id: string; title: string } | null>(null);

  /**
   * Close all modals and clear tasks when session expires
   * Listens for session-cleared event from API client
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleSessionCleared = () => {
      // Close all open modals
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setDeleteConfirmTask(null);
      setSelectedTask(null);
      // Clear tasks on logout
      setTasks([]);
      setError(null);
      setLoading(false);
    };

    window.addEventListener("session-cleared", handleSessionCleared);

    return () => {
      window.removeEventListener("session-cleared", handleSessionCleared);
    };
  }, []);

  /**
   * Fetch all tasks for the current user
   */
  const fetchTasks = useCallback(async (): Promise<void> => {
    if (!user || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = API_ENDPOINTS.TASKS(user.user_id);
      const fetchedTasks = await api.get<Task[]>(endpoint);

      // Sort by created_at descending (newest first)
      const sortedTasks = fetchedTasks.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTasks(sortedTasks);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : ERROR_MESSAGES.TASKS_LOAD_FAILED;
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  /**
   * Auto-fetch tasks when user authenticates
   * This handles the case when user signs in after signing out
   */
  useEffect(() => {
    if (user && isAuthenticated) {
      // Reset state and fetch fresh tasks when user changes
      setError(null);
      fetchTasks();
    } else {
      // Clear tasks when user logs out
      setTasks([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, isAuthenticated]);

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task> => {
      if (!user || !isAuthenticated) {
        throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
      }

      try {
        setLoading(true);
        setError(null);

        const endpoint = API_ENDPOINTS.TASKS(user.user_id);
        const newTask = await api.post<Task>(endpoint, input);

        // Add task to local state (optimistic update)
        setTasks((prev) => [newTask, ...prev]);

        toast.success(SUCCESS_MESSAGES.TASK_CREATED);
        announceTaskCreated(newTask.title);
        return newTask;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.TASK_CREATE_FAILED;
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated]
  );

  /**
   * Update an existing task
   */
  const updateTask = useCallback(
    async (taskId: string, input: UpdateTaskInput): Promise<Task> => {
      if (!user || !isAuthenticated) {
        throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
      }

      try {
        setLoading(true);
        setError(null);

        const endpoint = API_ENDPOINTS.TASK_BY_ID(user.user_id, taskId);
        const updatedTask = await api.put<Task>(endpoint, input);

        // Update task in local state
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );

        toast.success(SUCCESS_MESSAGES.TASK_UPDATED);
        announceTaskUpdated(updatedTask.title);
        return updatedTask;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.TASK_UPDATE_FAILED;
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated]
  );

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (!user || !isAuthenticated) {
        throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
      }

      try {
        setLoading(true);
        setError(null);

        const endpoint = API_ENDPOINTS.TASK_BY_ID(user.user_id, taskId);
        await api.delete(endpoint);

        // Remove task from local state (optimistic update)
        setTasks((prev) => prev.filter((task) => task.id !== taskId));

        toast.success(SUCCESS_MESSAGES.TASK_DELETED);
        // Note: We need to get the title before deleting, but for now just announce
        announceTaskDeleted("Task");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.TASK_DELETE_FAILED;
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated]
  );

  /**
   * Open delete confirmation dialog
   */
  const openDeleteConfirm = useCallback((task: Task) => {
    setDeleteConfirmTask({ id: task.id, title: task.title });
  }, []);

  /**
   * Close delete confirmation dialog
   */
  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmTask(null);
  }, []);

  /**
   * Toggle task completion status
   */
  const toggleTaskCompletion = useCallback(
    async (taskId: string, completed: boolean): Promise<void> => {
      if (!user || !isAuthenticated) {
        throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
      }

      try {
        setLoading(true);
        setError(null);

        const endpoint = API_ENDPOINTS.TASK_COMPLETE(user.user_id, taskId);
        const updatedTask = await api.patch<Task>(endpoint, { completed });

        // Update task in local state
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );

        // Announce completion status
        if (completed) {
          announceTaskCompleted(updatedTask.title);
        } else {
          announceTaskIncomplete(updatedTask.title);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.TASK_TOGGLE_FAILED;
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated]
  );

  /**
   * Open create modal
   */
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  /**
   * Close create modal
   */
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  /**
   * Open edit modal with selected task
   */
  const openEditModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Close edit modal
   */
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  }, []);

  /**
   * Select a task
   */
  const selectTask = useCallback((task: Task | null) => {
    setSelectedTask(task);
  }, []);

  /**
   * Context value
   */
  const value: TaskContextType = {
    tasks,
    loading,
    error,
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    deleteConfirmTask,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    selectTask,
    openDeleteConfirm,
    closeDeleteConfirm,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

/**
 * useTasks hook
 * Access task management context from any component
 * @throws Error if used outside TaskProvider
 */
export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);

  if (context === undefined) {
    throw new Error("useTasks must be used within TaskProvider");
  }

  return context;
}
