import { Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Lock, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("glass p-5 sm:p-6", className)}>{children}</div>;
}

export function BrandButton({
  className,
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground glow transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-glass px-4 py-2.5 text-sm transition-colors hover:border-primary/50 disabled:opacity-50",
        className,
      )}
    />
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="font-medium">Transmission failed</p>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs text-accent hover:underline">
          <RotateCcw className="size-3" /> Retry
        </button>
      )}
    </div>
  );
}

export function Scanning({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
        <div className="absolute inset-3 rounded-full bg-brand opacity-40 blur-md" />
      </div>
      <p className="label-mono">{label}</p>
    </div>
  );
}

export function RequireAuth({ children, feature }: { children: ReactNode; feature: string }) {
  const { user, loading } = useAuth();
  if (loading) return <Scanning label="Verifying credentials" />;
  if (!user)
    return (
      <GlassCard className="mx-auto max-w-md text-center">
        <Lock className="mx-auto size-8 text-accent" />
        <h2 className="mt-4 text-xl font-semibold">Crew access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to use {feature} and save your progress to your mission log.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground glow">
          Sign in or create account
        </Link>
      </GlassCard>
    );
  return <>{children}</>;
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "border-accent/70 bg-accent/15 text-accent" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
