"use client";

/**
 * Modal Component
 * Modern dark-mode modal with glass-morphism effects
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * Modal component with glass-morphism styling
 * Features: backdrop blur, smooth animations, keyboard accessibility
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop with blur */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        />

        {/* Modal Content with glass-morphism */}
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 w-full ${sizeStyles[size]} -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface/95 backdrop-blur-xl p-6 shadow-lg shadow-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200`}
        >
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Modal body */}
          <div>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
