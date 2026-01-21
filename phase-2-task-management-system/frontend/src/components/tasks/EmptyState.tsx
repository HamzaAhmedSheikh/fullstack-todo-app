"use client";

/**
 * EmptyState Component
 * Modern dark-mode empty state with call-to-action
 * Based on: /specs/001-dark-mode-ui/spec.md (US2)
 */

import { Plus, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/hooks/useTasks";

/**
 * EmptyState component with animated illustration
 * Features: Visual CTA, encouraging copy, smooth animation
 */
export function EmptyState() {
  const { openCreateModal } = useTasks();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 p-12 text-center animate-fade-in">
      {/* Animated illustration */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-warning-foreground animate-pulse-glow">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>

      {/* Copy */}
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        No tasks yet
      </h3>
      <p className="mb-8 max-w-sm text-muted-foreground leading-relaxed">
        Start organizing your day. Add your first task and watch your productivity soar.
      </p>

      {/* CTA Button */}
      <Button variant="primary" onClick={openCreateModal} className="px-6">
        <Plus className="h-4 w-4" />
        Add your first task
      </Button>
    </div>
  );
}
