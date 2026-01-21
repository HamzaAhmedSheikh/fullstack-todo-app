/**
 * useAuth Hook
 * Convenience wrapper for accessing authentication context
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import { useAuthContext } from "@/context/AuthContext";

/**
 * Access authentication state and actions
 * @returns AuthContext value with user, loading, error, and auth actions
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  return useAuthContext();
}
