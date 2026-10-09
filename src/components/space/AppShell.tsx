import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Atom, Bot, Compass, Menu, Orbit, Rocket, Telescope, Trophy, User, X, BrainCircuit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { GhostButton } from "@/components/space/common";

export const NAV = [
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/generator", label: "Generator", icon: Atom },
  { to: "/explorer", label: "Explorer", icon: Telescope },
  { to: "/simulator", label: "Simulator", icon: Orbit },
  { to: "/assistant", label: "Assistant", icon: Bot },
  { to: "/quiz", label: "Quiz", icon: BrainCircuit },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="relative grid size-8 place-items-center rounded-lg bg-brand glow">
        <Rocket className="size-4 text-primary-foreground" />
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        HackThe<span className="text-gradient">Space</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen">
      <div className="space-bg">
        <div className="stars" />
        <div className="stars-2" />
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  path.startsWith(n.to) && "bg-secondary text-foreground",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to={user ? "/profile" : "/auth"}
              className="flex items-center gap-2 rounded-lg border border-border bg-glass px-3 py-2 text-sm transition-colors hover:border-primary/50"
            >
              <User className="size-4 text-accent" />
              <span className="hidden sm:inline">{user ? "Mission log" : "Sign in"}</span>
            </Link>
             <GhostButton
               aria-label={open ? "Close menu" : "Open menu"}
               aria-expanded={open}
               aria-controls="mobile-navigation"
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
             </GhostButton>
          </div>
        </div>
        {open && (
           <nav id="mobile-navigation" className="grid grid-cols-2 gap-2 border-t border-border/60 p-4 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-glass px-3 py-3 text-sm",
                  path.startsWith(n.to) && "border-primary/60 text-foreground",
                )}
              >
                <n.icon className="size-4 text-accent" />
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
       <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border/60 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span className="flex items-center gap-2"><Compass className="size-3.5" /> HackTheSpace mission control</span>
        <span className="label-mono">Powered by Gemini</span>
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string | undefined }) {
  return (
    <div className="fade-up mb-8">
      <p className="label-mono mb-3 text-accent">{eyebrow}</p>
       <h1 className="break-words text-3xl font-semibold sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
