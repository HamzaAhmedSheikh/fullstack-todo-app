/**
 * Better Auth Configuration
 * JWT-based authentication with session management
 * Based on: /specs/004-frontend-nextjs-spec/research.md
 */

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Initialize Better Auth client
 * Points to the Next.js API routes where Better Auth server runs
 * Includes jwtClient plugin for retrieving JWT tokens for backend API calls
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    jwtClient(), // Enables authClient.token() for JWT retrieval
  ],
});

/**
 * User type from Better Auth
 */
export interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Session data from Better Auth (from getSession)
 */
export interface SessionData {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string; // JWT token from Better Auth JWT plugin
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Full session response from getSession endpoint
 * Structure: { session: {...}, user: {...} }
 */
export interface Session {
  user: BetterAuthUser;
  session: SessionData;
}

/**
 * Auth response from sign-in/sign-up endpoints
 * Structure: { token, user, redirect? }
 */
export interface AuthResponse {
  token: string;
  user: BetterAuthUser;
  redirect?: boolean;
}

/**
 * Export Session as BetterAuthSession for compatibility
 */
export type BetterAuthSession = Session;

/**
 * Check if user is authenticated
 *
 * @returns Promise with session data or null if not authenticated
 *
 * @example
 * const session = await getSession();
 * if (session) {
 *   console.log('User:', session.user.email);
 * }
 */
export async function getSession(): Promise<Session | null> {
  console.debug("[auth.ts] getSession called");
  const { data, error } = await authClient.getSession();

  console.debug("[auth.ts] getSession response:", { data, error });

  if (error) {
    // Handle different error scenarios
    if (error.status === 401) {
      // Not authenticated - this is expected
      console.debug("[auth.ts] getSession - not authenticated (401)");
      return null;
    }

    // Log unexpected errors for debugging
    console.error("Session fetch error:", error.message);
    return null;
  }

  // Log session structure for debugging
  if (data) {
    console.debug("[auth.ts] getSession - session data structure:", {
      hasUser: !!data.user,
      hasSession: !!(data as Session).session,
      sessionToken: (data as Session).session?.token ? "present" : "missing",
      userId: data.user?.id,
    });
  }

  return data as Session | null;
}

/**
 * Sign up a new user with email and password
 *
 * @param email - User email address
 * @param password - Password (min 8 characters, max 128 by default)
 * @param name - Optional display name (defaults to email username)
 * @returns Promise with auth response (token and user)
 * @throws Error if signup fails
 *
 * @example
 * try {
 *   const response = await signUp('user@example.com', 'password123', 'John Doe');
 *   console.log('Signed up:', response.user.email);
 * } catch (error) {
 *   console.error('Signup failed:', error.message);
 * }
 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0],
  });

  if (error) {
    throw new Error(error.message || "Signup failed");
  }

  if (!data) {
    throw new Error("Signup failed: No data returned");
  }

  return data as AuthResponse;
}

/**
 * Sign in an existing user with email and password
 *
 * @param email - User email address
 * @param password - User password
 * @param rememberMe - Keep user signed in (default: true)
 * @returns Promise with auth response (token and user)
 * @throws Error if sign in fails
 *
 * @example
 * try {
 *   const response = await signIn('user@example.com', 'password123');
 *   console.log('Signed in:', response.user.email);
 * } catch (error) {
 *   console.error('Sign in failed:', error.message);
 * }
 */
export async function signIn(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<AuthResponse> {
  console.debug("[auth.ts] signIn called for:", email);

  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
      rememberMe,
    },
    {
      onError: (ctx) => {
        // Handle email verification requirement
        if (ctx.error.status === 403) {
          throw new Error("Please verify your email address before signing in");
        }
      },
    }
  );

  console.debug("[auth.ts] signIn response:", {
    hasData: !!data,
    hasError: !!error,
    dataKeys: data ? Object.keys(data) : [],
    hasToken: !!(data as AuthResponse)?.token,
    hasUser: !!(data as AuthResponse)?.user,
  });

  if (error) {
    // console.error("[auth.ts] signIn error:", error);
    throw new Error(error.message || "Sign in failed");
  }

  if (!data) {
    throw new Error("Sign in failed: No data returned");
  }

  // Log the full response structure for debugging
  console.debug("[auth.ts] signIn data structure:", JSON.stringify(data, null, 2));

  return data as AuthResponse;
}

/**
 * Sign out the current user
 * Clears session cookies and invalidates the session
 *
 * @param redirectUrl - Optional URL to redirect after sign out
 * @returns Promise that resolves when sign out is complete
 *
 * @example
 * await signOut('/login');
 */
export async function signOut(redirectUrl?: string): Promise<void> {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        if (redirectUrl && typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      },
    },
  });
}

/**
 * Send verification email to user
 *
 * @param email - User email address
 * @param callbackURL - URL to redirect after verification
 * @returns Promise that resolves when email is sent
 * @throws Error if sending fails
 *
 * @example
 * await sendVerificationEmail('user@example.com', '/dashboard');
 */
export async function sendVerificationEmail(
  email: string,
  callbackURL: string = "/"
): Promise<void> {
  const { error } = await authClient.sendVerificationEmail({
    email,
    callbackURL,
  });

  if (error) {
    throw new Error(error.message || "Failed to send verification email");
  }
}

/**
 * Request password reset for a user
 *
 * @param email - User email address
 * @param redirectTo - URL to redirect for password reset
 * @returns Promise that resolves when reset email is sent
 * @throws Error if request fails
 *
 * @example
 * await requestPasswordReset('user@example.com', '/reset-password');
 */
export async function requestPasswordReset(
  email: string,
  redirectTo: string = "/reset-password"
): Promise<void> {
  // @ts-expect-error - forgotPassword method requires email plugin in Better Auth
  const { error } = await authClient.forgotPassword({
    email,
    redirectTo,
  });

  if (error) {
    throw new Error(error.message || "Failed to request password reset");
  }
}

/**
 * Reset password with token
 *
 * @param newPassword - New password to set
 * @param token - Reset token from email link
 * @returns Promise that resolves when password is reset
 * @throws Error if reset fails
 *
 * @example
 * const token = new URLSearchParams(window.location.search).get('token');
 * if (token) {
 *   await resetPassword('newPassword123', token);
 * }
 */
export async function resetPassword(newPassword: string, token: string): Promise<void> {
  const { error } = await authClient.resetPassword({
    newPassword,
    token,
  });

  if (error) {
    throw new Error(error.message || "Failed to reset password");
  }
}

/**
 * Change password for authenticated user
 *
 * @param currentPassword - Current password
 * @param newPassword - New password to set
 * @param revokeOtherSessions - Invalidate all other sessions (default: false)
 * @returns Promise that resolves when password is changed
 * @throws Error if change fails
 *
 * @example
 * await changePassword('oldPass123', 'newPass123', true);
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  revokeOtherSessions: boolean = false
): Promise<void> {
  const { error } = await authClient.changePassword({
    newPassword,
    currentPassword,
    revokeOtherSessions,
  });

  if (error) {
    throw new Error(error.message || "Failed to change password");
  }
}

/**
 * Utility: Get JWT token from Better Auth for backend API calls
 * Uses the jwtClient plugin's token() method to retrieve JWT
 *
 * @returns JWT token string or null
 *
 * @example
 * const token = await getToken();
 * if (token) {
 *   headers['Authorization'] = `Bearer ${token}`;
 * }
 */
export async function getToken(): Promise<string | null> {
  try {
    console.debug("[auth.ts] getToken called - using authClient.token()");

    // Use the JWT client plugin to get the token
    const { data, error } = await authClient.token();

    if (error) {
      console.error("[auth.ts] getToken error:", error);
      return null;
    }

    const token = data?.token || null;
    console.debug("[auth.ts] getToken result:", {
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 30) + "..." : "null",
    });

    return token;
  } catch (error) {
    console.error("[auth.ts] getToken exception:", error);
    return null;
  }
}

/**
 * Utility: Extract user ID from session
 *
 * @param session - Better Auth session or null
 * @returns User ID string or null
 *
 * @example
 * const session = await getSession();
 * const userId = getUserId(session);
 */
export function getUserId(session: Session | null): string | null {
  return session?.user?.id || null;
}

/**
 * Utility: Extract user email from session
 *
 * @param session - Better Auth session or null
 * @returns User email string or null
 */
export function getUserEmail(session: Session | null): string | null {
  return session?.user?.email || null;
}

/**
 * Utility: Check if user email is verified
 *
 * @param session - Better Auth session or null
 * @returns Boolean indicating verification status
 */
export function isEmailVerified(session: Session | null): boolean {
  return session?.user?.emailVerified || false;
}

/**
 * Utility: Check if session is valid (not expired)
 *
 * @param session - Better Auth session or null
 * @returns Boolean indicating if session is still valid
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;

  const expiresAt = new Date(session.session.expiresAt);
  return expiresAt > new Date();
}
