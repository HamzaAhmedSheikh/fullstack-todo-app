"use client";

/**
 * useOnlineStatus Hook
 * Detects online/offline network status
 * Based on: /specs/004-frontend-nextjs-spec/tasks.md (T127)
 */

import { useState, useEffect } from "react";

/**
 * Hook to track network online/offline status
 * @returns boolean indicating if user is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
