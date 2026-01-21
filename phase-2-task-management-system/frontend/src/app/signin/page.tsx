/**
 * Signin Page
 * Modern dark-mode authentication page with ambient effects
 * Based on: /specs/001-dark-mode-ui/spec.md
 */

import { SigninForm } from "@/components/auth/SigninForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata = {
  title: "Sign In - TaskFlow",
  description: "Sign in to access your task management dashboard",
};

/**
 * Signin page with dark-mode ambient background
 */
export default function SigninPage() {
  return (
    <AuthLayout>
      <SigninForm />
    </AuthLayout>
  );
}
