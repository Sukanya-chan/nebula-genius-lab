import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Flame, Lightbulb, Rocket, XCircle } from "lucide-react";
import { generateChallenge } from "@/lib/ai.functions";
import type { Challenge, Difficulty } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/space/AppShell";
import { BrandButton, Chip, ErrorPanel, GlassCard, RequireAuth, Scanning } from "@/components/space/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "AI Space Challenges — HackTheSpace" },
      { name: "description", content: "Gemini-generated astronomy missions with difficulty levels, hints, scoring and progress tracking." },
      { property: "og:title", content: "AI Space Challenges — HackTheSpace" },
      { property: "og:description", content: "Solve AI-generated astronomy missions and climb the ranks." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Module 01 · Challenges" title="AI Space Challenges" subtitle="Each mission is generated live. Hints cost 25% of the points each — use them wisely." />
      <RequireAuth feature="AI challenges">
        <Challenges />
      </RequireAuth>
    </>
  ),
});

const TOPICS = ["Solar System", "Stars & Stellar Evolution", "Black Holes", "Orbital Mechanics", "Exoplanets", "Cosmology", "Space Missions", "Galaxies"];
const LEVELS: { id: Difficulty; label: string }[] = [
  { id: "cadet", label: "Cadet" },
  { id: "pilot", label: "Pilot" },
  { id: "commander", label: "Commander" },
];

type Stats = { total: number; correct: number; points: number; streak: number };

function Challenges() {
  const { user } = useAuth();
  const gen = useServerFn(generateChallenge);
  const [topic, setTopic] = useState<string>(TOPICS[0]!);
  const [level, setLevel] = useState<Difficulty>("cadet");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [hints, setHints] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, points: 0, streak: 0 });

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from("challenge_results").select("correct, points").order("created_at", { ascending: false }).limit(500);
    if (!data) return;
    let streak = 0;
    for (const r of data) { if (r.correct) streak++; else break; }
    setStats({ total: data.length, correct: data.filter((r) => r.correct).length, points: data.reduce((s, r) => s + r.points, 0), streak });
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  async function next() {
    setLoading(true);
    setError(null);
    setPicked(null);
    setHints(0);
    const res = await gen({ data: { topic, difficulty: level, avoid: history.slice(-8) } }).catch(() => ({ ok: false as const, error: "Network error contacting mission control." }));
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    setChallenge(res.data);
    setHistory((h) => [...h, res.data.question.slice(0, 280)]);
  }

  async function answer(i: number) {
    if (!challenge || picked !== null || !user) return;
    setPicked(i);
    const correct = i === challenge.correctIndex;
    const points = correct ? Math.round(challenge.points * Math.max(0.25, 1 - hints * 0.25)) : 0;
    const { error } = await supabase.from("challenge_results").insert({ user_id: user.id, topic, difficulty: level, question: challenge.question.slice(0, 1000), correct, hints_used: hints, points });
    if (!error) loadStats();
  }

  const earned = challenge && picked === challenge.correctIndex ? Math.round(challenge.points * Math.max(0.25, 1 - hints * 0.25)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <GlassCard>
          <p className="label-mono mb-3">Topic</p>
          <div className="flex flex-wrap gap-2">{TOPICS.map((t) => <Chip key={t} active={t === topic} onClick={() => setTopic(t)}>{t}</Chip>)}</div>
          <p className="label-mono mb-3 mt-6">Difficulty</p>
          <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <Chip key={l.id} active={l.id === level} onClick={() => setLevel(l.id)}>{l.label}</Chip>)}</div>
          <BrandButton onClick={next} loading={loading} className="mt-6 w-full"><Rocket className="size-4" /> {challenge ? "Next mission" : "Launch mission"}</BrandButton>
        </GlassCard>
        <GlassCard>
          <p className="label-mono mb-4">Progress</p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Points" value={stats.points} />
            <Stat label="Accuracy" value={stats.total ? `${Math.round((stats.correct / stats.total) * 100)}%` : "—"} />
            <Stat label="Solved" value={`${stats.correct}/${stats.total}`} />
            <Stat label="Streak" value={<span className="flex items-center gap-1">{stats.streak}<Flame className="size-4 text-warning" /></span>} />
          </div>
        </GlassCard>
      </div>

      <GlassCard className="min-h-[420px]">
        {loading ? <Scanning label="Generating mission" /> : error ? <ErrorPanel message={error} onRetry={next} /> : !challenge ? (
          <div className="grid h-full place-items-center py-16 text-center text-muted-foreground">
            <div><Rocket className="mx-auto size-10 text-accent" /><p className="mt-4">Choose a topic and difficulty, then launch your first mission.</p></div>
          </div>
        ) : (
          <div className="fade-up">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label-mono text-accent">{topic} · {level}</p>
              <p className="label-mono">{challenge.points} pts max</p>
            </div>
            <h2 className="mt-3 text-xl font-semibold">{challenge.title}</h2>
            <p className="mt-3 leading-relaxed">{challenge.question}</p>
            <div className="mt-6 grid gap-3">
              {challenge.options.map((o, i) => {
                const isCorrect = picked !== null && i === challenge.correctIndex;
                const isWrong = picked === i && i !== challenge.correctIndex;
                return (
                  <button key={i} disabled={picked !== null} onClick={() => answer(i)}
                    className={cn("flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm transition-colors",
                      picked === null && "hover:border-primary/60",
                      isCorrect && "border-success/70 bg-success/10",
                      isWrong && "border-destructive/70 bg-destructive/10")}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border font-mono text-xs">{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1">{o}</span>
                    {isCorrect && <CheckCircle2 className="size-5 text-success" />}
                    {isWrong && <XCircle className="size-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked === null && challenge.hints.length > 0 && (
              <div className="mt-5">
                {challenge.hints.slice(0, hints).map((h, i) => (
                  <p key={i} className="mb-2 flex gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm"><Lightbulb className="size-4 shrink-0 text-warning" />{h}</p>
                ))}
                {hints < challenge.hints.length && (
                  <button onClick={() => setHints(hints + 1)} className="text-sm text-warning hover:underline">Reveal hint {hints + 1} (−25%)</button>
                )}
              </div>
            )}
            {picked !== null && (
              <div className="fade-up mt-6 rounded-xl border border-border bg-secondary/40 p-4">
                <p className={cn("font-semibold", picked === challenge.correctIndex ? "text-success" : "text-destructive")}>
                  {picked === challenge.correctIndex ? `Mission success · +${earned} pts` : "Mission failed"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{challenge.explanation}</p>
                <BrandButton onClick={next} className="mt-4">Next mission</BrandButton>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <p className="label-mono">{label}</p>
      <p className="mt-1 font-display text-lg">{value}</p>
    </div>
  );
}
