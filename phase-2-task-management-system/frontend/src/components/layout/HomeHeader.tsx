"use client";

/**
 * HomeHeader Component
 * Auth-aware header for the homepage
 * Shows different navigation based on login state
 */

import Link from "next/link";
import { Sparkles, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function HomeHeader() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="relative z-10">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="logo-mark reveal-up">
          <div className="logo-mark-icon">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            TaskFlow
          </span>
        </div>
        <nav className="flex items-center gap-3 reveal-up delay-100">
          {loading ? (
            /* Loading skeleton */
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 bg-surface/50 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-surface/50 rounded-lg animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            /* Authenticated state */
            <>
              <Link
                href="/dashboard"
                className="cosmic-btn cosmic-btn-primary text-sm"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            /* Not authenticated state */
            <>
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="cosmic-btn cosmic-btn-primary text-sm"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
