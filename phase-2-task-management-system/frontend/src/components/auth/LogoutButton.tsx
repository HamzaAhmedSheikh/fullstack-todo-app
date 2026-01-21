"use client";

/**
 * LogoutButton Component
 * Modern dark-mode logout button with icon
 * Based on: /specs/001-dark-mode-ui/spec.md (US1)
 */

import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { SUCCESS_MESSAGES } from "@/lib/constants";

/**
 * LogoutButton component with icon and loading state
 * Features: LogOut icon, hover effects, loading spinner
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();

      // Success toast (redirect happens automatically in AuthContext)
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      // Even if logout fails, the AuthContext will clear local state and redirect
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      loading={isLoading}
      disabled={isLoading}
      aria-label="Log out"
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
