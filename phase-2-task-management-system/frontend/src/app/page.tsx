/**
 * Home Page
 * Cosmic-themed landing page with dramatic visual design
 * Based on: /specs/004-frontend-nextjs-spec/spec.md
 */

import Link from "next/link";
import { CheckCircle, Shield, Zap, Sparkles, ArrowRight, Check, ListTodo, Target, Clock, Rocket, Star, Users } from "lucide-react";
import { HomeHeader } from "@/components/layout/HomeHeader";

export default function HomePage() {
  return (
    <div className="cosmic-bg min-h-screen">
      {/* Decorative orbs */}
      <div className="orb orb-primary w-[600px] h-[600px] -top-[200px] -left-[200px] opacity-60" />
      <div className="orb orb-accent w-[500px] h-[500px] top-[40%] -right-[150px] opacity-40" />
      <div className="orb orb-primary w-[400px] h-[400px] bottom-[10%] left-[20%] opacity-30" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Header */}
      <HomeHeader />

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Productivity reimagined</span>
              </div>

              {/* Headline */}
              <h1 className="reveal-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                Where tasks
                <br />
                <span className="shimmer-text">become done</span>
              </h1>

              {/* Subheadline */}
              <p className="reveal-up delay-200 text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
                A beautifully simple task manager that helps you focus on what
                matters. Secure, fast, and designed for the way you work.
              </p>

              {/* CTA Buttons */}
              <div className="reveal-up delay-300 flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup" className="cosmic-btn cosmic-btn-primary">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/signin" className="cosmic-btn cosmic-btn-secondary">
                  Sign in to your account
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="reveal-up delay-400 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>Setup in 30s</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Task Preview */}
            <div className="relative lg:pl-8 reveal-scale delay-400">
              {/* Main task card */}
              <div className="task-preview p-6 float-gentle">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Today&apos;s Focus</h3>
                  <span className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-md">
                    3 of 5 done
                  </span>
                </div>

                {/* Task items */}
                <div className="space-y-3">
                  <TaskPreviewItem completed title="Review project proposal" />
                  <TaskPreviewItem completed title="Send weekly update email" />
                  <TaskPreviewItem completed title="Update documentation" />
                  <TaskPreviewItem title="Prepare presentation slides" />
                  <TaskPreviewItem title="Schedule team meeting" />
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily progress</span>
                    <span className="text-foreground font-medium">60%</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -top-4 -right-4 task-preview px-4 py-3 float-slow delay-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Task completed!</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </div>

              {/* Stats badge */}
              <div className="absolute -bottom-6 -left-4 task-preview px-5 py-3 float-gentle delay-400">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="stat-value text-2xl font-bold">127</div>
                    <div className="text-xs text-muted-foreground">Tasks done</div>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <div className="stat-value text-2xl font-bold">98%</div>
                    <div className="text-xs text-muted-foreground">On time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider line */}
        <div className="hero-line w-full" />

        {/* Features Section */}
        <section className="container mx-auto px-6 py-24 relative">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
              <Star className="h-3.5 w-3.5" />
              <span>Powerful Features</span>
            </div>
            <h2 className="reveal-up delay-100 text-4xl sm:text-5xl font-bold text-foreground mb-5">
              Built for focus,{" "}
              <span className="text-gradient-primary">designed for you</span>
            </h2>
            <p className="reveal-up delay-200 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Everything you need to capture, organize, and complete your tasks — nothing you don&apos;t.
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 - Quick Capture */}
            <ObservatoryCard
              number="01"
              icon={<Zap className="h-7 w-7" />}
              iconColor="from-amber-400 via-orange-500 to-red-500"
              title="Quick Capture"
              description="Add tasks in seconds with our streamlined input. No friction, no distractions — just type and go."
              highlights={["Instant task creation", "Smart defaults"]}
              delay="delay-200"
            />

            {/* Feature 2 - Smart Organization */}
            <ObservatoryCard
              number="02"
              icon={<ListTodo className="h-7 w-7" />}
              iconColor="from-emerald-400 via-teal-500 to-cyan-500"
              title="Smart Organization"
              description="Keep your tasks organized with intuitive lists. Filter by status, sort by priority, and find anything instantly."
              highlights={["Filter & sort", "Status tracking"]}
              delay="delay-300"
            />

            {/* Feature 3 - Progress Tracking */}
            <ObservatoryCard
              number="03"
              icon={<Target className="h-7 w-7" />}
              iconColor="from-violet-400 via-purple-500 to-fuchsia-500"
              title="Progress Tracking"
              description="Watch your productivity soar with visual progress indicators. Celebrate every completed task."
              highlights={["Visual progress", "Completion stats"]}
              delay="delay-400"
            />

            {/* Feature 4 - Secure & Private */}
            <ObservatoryCard
              number="04"
              icon={<Shield className="h-7 w-7" />}
              iconColor="from-blue-400 via-indigo-500 to-violet-500"
              title="Secure & Private"
              description="Your data is protected with enterprise-grade JWT authentication. Your tasks stay yours — always."
              highlights={["JWT auth", "Data isolation"]}
              delay="delay-500"
            />

            {/* Feature 5 - Real-time Sync */}
            <ObservatoryCard
              number="05"
              icon={<Clock className="h-7 w-7" />}
              iconColor="from-rose-400 via-pink-500 to-purple-500"
              title="Real-time Sync"
              description="Changes save instantly. Pick up exactly where you left off, whether on desktop or mobile."
              highlights={["Instant save", "Cross-device"]}
              delay="delay-600"
            />

            {/* Feature 6 - Built for Speed */}
            <ObservatoryCard
              number="06"
              icon={<Rocket className="h-7 w-7" />}
              iconColor="from-cyan-400 via-blue-500 to-indigo-500"
              title="Lightning Fast"
              description="Built with Next.js 16 for blazing performance. Every interaction feels instant and responsive."
              highlights={["Sub-second loads", "Smooth UI"]}
              delay="delay-700"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="portal-cta py-20 px-8 md:px-16 text-center reveal-scale relative">
            {/* Star field background */}
            <div className="star-field">
              <div className="star" style={{ top: '15%', left: '10%', animationDelay: '0s' }} />
              <div className="star" style={{ top: '25%', left: '85%', animationDelay: '0.5s' }} />
              <div className="star star-lg" style={{ top: '60%', left: '15%', animationDelay: '1s' }} />
              <div className="star" style={{ top: '70%', left: '75%', animationDelay: '1.5s' }} />
              <div className="star star-lg" style={{ top: '20%', left: '50%', animationDelay: '2s' }} />
              <div className="star" style={{ top: '80%', left: '40%', animationDelay: '0.8s' }} />
              <div className="star" style={{ top: '45%', left: '5%', animationDelay: '1.2s' }} />
              <div className="star star-lg" style={{ top: '35%', left: '92%', animationDelay: '0.3s' }} />
            </div>

            {/* Concentric rings */}
            <div className="ring-container hidden md:block">
              <div className="concentric-ring ring-1" />
              <div className="concentric-ring ring-2" />
              <div className="concentric-ring ring-3" />
            </div>

            {/* Ambient glow */}
            <div className="cta-glow" />

            {/* Horizon line */}
            <div className="horizon-line" />
            <div className="horizon-sweep" />

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Badge */}
              <div className="cta-badge mx-auto mb-8 w-fit">
                <Users className="h-4 w-4" />
                <span>Join 10,000+ productive people</span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Ready to get{" "}
                <span className="shimmer-text">organized?</span>
              </h2>

              {/* Subtext */}
              <p className="text-muted-foreground text-lg sm:text-xl mb-10 leading-relaxed max-w-lg mx-auto">
                Transform chaos into clarity. Start managing your tasks the smart way — it&apos;s free forever.
              </p>

              {/* CTA Button */}
              <Link href="/signup" className="launch-btn mb-10">
                <Rocket className="h-5 w-5" />
                Launch Your Productivity
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                <div className="trust-float">
                  <Check className="trust-icon" />
                  <span>Free forever</span>
                </div>
                <div className="trust-float">
                  <Check className="trust-icon" />
                  <span>No credit card</span>
                </div>
                <div className="trust-float">
                  <Check className="trust-icon" />
                  <span>Setup in 30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="logo-mark">
            <div className="logo-mark-icon w-6 h-6">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">TaskFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskFlow. Crafted with care.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Task preview item component */
function TaskPreviewItem({ completed = false, title }: { completed?: boolean; title: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors group">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed
            ? "bg-success border-success"
            : "border-border group-hover:border-primary/50"
        }`}
      >
        {completed && <Check className="h-3 w-3 text-white" />}
      </div>
      <span
        className={`text-sm ${
          completed ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

/* Observatory feature card component */
function ObservatoryCard({
  number,
  icon,
  iconColor,
  title,
  description,
  highlights,
  delay,
}: {
  number: string;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  highlights: string[];
  delay: string;
}) {
  return (
    <div className={`observatory-card hex-pattern p-8 reveal-up ${delay}`}>
      {/* Scanline effect */}
      <div className="scanline" />

      {/* Feature number */}
      <div className="feature-number">{number}</div>

      {/* Feature icon */}
      <div className="orbital-icon mb-6">
        <div
          className={`icon-core bg-gradient-to-br ${iconColor} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed mb-5">{description}</p>

      {/* Highlight tags */}
      <div className="flex flex-wrap gap-2">
        {highlights.map((highlight, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <Check className="h-3 w-3" />
            {highlight}
          </span>
        ))}
      </div>
    </div>
  );
}
