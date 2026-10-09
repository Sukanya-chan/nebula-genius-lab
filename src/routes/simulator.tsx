import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { analyzeOrbit, AU, G, M_SUN } from "@/lib/physics";
import { PageHeader } from "@/components/space/AppShell";
import { Chip, GhostButton, GlassCard } from "@/components/space/common";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "What-If Orbital Simulator — HackTheSpace" },
      { name: "description", content: "Adjust star mass, orbital distance and velocity to see real Newtonian orbits, periods and escape velocities." },
      { property: "og:title", content: "What-If Orbital Simulator — HackTheSpace" },
      { property: "og:description", content: "Interactive Newtonian gravity sandbox." },
    ],
  }),
  component: Simulator,
});

const PRESETS = [
  { label: "Earth", m: 1, r: 1, v: 29.78 },
  { label: "Mars", m: 1, r: 1.524, v: 24.07 },
  { label: "Comet", m: 1, r: 1, v: 38 },
  { label: "Escape!", m: 1, r: 1, v: 43 },
  { label: "Heavy star", m: 4, r: 1, v: 45 },
];

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : "∞");

function Simulator() {
  const [mSol, setMSol] = useState(1);
  const [rAU, setRAU] = useState(1);
  const [vKms, setVKms] = useState(29.78);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef({ running, speed });
  useEffect(() => { playbackRef.current = { running, speed }; }, [running, speed]);

  const stats = useMemo(() => analyzeOrbit(mSol * M_SUN, rAU * AU, vKms * 1000), [mSol, rAU, vKms]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = canvas.clientWidth;
      if (w <= 0) return;
      canvas.width = w * dpr; canvas.height = w * 0.75 * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const mu = G * mSol * M_SUN;
    let x = rAU * AU, y = 0, vx = 0, vy = vKms * 1000;
    const trail: [number, number][] = [];
    const extent = Math.max(rAU * 2.6, Number.isFinite(stats.apoapsis) ? stats.apoapsis / AU * 1.25 : rAU * 3);
    const daySec = 86400;
    let raf = 0, last = performance.now(), crashed = false;
    const sunR = 0.03 + Math.log10(1 + mSol) * 0.02;

    const draw = () => {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
      const scale = Math.min(W, H) / 2 / (extent * AU);
      ctx.clearRect(0, 0, W, H);
      // grid
      ctx.strokeStyle = "rgba(150,160,255,0.07)"; ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(cx, cy, (Math.min(W, H) / 2) * (k / 4), 0, Math.PI * 2); ctx.stroke(); }
      // star
      const sr = Math.max(8 * dpr, sunR * Math.min(W, H));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr * 3);
      g.addColorStop(0, "rgba(255,245,215,1)"); g.addColorStop(0.3, "rgba(255,190,90,0.9)"); g.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, sr * 3, 0, Math.PI * 2); ctx.fill();
      // trail
      ctx.lineWidth = 1.6 * dpr;
      for (let i = 1; i < trail.length; i++) {
        ctx.strokeStyle = `rgba(110,220,255,${(i / trail.length) * 0.8})`;
        const previous = trail[i - 1], current = trail[i];
        if (!previous || !current) continue;
        ctx.beginPath(); ctx.moveTo(cx + previous[0] * scale, cy - previous[1] * scale); ctx.lineTo(cx + current[0] * scale, cy - current[1] * scale); ctx.stroke();
      }
      // body
      ctx.fillStyle = crashed ? "rgba(255,90,90,1)" : "rgba(170,140,255,1)";
      ctx.shadowColor = "rgba(140,120,255,0.9)"; ctx.shadowBlur = 14 * dpr;
      ctx.beginPath(); ctx.arc(cx + x * scale, cy - y * scale, 5 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (playbackRef.current.running && !crashed) {
        const simTime = dt * playbackRef.current.speed * 20 * daySec * Math.max(0.2, rAU ** 1.5 / Math.sqrt(mSol));
        const n = 200; const h = simTime / n;
        for (let i = 0; i < n; i++) {
          // velocity Verlet
          let r2 = x * x + y * y, r = Math.sqrt(r2);
          let ax = (-mu * x) / (r2 * r), ay = (-mu * y) / (r2 * r);
          x += vx * h + 0.5 * ax * h * h; y += vy * h + 0.5 * ay * h * h;
          r2 = x * x + y * y; r = Math.sqrt(r2);
          const ax2 = (-mu * x) / (r2 * r), ay2 = (-mu * y) / (r2 * r);
          vx += 0.5 * (ax + ax2) * h; vy += 0.5 * (ay + ay2) * h;
          ax = ax2; ay = ay2;
          if (r < 0.01 * AU) { crashed = true; break; }
        }
        trail.push([x, y]); if (trail.length > 600) trail.shift();
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [mSol, rAU, vKms, resetKey, stats.apoapsis]);

  return (
    <div>
      <PageHeader eyebrow="Module 04 · Sandbox" title="What-If Space Simulator" subtitle="A Newtonian two-body integrator. Change a value and watch the orbit — and the math — respond." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <GlassCard className="p-3 sm:p-4">
          <canvas ref={canvasRef} className="aspect-[4/3] w-full rounded-xl bg-background/40" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GhostButton onClick={() => setRunning((r) => !r)}>{running ? <Pause className="size-4" /> : <Play className="size-4" />}{running ? "Pause" : "Play"}</GhostButton>
            <GhostButton onClick={() => setResetKey((k) => k + 1)}><RotateCcw className="size-4" />Reset</GhostButton>
            <span className="ml-auto flex gap-2">{[0.5, 1, 3].map((s) => <Chip key={s} active={speed === s} onClick={() => setSpeed(s)}>{s}×</Chip>)}</span>
          </div>
        </GlassCard>
        <div className="space-y-6">
          <GlassCard className="space-y-5">
            <div className="flex flex-wrap gap-2">{PRESETS.map((p) => <Chip key={p.label} onClick={() => { setMSol(p.m); setRAU(p.r); setVKms(p.v); setResetKey((k) => k + 1); }}>{p.label}</Chip>)}</div>
            <Ctl label="Star mass" value={`${mSol.toFixed(2)} M☉`}><Slider min={0.1} max={10} step={0.01} value={[mSol]} onValueChange={(v) => setMSol(v[0] ?? 0)} /></Ctl>
            <Ctl label="Orbital distance" value={`${rAU.toFixed(2)} AU`}><Slider min={0.2} max={5} step={0.01} value={[rAU]} onValueChange={(v) => setRAU(v[0] ?? 0)} /></Ctl>
            <Ctl label="Initial velocity" value={`${vKms.toFixed(2)} km/s`}><Slider min={1} max={150} step={0.1} value={[vKms]} onValueChange={(v) => setVKms(v[0] ?? 0)} /></Ctl>
            <button onClick={() => setVKms(Number((stats.vCirc / 1000).toFixed(2)))} className="text-xs text-accent hover:underline">Set to circular velocity ({fmt(stats.vCirc / 1000)} km/s)</button>
          </GlassCard>
          <GlassCard>
            <p className="label-mono text-accent">{stats.type}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Out k="Circular v" v={`${fmt(stats.vCirc / 1000)} km/s`} />
              <Out k="Escape v" v={`${fmt(stats.vEsc / 1000)} km/s`} />
              <Out k="Eccentricity" v={fmt(stats.e, 3)} />
              <Out k="Period" v={stats.bound ? `${fmt(stats.period / 86400 / 365.25, 3)} yr` : "Unbound"} />
              <Out k="Periapsis" v={`${fmt(stats.periapsis / AU, 3)} AU`} />
              <Out k="Apoapsis" v={stats.bound ? `${fmt(stats.apoapsis / AU, 3)} AU` : "∞"} />
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">v_circ = √(GM/r), v_esc = √(2GM/r), T = 2π√(a³/GM)</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Ctl({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return <div><div className="mb-3 flex justify-between"><span className="label-mono">{label}</span><span className="font-mono text-xs text-accent">{value}</span></div>{children}</div>;
}
function Out({ k, v }: { k: string; v: string }) {
  return <div className="rounded-lg border border-border bg-secondary/40 p-2.5"><dt className="label-mono !text-[0.6rem]">{k}</dt><dd className="mt-1 font-mono">{v}</dd></div>;
}
