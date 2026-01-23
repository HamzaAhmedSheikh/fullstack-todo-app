/**
 * Next.js Proxy
 * Route protection for authenticated pages
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ["/dashboard"];

/**
 * Public routes that redirect to dashboard if already authenticated
 */
const PUBLIC_ROUTES = ["/signin", "/signup"];

/**
 * Check if user has a valid session cookie
 * Better Auth uses different cookie names depending on environment and configuration
 */
function hasSessionCookie(request: NextRequest): boolean {
  // Check for Better Auth session cookies (various naming conventions)
  // - Development: better-auth.session_token
  // - Production with secure cookies: __Secure-better-auth.session_token
  const possibleCookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth.session",
    "__Secure-better-auth.session",
  ];

  // Debug: Log all cookies to help diagnose issues
  const allCookies = request.cookies.getAll();
  console.log("[Proxy] All cookies:", allCookies.map(c => c.name));

  for (const cookieName of possibleCookieNames) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value) {
      console.log("[Proxy] Found session cookie:", cookieName);
      return true;
    }
  }

  console.log("[Proxy] No session cookie found");
  return false;
}

/**
 * Proxy function to protect routes
 * @param request - Next.js request object
 * @returns Next.js response (redirect or continue)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Proxy] Request:", pathname);

  // Check for session cookie
  const isAuthenticated = hasSessionCookie(request);
  console.log("[Proxy] isAuthenticated:", isAuthenticated);

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to signin
  if (isProtectedRoute && !isAuthenticated) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Redirect authenticated users from public routes to dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue to requested route
  return NextResponse.next();
}

/**
 * Proxy configuration
 * Match all routes except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
