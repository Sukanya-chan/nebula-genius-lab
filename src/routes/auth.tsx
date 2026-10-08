import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { BrandButton, ErrorPanel, GhostButton, GlassCard } from "@/components/space/common";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HackTheSpace" },
      { name: "description", content: "Join the HackTheSpace crew to save your missions, worlds and scores." },
      { property: "og:title", content: "Sign in — HackTheSpace" },
      { property: "og:description", content: "Join the crew and save your progress." },
    ],
  }),
  component: AuthPage,
});

const input =
  "w-full rounded-xl border border-input bg-secondary/60 px-4 py-3 text-sm outline-none transition-colors focus:border-ring";

function AuthPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) nav({ to: "/profile" });
  }, [user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name || email.split("@")[0] } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your inbox to confirm your email, then sign in.");
          setMode("in");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome aboard, commander.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) setError(res.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <GlassCard className="fade-up">
        <p className="label-mono text-accent">Crew access</p>
        <h1 className="mt-2 text-2xl font-semibold">{mode === "in" ? "Welcome back" : "Join the crew"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Save challenges, generated worlds and quiz scores.</p>

        <GhostButton type="button" onClick={google} className="mt-6 w-full py-3">
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.33 0 8.86-3.75 8.86-9.02 0-.6-.07-1.06-.15-1.13Z" /></svg>
          Continue with Google
        </GhostButton>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input className={input} placeholder="Callsign (display name)" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />}
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className={input} type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
          {error && <ErrorPanel message={error} />}
          <BrandButton type="submit" loading={busy} className="w-full py-3">
            {mode === "in" ? "Sign in" : "Create account"}
          </BrandButton>
        </form>
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(null); }} className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-accent">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </GlassCard>
    </div>
  );
}
