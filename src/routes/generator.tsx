import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateCosmicObject } from "@/lib/ai.functions";
import type { CosmicObject } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/space/AppShell";
import { BrandButton, Chip, ErrorPanel, GhostButton, GlassCard, RequireAuth, Scanning } from "@/components/space/common";
import { CelestialVisual } from "@/components/space/CelestialVisual";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Planet & Star Generator — HackTheSpace" },
      { name: "description", content: "Generate scientifically plausible planets and stars with Gemini from your own parameters." },
      { property: "og:title", content: "Planet & Star Generator — HackTheSpace" },
      { property: "og:description", content: "Forge new worlds and suns with AI." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Module 02 · Forge" title="Planet & Star Generator" subtitle="Tune the physical parameters. Gemini builds a consistent world around them." />
      <RequireAuth feature="the generator">
        <Generator />
      </RequireAuth>
    </>
  ),
});

const PLANET_TYPES = ["Rocky", "Ocean", "Gas giant", "Ice giant", "Lava", "Desert"];
const STAR_CLASSES = ["O", "B", "A", "F", "G", "K", "M"];
const STAGES = ["Protostar", "Main sequence", "Red giant", "Supergiant", "White dwarf", "Neutron star"];

function Generator() {
  const { user } = useAuth();
  const gen = useServerFn(generateCosmicObject);
  const [kind, setKind] = useState<"planet" | "star">("planet");
  const [ptype, setPtype] = useState("Rocky");
  const [mass, setMass] = useState(1);
  const [dist, setDist] = useState(1);
  const [starClass, setStarClass] = useState("G");
  const [stage, setStage] = useState("Main sequence");
  const [age, setAge] = useState(4.6);
  const [rings, setRings] = useState(false);
  const [result, setResult] = useState<CosmicObject | null>(null);
  const [params, setParams] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    const p = kind === "planet"
      ? { type: ptype, massEarths: mass, orbitAU: dist, rings, hostStar: `${starClass}-type` }
      : { spectralClass: starClass, stage, ageBillionYears: age, massSolar: mass };
    setParams(p);
    setLoading(true); setError(null); setSaved(false);
    const res = await gen({ data: { kind, params: p } }).catch(() => ({ ok: false as const, error: "Network error contacting the forge." }));
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setResult(res.data);
  }

  async function save() {
    if (!result || !user) return;
    setSaving(true);
    const { error } = await supabase.from("generated_objects").insert({ user_id: user.id, kind: result.kind, name: result.name, params, data: JSON.parse(JSON.stringify(result)) });
    setSaving(false);
    if (error) toast.error("Could not save: " + error.message);
    else { setSaved(true); toast.success(`${result.name} saved to your mission log`); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <GlassCard className="space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border p-1">
          {(["planet", "star"] as const).map((k) => (
            <button key={k} onClick={() => { setKind(k); setMass(1); }} className={`rounded-lg py-2 text-sm capitalize ${kind === k ? "bg-brand text-primary-foreground" : "text-muted-foreground"}`}>{k}</button>
          ))}
        </div>
        {kind === "planet" ? (
          <>
            <Field label="Planet type"><div className="flex flex-wrap gap-2">{PLANET_TYPES.map((t) => <Chip key={t} active={ptype === t} onClick={() => setPtype(t)}>{t}</Chip>)}</div></Field>
            <Field label={`Mass · ${mass.toFixed(1)} M⊕`}><Slider min={0.1} max={300} step={0.1} value={[mass]} onValueChange={(v) => setMass(v[0] ?? 0)} /></Field>
            <Field label={`Orbital distance · ${dist.toFixed(2)} AU`}><Slider min={0.02} max={40} step={0.01} value={[dist]} onValueChange={(v) => setDist(v[0] ?? 0)} /></Field>
            <Field label="Host star class"><div className="flex flex-wrap gap-2">{STAR_CLASSES.map((t) => <Chip key={t} active={starClass === t} onClick={() => setStarClass(t)}>{t}</Chip>)}</div></Field>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={rings} onChange={(e) => setRings(e.target.checked)} className="size-4 accent-[var(--cyan)]" /> Ring system</label>
          </>
        ) : (
          <>
            <Field label="Spectral class"><div className="flex flex-wrap gap-2">{STAR_CLASSES.map((t) => <Chip key={t} active={starClass === t} onClick={() => setStarClass(t)}>{t}</Chip>)}</div></Field>
            <Field label="Evolutionary stage"><div className="flex flex-wrap gap-2">{STAGES.map((t) => <Chip key={t} active={stage === t} onClick={() => setStage(t)}>{t}</Chip>)}</div></Field>
            <Field label={`Mass · ${mass.toFixed(2)} M☉`}><Slider min={0.08} max={60} step={0.01} value={[mass]} onValueChange={(v) => setMass(v[0] ?? 0)} /></Field>
            <Field label={`Age · ${age.toFixed(1)} billion years`}><Slider min={0.001} max={13} step={0.1} value={[age]} onValueChange={(v) => setAge(v[0] ?? 0)} /></Field>
          </>
        )}
        <BrandButton onClick={run} loading={loading} className="w-full"><Wand2 className="size-4" /> Generate {kind}</BrandButton>
      </GlassCard>

      <GlassCard className="min-h-[480px]">
        {loading ? <Scanning label={`Forging ${kind}`} /> : error ? <ErrorPanel message={error} onRetry={run} /> : !result ? (
          <div className="grid h-full place-items-center py-16 text-center text-muted-foreground">
            <div><CelestialVisual kind={kind} palette={kind === "star" ? ["#3b1d6e", "#6d5bd6", "#c7f0ff"] : ["#141a3a", "#3a4a8a", "#6fa8d6"]} size={180} seed="empty" /><p className="mt-4">Set parameters and generate a new {kind}.</p></div>
          </div>
        ) : (
          <div className="fade-up grid min-w-0 gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            <div>
              <CelestialVisual kind={result.kind} palette={result.palette} hasRings={result.hasRings} size={240} seed={result.name} />
              <div className="mt-4 flex gap-2">
                {result.palette.map((c) => <span key={c} className="h-2 flex-1 rounded-full" style={{ background: c }} />)}
              </div>
              {result.kind === "planet" && (
                <div className="mt-5">
                  <p className="label-mono">Habitability · {result.habitability}%</p>
                  <div className="mt-2 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-brand" style={{ width: `${result.habitability}%` }} /></div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="label-mono text-accent">{result.classification}</p>
              <h2 className="mt-2 text-2xl font-semibold">{result.name}</h2>
              <p className="mt-1 text-sm italic text-muted-foreground">{result.tagline}</p>
              <p className="mt-4 text-sm leading-relaxed">{result.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.properties.map((p) => (
                  <div key={p.label} className="rounded-lg border border-border bg-secondary/40 p-2.5">
                    <p className="label-mono !text-[0.6rem]">{p.label}</p><p className="mt-1 text-sm">{p.value}</p>
                  </div>
                ))}
              </div>
              {result.atmosphere && <p className="mt-4 text-sm"><span className="text-muted-foreground">Atmosphere:</span> {result.atmosphere}</p>}
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">{result.funFacts?.map((f) => <li key={f}>✦ {f}</li>)}</ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <BrandButton onClick={save} loading={saving} disabled={saved}><Save className="size-4" />{saved ? "Saved" : "Save to log"}</BrandButton>
                <GhostButton onClick={run}>Regenerate</GhostButton>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="label-mono mb-3">{label}</p>{children}</div>;
}
