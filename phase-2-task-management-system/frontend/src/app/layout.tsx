/**
 * Root Layout
 * Application-wide layout with providers and metadata
 * Based on: /specs/004-frontend-nextjs-spec/plan.md
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Task Management System",
  description: "Manage your tasks efficiently with our full-stack task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
      >
        <OfflineBanner />
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors duration={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}
