"use client";

/**
 * Navbar Component
 * Modern dark-mode navigation bar with brand and user controls
 * Based on: /specs/001-dark-mode-ui/spec.md (US1)
 */

import React from "react";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Container } from "@/components/layout/Container";

/**
 * Truncate username if too long
 */
function truncateUsername(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "...";
}

/**
 * Extract display name from user (prefer name over email)
 */
function getDisplayName(user: { name?: string; email: string }): string {
  if (user.name && user.name.trim()) {
    return truncateUsername(user.name);
  }
  // Fallback to email username part
  const emailPart = user.email.split("@")[0];
  return truncateUsername(emailPart);
}

/**
 * Navbar component with modern dark-mode styling
 * Features: Brand logo, user display name, logout button
 */
export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  // Only show navbar when user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = getDisplayName(user);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <Container maxWidth="xl">
        <div className="flex h-14 items-center justify-between">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-all duration-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              TaskFlow
            </span>
          </Link>

          {/* User info and logout */}
          <div className="flex items-center gap-3">
            {/* User avatar/badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary uppercase">
                {displayName.charAt(0)}
              </div>
              <span
                className="text-sm text-foreground font-medium hidden sm:block"
                title={user.email}
              >
                {displayName}
              </span>
            </div>

            {/* Logout button */}
            <LogoutButton />
          </div>
        </div>
      </Container>
    </nav>
  );
}
