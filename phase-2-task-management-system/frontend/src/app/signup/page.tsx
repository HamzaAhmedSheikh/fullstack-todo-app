/**
 * Signup Page
 * Modern dark-mode registration page with ambient effects
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import { SignupForm } from "@/components/auth/SignupForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata = {
  title: "Create Account - TaskFlow",
  description: "Create a new account to start managing your tasks",
};

/**
 * Signup page with dark-mode ambient background
 */
export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
