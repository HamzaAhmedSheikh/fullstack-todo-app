"use client";

/**
 * OfflineBanner Component
 * Displays banner when user is offline
 * Based on: /specs/004-frontend-nextjs-spec/tasks.md (T127)
 */

import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Banner that appears when user goes offline
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-danger px-4 py-3 text-center text-danger-foreground shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">
          You are offline. Some features may not work.
        </span>
      </div>
    </div>
  );
}
