"use client";

/**
 * DeleteConfirmDialog Component
 * Modern dark-mode confirmation dialog for deleting tasks
 * Based on: /specs/001-dark-mode-ui/spec.md (US3)
 */

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/hooks/useTasks";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DeleteConfirmDialog component with glass-morphism styling
 * Features: Warning icon, clear messaging, danger action
 */
export function DeleteConfirmDialog({
  taskId,
  taskTitle,
  isOpen,
  onClose,
}: DeleteConfirmDialogProps) {
  const { deleteTask } = useTasks();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle task deletion
   */
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteTask(taskId);
      // Close dialog on successful delete
      onClose();
    } catch (error) {
      // Error is handled by deleteTask, but we could show inline error if needed
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop with blur */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        />

        {/* Modal Content with glass-morphism */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface/95 backdrop-blur-xl p-6 shadow-lg shadow-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
        >
          {/* Warning Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 border border-danger/20">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>

          {/* Title */}
          <Dialog.Title className="mb-2 text-center text-lg font-semibold text-foreground">
            Delete Task?
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description className="mb-6 text-center text-sm text-muted-foreground leading-relaxed">
            You're about to delete{" "}
            <span className="font-medium text-foreground">"{taskTitle}"</span>.
            <br />
            This action cannot be undone.
          </Dialog.Description>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            >
              <Trash2 className="h-4 w-4" />
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
