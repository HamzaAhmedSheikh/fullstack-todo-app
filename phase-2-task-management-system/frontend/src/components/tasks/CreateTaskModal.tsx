"use client";

/**
 * CreateTaskModal Component
 * Modern dark-mode modal for creating new tasks
 * Based on: /specs/001-dark-mode-ui/spec.md (US3)
 */

import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useTasks } from "@/hooks/useTasks";
import { VALIDATION, ERROR_MESSAGES } from "@/lib/constants";
import { CreateTaskInput } from "@/lib/types";

/**
 * Form state for creating task
 */
interface FormState {
  title: string;
  description: string;
  errors: {
    title?: string;
    description?: string;
  };
  touched: {
    title?: boolean;
    description?: boolean;
  };
}

/**
 * CreateTaskModal component
 * Modal with form for creating new tasks
 */
export function CreateTaskModal() {
  const { createTask, isCreateModalOpen, closeCreateModal } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    errors: {},
    touched: {},
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      const resetState: FormState = {
        title: "",
        description: "",
        errors: {},
        touched: {},
      };
      setForm(resetState);
      setErrorMessage(null);
    }
  }, [isCreateModalOpen]);

  /**
   * Validate form field
   */
  const validateField = (
    field: keyof FormState["errors"],
    value: string
  ): string | undefined => {
    if (field === "title") {
      if (!value.trim()) {
        return ERROR_MESSAGES.TITLE_REQUIRED;
      }
      if (value.trim().length > VALIDATION.TITLE_MAX_LENGTH) {
        return ERROR_MESSAGES.TITLE_TOO_LONG;
      }
    }
    if (field === "description") {
      if (value.trim().length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
        return ERROR_MESSAGES.DESCRIPTION_TOO_LONG;
      }
    }
    return undefined;
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const titleError = validateField("title", form.title);
    const descriptionError = validateField("description", form.description);

    setForm((prev) => ({
      ...prev,
      errors: {
        title: titleError,
        description: descriptionError,
      },
    }));

    return !titleError && !descriptionError;
  };

  /**
   * Handle input change
   */
  const handleChange = (
    field: keyof Pick<FormState, "title" | "description">,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: prev.touched[field] ? validateField(field, value) : undefined,
      },
    }));
  };

  /**
   * Handle input blur
   */
  const handleBlur = (
    field: keyof Pick<FormState, "title" | "description">
  ) => {
    setForm((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const input: CreateTaskInput = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      };

      await createTask(input);

      // Modal closes automatically via success flow
    } catch (error) {
      // Error is handled by createTask, but we show it in modal
      setErrorMessage(
        error instanceof Error ? error.message : ERROR_MESSAGES.TASK_CREATE_FAILED
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isLoading) {
      closeCreateModal();
    }
  };

  // Character counts
  const titleLength = form.title.trim().length;
  const descriptionLength = form.description.trim().length;
  const isTitleValid = !form.errors.title && titleLength > 0;
  const isFormValid = isTitleValid && !form.errors.description;

  return (
    <Modal
      open={isCreateModalOpen}
      onOpenChange={handleClose}
      title="Create New Task"
      description="Fill in the details below to create a new task"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-md bg-danger/10 border border-danger/20 p-3 text-sm text-danger animate-slide-up"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Title field */}
        <div className="space-y-2">
          <label htmlFor="task-title" className="block text-sm font-medium text-foreground">
            Title <span className="text-danger">*</span>
          </label>
          <Input
            id="task-title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            placeholder="What needs to be done?"
            error={form.touched.title ? form.errors.title : undefined}
            disabled={isLoading}
            maxLength={VALIDATION.TITLE_MAX_LENGTH}
            aria-describedby="task-title-counter"
            fullWidth
          />
          <div className="flex items-center justify-end text-xs text-muted">
            <span
              id="task-title-counter"
              className={titleLength > VALIDATION.TITLE_MAX_LENGTH * 0.9 ? "text-warning" : ""}
            >
              {titleLength}/{VALIDATION.TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Description field */}
        <div className="space-y-2">
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-foreground"
          >
            Description <span className="text-muted">(optional)</span>
          </label>
          <Textarea
            id="task-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
            placeholder="Add more details about this task..."
            error={form.touched.description ? form.errors.description : undefined}
            disabled={isLoading}
            maxLength={VALIDATION.DESCRIPTION_MAX_LENGTH}
            rows={4}
            aria-describedby="task-description-counter"
            fullWidth
          />
          <div className="flex items-center justify-end text-xs text-muted">
            <span
              id="task-description-counter"
              className={descriptionLength > VALIDATION.DESCRIPTION_MAX_LENGTH * 0.9 ? "text-warning" : ""}
            >
              {descriptionLength}/{VALIDATION.DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid || isLoading}
            loading={isLoading}
          >
            <Plus className="h-4 w-4" />
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
