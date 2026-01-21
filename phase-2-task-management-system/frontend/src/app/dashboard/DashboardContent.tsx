"use client";

/**
 * DashboardContent Component
 * Premium dark-mode dashboard with refined visual hierarchy
 * Design: Obsidian Glass - luxurious, polished task management interface
 */

import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { TaskList } from "@/components/tasks/TaskList";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { DeleteConfirmDialog } from "@/components/tasks/DeleteConfirmDialog";
import { Plus, Sparkles, CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTasks } from "@/hooks/useTasks";
import { useSessionSync } from "@/hooks/useSessionSync";
import { useAuth } from "@/hooks/useAuth";

/**
 * Dashboard page component with premium styling
 * Features: Stats overview, ambient effects, refined task list
 */
export function DashboardContent() {
  const { tasks, openCreateModal, deleteConfirmTask, closeDeleteConfirm } = useTasks();
  const { user } = useAuth();

  // Sync session state across browser tabs
  useSessionSync();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get display name from user email
  const firstName = user?.email?.split("@")[0] || "there";

  return (
    <div className="dashboard-bg">
      <Navbar />

      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[20%] right-[10%] w-[600px] h-[600px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[10%] -left-[10%] w-[400px] h-[400px] opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Main content area */}
      <main className="relative z-10 pb-24">
        <Container maxWidth="xl" className="py-8 sm:py-10">
          {/* Welcome header */}
          <header className="mb-10 animate-blur-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                {/* Greeting badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
                  <Sparkles className="h-3 w-3" />
                  <span>{getGreeting()}</span>
                </div>

                {/* Main heading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
                  Welcome back, <span className="text-gradient-primary">{firstName}</span>
                </h1>
                <p className="text-muted-foreground">
                  {pendingTasks > 0
                    ? `You have ${pendingTasks} task${pendingTasks === 1 ? "" : "s"} waiting for you`
                    : totalTasks > 0
                    ? "All caught up! Great job"
                    : "Let's get started on your first task"}
                </p>
              </div>

              {/* Desktop create button */}
              <Button
                variant="primary"
                onClick={openCreateModal}
                className="hidden sm:flex shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
          </header>

          {/* Stats grid */}
          {totalTasks > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
              <StatCard
                icon={<Target className="h-5 w-5" />}
                label="Total Tasks"
                value={totalTasks}
                iconColor="text-primary"
                iconBg="bg-primary/10"
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Completed"
                value={completedTasks}
                iconColor="text-success"
                iconBg="bg-success/10"
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label="Pending"
                value={pendingTasks}
                iconColor="text-warning"
                iconBg="bg-warning/10"
              />
              <StatCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Completion"
                value={`${completionRate}%`}
                iconColor="text-purple-400"
                iconBg="bg-purple-400/10"
                progress={completionRate}
              />
            </div>
          )}

          {/* Section title for task list */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Your Tasks
              {pendingTasks > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({pendingTasks} remaining)
                </span>
              )}
            </h2>
          </div>

          {/* Task list */}
          <TaskList />
        </Container>
      </main>

      {/* Mobile floating action button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <button
          onClick={openCreateModal}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Create new task"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Modals */}
      <CreateTaskModal />
      <EditTaskModal />

      {/* Delete confirmation dialog */}
      {deleteConfirmTask && (
        <DeleteConfirmDialog
          taskId={deleteConfirmTask.id}
          taskTitle={deleteConfirmTask.title}
          isOpen={true}
          onClose={closeDeleteConfirm}
        />
      )}
    </div>
  );
}

/**
 * Stats card component with gradient border
 */
function StatCard({
  icon,
  label,
  value,
  iconColor,
  iconBg,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor: string;
  iconBg: string;
  progress?: number;
}) {
  return (
    <div className="stats-card p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
