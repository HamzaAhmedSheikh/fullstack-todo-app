"use client";

/**
 * useSessionSync Hook
 * Synchronizes session state across multiple browser tabs
 * Based on: /specs/004-frontend-nextjs-spec/spec.md (US9)
 */

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

/**
 * Hook to sync authentication state across browser tabs
 * Listens for session-cleared events from other tabs and logs out
 */
export function useSessionSync() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") {
      return;
    }

    /**
     * Handle session cleared event from another tab
     */
    const handleSessionCleared = async () => {
      // If this tab is still authenticated, clear its session
      if (isAuthenticated) {
        // Clear local session without calling API (already done in other tab)
        await logout();
        router.push("/signin");
      }
    };

    // Listen for custom session-cleared event
    window.addEventListener("session-cleared", handleSessionCleared);

    // Listen for storage changes (Better Auth session removal)
    const handleStorageChange = (e: StorageEvent) => {
      // Check if Better Auth session was removed
      if (e.key?.includes("better-auth") && !e.newValue && e.oldValue) {
        handleSessionCleared();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("session-cleared", handleSessionCleared);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated, logout, router]);
}
