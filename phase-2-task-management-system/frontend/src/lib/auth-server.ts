/**
 * Better Auth Server Configuration
 *
 * This file configures Better Auth for server-side authentication.
 * It runs on the Next.js frontend server and issues JWT tokens.
 *
 * Architecture:
 * - Better Auth runs on Next.js (port 3000 locally, Vercel in production)
 * - Issues JWT tokens for authenticated users
 * - Exposes JWKS endpoint at /.well-known/jwks.json
 * - Backend (FastAPI) verifies JWT tokens using JWKS
 *
 * URLs:
 * - Local: http://localhost:3000
 * - Production: https://task-management-system-three-ashy.vercel.app
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db-schema";
import { PRODUCTION_URLS } from "./constants";

// Determine base URL based on environment
const getBaseURL = (): string => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_URLS.FRONTEND
    : "http://localhost:3000";
};

export const auth = betterAuth({
  // Database adapter (Drizzle + PostgreSQL)
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  // Base URL for auth endpoints
  baseURL: getBaseURL(),

  // Secret for JWT signing (must match backend)
  secret: process.env.BETTER_AUTH_SECRET,

  // Trusted origins for CORS (required for production)
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    PRODUCTION_URLS.FRONTEND,
    PRODUCTION_URLS.BACKEND,
  ],

  // Logging for debugging
  logger: {
    level: "debug",
    disabled: false,
  },

  // Email & Password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false, // Disable for development
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Advanced configuration
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    database: {
      generateId: "uuid",
    },
  },

  // Plugins
  plugins: [
    nextCookies(), // Automatically handle cookies in Next.js
    jwt(), // Enable JWT token generation and JWKS endpoint
  ],
});

/**
 * Export auth handler for API routes
 * Use this in /api/auth/[...all]/route.ts
 */
export type Auth = typeof auth;

// Default export for Better Auth CLI
export default auth;
