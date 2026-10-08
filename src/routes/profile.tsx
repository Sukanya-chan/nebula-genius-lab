import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { CosmicObject } from "@/lib/types";
import { PageHeader } from "@/components/space/AppShell";
import { ErrorPanel, GhostButton, GlassCard, RequireAuth, Scanning } from "@/components/space/common";
import { CelestialVisual } from "@/components/space/CelestialVisual";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Mission Log — HackTheSpace" },
      { name: "description", content: "Your saved worlds, challenge history and quiz scores." },
      { property: "og:title", content: "Mission Log — HackTheSpace" },
      { property: "og:description", content: "Track your HackTheSpace progress." },
    ],
  }),
  component: () => (
    <RequireAuth feature="your mission log">
      <Profile />
    </RequireAuth>
  ),
});

function Profile() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["log", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [p, o, c, s] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user!.id).maybeSingle(),
        supabase.from("generated_objects").select("id, kind, name, data, created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("challenge_results").select("id, topic, difficulty, correct, points, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("quiz_scores").select("id, difficulty, score, total, created_at").order("created_at", { ascending: false }).limit(50),
      ]);
      const err = o.error || c.error || s.error;
      if (err) throw err;
      return { name: p.data?.display_name ?? user!.email, objects: o.data!, challenges: c.data!, quizzes: s.data! };
    },
  });

  async function del(id: string) {
    const { error } = await supabase.from("generated_objects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["log"] }); }
  }

  if (q.isLoading) return <Scanning label="Loading mission log" />;
  if (q.error) return <ErrorPanel message={(q.error as Error).message} onRetry={() => q.refetch()} />;
  const d = q.data!;
  const pts = d.challenges.reduce((a, r) => a + r.points, 0);
  const acc = d.challenges.length ? Math.round((d.challenges.filter((r) => r.correct).length / d.challenges.length) * 100) : 0;
  const best = d.quizzes.reduce((b, r) => Math.max(b, Math.round((r.score / r.total) * 100)), 0);
  const rank = pts >= 5000 ? "Admiral" : pts >= 2000 ? "Commander" : pts >= 600 ? "Pilot" : "Cadet";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader eyebrow={`Rank · ${rank}`} title={d.name ?? "Explorer"} subtitle={user?.email ?? undefined} />
        <GhostButton onClick={async () => { await signOut(); nav({ to: "/" }); }}><LogOut className="size-4" />Sign out</GhostButton>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Challenge points", pts], ["Accuracy", `${acc}%`], ["Worlds forged", d.objects.length], ["Best quiz", d.quizzes.length ? `${best}%` : "—"]].map(([k, v]) => (
          <GlassCard key={k as string}><p className="label-mono">{k}</p><p className="mt-2 font-display text-2xl">{v}</p></GlassCard>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">Saved worlds</h2>
      {d.objects.length === 0 ? <GlassCard className="text-sm text-muted-foreground">No saved objects yet — visit the Generator.</GlassCard> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.objects.map((o) => { const c = o.data as unknown as CosmicObject; return (
            <GlassCard key={o.id} className="relative">
              <button aria-label="Delete" onClick={() => del(o.id)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              <CelestialVisual kind={c.kind} palette={c.palette ?? []} hasRings={c.hasRings} size={110} seed={c.name} />
              <p className="label-mono mt-3 text-accent">{c.classification}</p>
              <p className="mt-1 font-semibold">{o.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.tagline}</p>
            </GlassCard>
          ); })}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent challenges</h2>
          <GlassCard className="divide-y divide-border p-0 sm:p-0">
            {d.challenges.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No challenges attempted yet.</p> : d.challenges.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span><span className={r.correct ? "text-success" : "text-destructive"}>●</span> {r.topic} <span className="text-muted-foreground">· {r.difficulty}</span></span>
                <span className="font-mono text-xs">+{r.points}</span>
              </div>
            ))}
          </GlassCard>
        </div>
        <div>
          <h2 className="mb-4 text-xl font-semibold">Quiz history</h2>
          <GlassCard className="divide-y divide-border p-0 sm:p-0">
            {d.quizzes.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No quizzes taken yet.</p> : d.quizzes.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="capitalize">{r.difficulty}</span>
                <span className="font-mono text-xs">{r.score}/{r.total} · {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
