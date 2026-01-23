"use client";

/**
 * AuthContext - Global authentication state management
 * Provides user session, loading state, and auth actions
 * Based on: /specs/004-frontend-nextjs-spec/data-model.md
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSession, signUp, signIn, signOut, getUserId } from "@/lib/auth";
import type { BetterAuthSession } from "@/lib/auth";
import type { AuthState, AuthActions, UserSession } from "@/lib/types";
import { ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

/**
 * Combined Auth Context type
 */
type AuthContextType = AuthState & {
  signup: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  sessionCleared: () => void;
  openModal: () => void;
  closeModal: () => void;
};

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert Better Auth session to UserSession
 * Handles both full session responses and signup/signin responses
 * which may have different structures:
 * - AuthResponse from signUp/signIn: { token, user, redirect? }
 * - Session from getSession: { user, session: { token, ... } }
 */
function toUserSession(session: BetterAuthSession | { token?: string; user?: { id: string; email: string } } | null): UserSession | null {
  if (!session) return null;

  // Handle case where user data exists but session object might be missing or incomplete
  // This happens with signup/signin responses that may not include full session data
  const user = session.user;

  if (!user) return null;

  // Check for token at different locations depending on response type
  // AuthResponse from signUp/signIn has token at top level
  // Session from getSession has token nested in session.session.token
  const token = ('token' in session && typeof session.token === 'string')
    ? session.token  // AuthResponse structure: { token, user }
    : ('session' in session && session.session?.token)
      ? session.session.token  // Session structure: { user, session: { token } }
      : undefined;

  // Get expiration from session data or default to 24 hours
  const sessionData = 'session' in session ? session.session : null;
  const expiresAt = sessionData?.expiresAt
    ? (sessionData.expiresAt instanceof Date ? sessionData.expiresAt.toISOString() : sessionData.expiresAt)
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  console.debug('[AuthContext] toUserSession - token present:', !!token, 'user_id:', user.id);

  return {
    user_id: user.id,
    email: user.email,
    token,
    expires_at: expiresAt,
  };
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalsOpen, setModalsOpen] = useState(0);

  // Track if we just authenticated to skip immediate session check
  // This prevents race condition where getSession() returns null before cookie is set
  const justAuthenticatedRef = useRef(false);

  const openModal = () => setModalsOpen((prev) => prev + 1);
  const closeModal = () => setModalsOpen((prev) => Math.max(0, prev - 1));
  const closeAllModals = () => setModalsOpen(0);

  /**
   * Load session on mount
   */
  useEffect(() => {
    loadSession();
  }, []);

  /**
   * Load current session from Better Auth
   */
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await getSession();
      setUser(toUserSession(session));

      // Note: null session is expected when user is not authenticated
      // This is not an error condition
    } catch (err) {
      // Only log truly unexpected errors
      // Network errors and missing sessions are already handled in getSession
      console.warn("Unexpected error loading session:", err);
      setUser(null);
      // Don't set error state for expected conditions (no session, network unavailable)
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Session state listener to detect session changes across tabs
   * Only checks when tab becomes visible to avoid excessive polling
   */
  useEffect(() => {
    // Check session when tab becomes visible (cross-tab sync)
    const checkSession = async () => {
      // Skip if we just authenticated (prevents race condition)
      if (justAuthenticatedRef.current) {
        justAuthenticatedRef.current = false;
        return;
      }

      // Skip if tab is not visible
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      try {
        const session = await getSession();
        const currentUserId = user?.user_id;
        const sessionUserId = session?.user?.id;

        // If session was cleared in another tab
        if (!session && currentUserId) {
          setUser(null);
          router.push(ROUTES.SIGNIN);
        }

        // If session user ID changed (new login)
        if (session && sessionUserId && sessionUserId !== currentUserId) {
          setUser(toUserSession(session));
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    // Check session when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        checkSession();
      }
    };

    // Listen for visibility changes instead of polling
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for storage events (cross-tab logout detection)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-logout") {
        setUser(null);
        router.push(ROUTES.SIGNIN);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, router]);

  /**
   * Sign up action
   */
  const handleSignup = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const session = await signUp(email, password);

        // Set flag to skip immediate session check (prevents race condition)
        justAuthenticatedRef.current = true;
        setUser(toUserSession(session));

        // Redirect to dashboard on successful signup
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.SIGNUP_FAILED;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Sign in action
   */
  const handleSignin = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const session = await signIn(email, password);

        // Set flag to skip immediate session check (prevents race condition)
        justAuthenticatedRef.current = true;
        setUser(toUserSession(session));

        // Redirect to dashboard on successful signin
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.SIGNIN_FAILED;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Logout action
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setError(null);

      // Notify other tabs about logout via storage event
      localStorage.setItem("auth-logout", Date.now().toString());
      localStorage.removeItem("auth-logout");

      // Show success message
      // Note: Toast is shown in LogoutButton component before redirect
      // Redirect to signin page
      router.push(ROUTES.SIGNIN);
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      router.push(ROUTES.SIGNIN);
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Session cleared handler - called when 401 occurs
   * Dispatches custom event that other contexts can listen to
   */
  const handleSessionCleared = useCallback(() => {
    setUser(null);
    setError(null);
    setLoading(false);
    closeAllModals();
  }, []);

  /**
   * Session state listener to detect session changes across tabs
   */
  useEffect(() => {
    // Listen for session cleared event
    window.addEventListener("session-cleared", handleSessionCleared);

    return () => {
      window.removeEventListener("session-cleared", handleSessionCleared);
    };
  }, [handleSessionCleared]);

  /**
   * Refresh session action
   */
  const handleRefreshSession = useCallback(async (): Promise<void> => {
    await loadSession();
  }, [loadSession]);

  /**
   * Context value
   */
  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signup: handleSignup,
    signin: handleSignin,
    logout: handleLogout,
    refreshSession: handleRefreshSession,
    sessionCleared: handleSessionCleared,
    openModal,
    closeModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext hook
 * Access authentication context from any component
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
