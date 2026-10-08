import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { buildQuiz, type QuizLevel, type QuizQuestion } from "@/lib/quiz-bank";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/space/AppShell";
import { BrandButton, Chip, GhostButton, GlassCard } from "@/components/space/common";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Astronomy Quiz — HackTheSpace" },
      { name: "description", content: "Randomized astronomy quizzes with three difficulty levels, scoring and explanations." },
      { property: "og:title", content: "Astronomy Quiz — HackTheSpace" },
      { property: "og:description", content: "Test your cosmic knowledge." },
    ],
  }),
  component: Quiz,
});

const LEVELS: (QuizLevel | "mixed")[] = ["easy", "medium", "hard", "mixed"];

function Quiz() {
  const { user } = useAuth();
  const [level, setLevel] = useState<QuizLevel | "mixed">("easy");
  const [qs, setQs] = useState<QuizQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function start() { setQs(buildQuiz(level, 8)); setI(0); setPicked(null); setScore(0); setDone(false); }

  async function next() {
    if (!qs) return;
    if (i + 1 < qs.length) { setI(i + 1); setPicked(null); return; }
    setDone(true);
    if (user) {
      const { error } = await supabase.from("quiz_scores").insert({ user_id: user.id, difficulty: level, score, total: qs.length });
      if (error) toast.error("Score not saved: " + error.message); else toast.success("Score saved to your mission log");
    }
  }

  function pick(k: number) {
    if (picked !== null || !qs) return;
    setPicked(k);
    if (k === qs[i]!.answer) setScore((s) => s + 1);
  }

  return (
    <div>
      <PageHeader eyebrow="Module 06 · Training" title="Astronomy Quiz" subtitle="Eight randomized questions. Answers are shuffled every run." />
      <div className="mx-auto max-w-2xl">
        {!qs || done ? (
          <GlassCard className="text-center">
            {done && qs && (
              <div className="mb-6">
                <p className="label-mono">Final score</p>
                <p className="mt-2 font-display text-5xl text-gradient">{score}/{qs.length}</p>
                <p className="mt-2 text-muted-foreground">{score === qs.length ? "Flawless. Mission commander material." : score >= qs.length * 0.6 ? "Solid flight. Keep training." : "Back to the simulator, cadet."}</p>
                {!user && <p className="mt-3 text-sm"><Link to="/auth" className="text-accent hover:underline">Sign in</Link> to save your scores.</p>}
              </div>
            )}
            <p className="label-mono mb-3">Difficulty</p>
            <div className="flex flex-wrap justify-center gap-2">{LEVELS.map((l) => <Chip key={l} active={level === l} onClick={() => setLevel(l)}><span className="capitalize">{l}</span></Chip>)}</div>
            <BrandButton onClick={start} className="mt-6">{done ? "Play again" : "Start quiz"}</BrandButton>
          </GlassCard>
        ) : (
          <GlassCard className="fade-up" key={i}>
            <div className="flex items-center justify-between">
              <p className="label-mono">Question {i + 1} / {qs.length}</p>
              <p className="label-mono text-accent">Score {score}</p>
            </div>
            <div className="mt-3 h-1 rounded-full bg-secondary"><div className="h-1 rounded-full bg-brand transition-all" style={{ width: `${((i + (picked !== null ? 1 : 0)) / qs.length) * 100}%` }} /></div>
            <h2 className="mt-6 text-lg font-semibold sm:text-xl">{qs[i]!.q}</h2>
            <div className="mt-5 grid gap-3">
              {qs[i]!.options.map((o, k) => {
                const ok = picked !== null && k === qs[i]!.answer;
                const bad = picked === k && k !== qs[i]!.answer;
                return (
                  <button key={k} onClick={() => pick(k)} disabled={picked !== null}
                    className={cn("flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm", picked === null && "hover:border-primary/60", ok && "border-success/70 bg-success/10", bad && "border-destructive/70 bg-destructive/10")}>
                    <span className="flex-1">{o}</span>{ok && <CheckCircle2 className="size-5 text-success" />}{bad && <XCircle className="size-5 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="fade-up mt-5 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                <p className="text-muted-foreground">{qs[i]!.why}</p>
                <div className="mt-4 flex gap-2"><BrandButton onClick={next}>{i + 1 < qs.length ? "Next question" : "See results"}</BrandButton><GhostButton onClick={() => setQs(null)}>Quit</GhostButton></div>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
