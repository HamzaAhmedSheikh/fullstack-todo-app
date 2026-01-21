/**
 * Dashboard Page
 * Main dashboard page for authenticated users
 * Based on: /specs/004-frontend-nextjs-spec/tasks.md (T049-T075)
 */

import { TaskProvider } from "@/context/TaskContext";
import { DashboardContent } from "@/app/dashboard/DashboardContent";

export const metadata = {
  title: "Dashboard - Task Management",
  description: "Manage your tasks and stay organized",
};

export default function DashboardPage() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
}
