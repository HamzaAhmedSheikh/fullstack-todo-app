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
 * Proxy function to protect routes
 * @param request - Next.js request object
 * @returns Next.js response (redirect or continue)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token from cookies (Better Auth stores it as "better-auth.session_token")
  const sessionToken = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionToken;

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
export const proxyConfig = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
