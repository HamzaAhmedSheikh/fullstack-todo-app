"use client";

/**
 * SignupForm Component
 * Premium glass card registration form with animated effects
 * Design: Obsidian Glass - luxurious dark theme with dramatic accents
 */

import React, { useState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, ArrowRight, Sparkles, Check, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { isValidEmail, validatePassword, trimWhitespace } from "@/lib/utils";
import { VALIDATION, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

/**
 * SignupForm component with premium glass card styling
 */
export function SignupForm() {
  const { signup, loading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength indicators
  const passwordLength = password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordStrength = [passwordLength, hasLetter, hasNumber].filter(Boolean).length;

  const validateEmailField = (value: string): boolean => {
    const trimmed = trimWhitespace(value);
    if (!trimmed) {
      setEmailError("Email is required");
      return false;
    }
    if (!isValidEmail(trimmed)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePasswordField = (value: string): boolean => {
    const error = validatePassword(value);
    if (error) {
      setPasswordError(error);
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    const isEmailValid = validateEmailField(email);
    const isPasswordValid = validatePasswordField(password);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      const trimmedEmail = trimWhitespace(email);
      await signup(trimmedEmail, password);
      toast.success(SUCCESS_MESSAGES.SIGNUP_SUCCESS);
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes("already") || message.includes("exists")) {
          setEmailError("Email already registered");
          toast.error("Email already registered");
          return;
        }
        if (message.includes("invalid") || message.includes("validation")) {
          if (message.includes("email")) {
            setEmailError("Invalid email format");
            toast.error("Invalid email format");
          } else if (message.includes("password")) {
            setPasswordError("Password does not meet requirements");
            toast.error("Password does not meet requirements");
          } else {
            toast.error("Please check your input and try again");
          }
          return;
        }
        if (message.includes("server") || message.includes("unavailable")) {
          toast.error("Unable to create account. Please try again later");
          return;
        }
        if (message.includes("network") || message.includes("fetch")) {
          toast.error(ERROR_MESSAGES.NETWORK_ERROR);
          return;
        }
        toast.error(error.message || ERROR_MESSAGES.SIGNUP_FAILED);
      } else {
        toast.error(ERROR_MESSAGES.SIGNUP_FAILED);
      }
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-blur-in">
      {/* Glass card container */}
      <div className="glass-card p-8 sm:p-10">
        {/* Header section */}
        <div className="text-center mb-8 stagger-children">
          {/* Logo icon with glow */}
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-primary shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Start your productivity journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email address
            </label>
            <div className="relative">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === "email" ? "text-primary" : "text-muted"}`}
              >
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => {
                  setFocusedField(null);
                  validateEmailField(email);
                }}
                placeholder="you@example.com"
                className={`premium-input w-full pl-11 ${emailError ? "border-danger focus:border-danger" : ""}`}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            {emailError && (
              <p className="text-sm text-danger flex items-center gap-1.5 animate-slide-up">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-danger/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                </span>
                {emailError}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Password
            </label>
            <div className="relative">
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === "password" ? "text-primary" : "text-muted"}`}
              >
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => {
                  setFocusedField(null);
                  validatePasswordField(password);
                }}
                placeholder="Create a secure password"
                className={`premium-input w-full pl-11 ${passwordError ? "border-danger focus:border-danger" : ""}`}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="space-y-3 pt-2 animate-slide-up">
                {/* Strength bar */}
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= level
                          ? level === 1
                            ? "bg-danger"
                            : level === 2
                              ? "bg-warning"
                              : "bg-success"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>

                {/* Requirements checklist */}
                <div className="space-y-1.5">
                  <RequirementItem
                    met={passwordLength}
                    text={`At least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`}
                  />
                  <RequirementItem met={hasLetter} text="Contains a letter" />
                  <RequirementItem met={hasNumber} text="Contains a number" />
                </div>
              </div>
            )}

            {passwordError && !password.length && (
              <p className="text-sm text-danger flex items-center gap-1.5 animate-slide-up">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-danger/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                </span>
                {passwordError}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="premium-btn premium-btn-primary w-full mt-2 disabled:opacity-50 hover:cursor-pointer disabled:hover:transform-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <p className="hover:text-shadow-white">Create Account</p>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Shield className="h-3.5 w-3.5" />
          <span>Your data is encrypted and secure</span>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs font-medium text-muted-foreground bg-[#0f0f14]">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/signin" className="premium-link inline-flex items-center gap-1 font-medium">
            Sign in instead
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>

      {/* Bottom text */}
      <p className="mt-6 text-center text-xs text-muted-foreground/60">
        By creating an account, you agree to our Terms of Service
      </p>
    </div>
  );
}

/**
 * Password requirement indicator component
 */
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? "text-success" : "text-muted-foreground/60"}`}
    >
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 ${met ? "bg-success/20" : "bg-surface"}`}
      >
        {met ? (
          <Check className="h-2.5 w-2.5" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-muted" />
        )}
      </div>
      <span>{text}</span>
    </div>
  );
}
