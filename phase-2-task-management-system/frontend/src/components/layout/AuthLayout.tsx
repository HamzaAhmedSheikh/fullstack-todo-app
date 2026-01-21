/**
 * AuthLayout Component
 * Premium dark-mode auth page layout with dramatic glass effects
 * Design: Obsidian Glass - luxurious, editorial dark theme
 */

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout with premium ambient effects and animated elements
 * Features: Animated gradient border, light rays, grain texture, floating particles
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-bg grain-overlay relative min-h-screen w-full overflow-hidden">
      {/* Animated ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary aurora glow - top */}
        <div
          className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-60"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />

        {/* Accent glow - bottom left */}
        <div
          className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />

        {/* Secondary glow - right */}
        <div
          className="absolute top-1/3 -right-[5%] w-[400px] h-[400px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
            filter: "blur(50px)",
          }}
        />

        {/* Floating particles */}
        <div className="particle top-[20%] left-[15%]" style={{ animationDelay: "0s" }} />
        <div className="particle top-[40%] right-[20%]" style={{ animationDelay: "2s" }} />
        <div className="particle bottom-[30%] left-[25%]" style={{ animationDelay: "4s" }} />
        <div className="particle top-[60%] right-[30%]" style={{ animationDelay: "6s" }} />
        <div className="particle bottom-[20%] right-[15%]" style={{ animationDelay: "1s", background: "rgba(139, 92, 246, 0.4)" }} />
        <div className="particle top-[30%] left-[40%]" style={{ animationDelay: "3s", background: "rgba(59, 130, 246, 0.4)" }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="subtle-grid absolute inset-0 pointer-events-none" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(3, 3, 5, 0.6) 100%)",
        }}
      />

      {/* Top navigation bar */}
      <header className="relative z-20">
        <div className="container mx-auto px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group transition-all duration-300 hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              TaskFlow
            </span>
          </Link>
        </div>
      </header>

      {/* Main content area with centered card */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 pb-12">
        {/* Spotlight behind the card */}
        <div className="spotlight absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Content */}
        {children}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
