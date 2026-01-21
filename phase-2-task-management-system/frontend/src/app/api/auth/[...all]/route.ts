/**
 * Better Auth API Route Handler
 *
 * This catch-all route handles all Better Auth endpoints:
 * - POST /api/auth/sign-up/email - User registration
 * - POST /api/auth/sign-in/email - User login
 * - GET  /api/auth/get-session - Get current session
 * - POST /api/auth/sign-out - User logout
 * - GET  /api/auth/.well-known/jwks.json - JWKS for JWT verification
 * - And other Better Auth endpoints...
 *
 * Better Auth automatically creates these endpoints based on the configuration.
 */

import { auth } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

// Export GET and POST handlers
// Better Auth handles routing internally based on the path
export const { GET, POST } = toNextJsHandler(auth);

/**
 * Important: Better Auth uses the path pattern /api/auth/[...all]
 * This means all requests to /api/auth/* are routed here.
 *
 * Examples:
 * - POST /api/auth/sign-up/email → Sign up with email/password
 * - POST /api/auth/sign-in/email → Sign in with email/password
 * - GET  /api/auth/get-session   → Get current session
 * - POST /api/auth/sign-out      → Sign out
 */
