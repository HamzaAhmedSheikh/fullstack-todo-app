/**
 * LiveAnnouncer Component
 * Provides aria-live announcements for screen readers
 * Based on: /specs/004-frontend-nextjs-spec/tasks.md (T123)
 */

"use client";

import React, { useState, useCallback } from "react";

type AnnouncementType = "success" | "error" | "info" | "warning";

interface Announcement {
  id: string;
  message: string;
  type: AnnouncementType;
}

/**
 * LiveAnnouncer context for programmatic announcements
 */
const LiveAnnouncerContext = React.createContext<{
  announce: (message: string, type?: AnnouncementType) => void;
}>({
  announce: () => {},
});

/**
 * LiveAnnouncer Provider
 * Wraps the application to provide screen reader announcements
 */
export function LiveAnnouncerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const announce = useCallback((message: string, type: AnnouncementType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setAnnouncements((prev) => [...prev, { id, message, type }]);

    // Clear the announcement after it's been announced
    setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  }, []);

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Hidden live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0",
        }}
      >
        {announcements.map((a) => (
          <div key={a.id} data-type={a.type}>
            {a.message}
          </div>
        ))}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

/**
 * useLiveAnnouncer hook
 * Access the announce function from any component
 */
export function useLiveAnnouncer() {
  const context = React.useContext(LiveAnnouncerContext);
  if (context === undefined) {
    throw new Error("useLiveAnnouncer must be used within LiveAnnouncerProvider");
  }
  return context;
}

/**
 * Task-specific announcement helper
 */
export function useTaskAnnouncer() {
  const { announce } = useLiveAnnouncer();

  return {
    announceTaskCreated: (title: string) =>
      announce(`Task "${title}" has been created`, "success"),
    announceTaskUpdated: (title: string) =>
      announce(`Task "${title}" has been updated`, "success"),
    announceTaskDeleted: (title: string) =>
      announce(`Task "${title}" has been deleted`, "info"),
    announceTaskCompleted: (title: string) =>
      announce(`Task "${title}" marked as complete`, "success"),
    announceTaskIncomplete: (title: string) =>
      announce(`Task "${title}" marked as incomplete`, "info"),
    announceError: (message: string) =>
      announce(`Error: ${message}`, "error"),
    announceSessionExpired: () =>
      announce("Your session has expired. Please sign in again.", "warning"),
  };
}
