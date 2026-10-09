import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/components/space/AppShell";
import { CelestialVisual } from "@/components/space/CelestialVisual";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "HackTheSpace — Explore the cosmos with AI" },
      { name: "description", content: "AI-generated space challenges, planet & star generator, orbital simulator, catalog and astronomy assistant." },
      { property: "og:title", content: "HackTheSpace — Explore the cosmos with AI" },
      { property: "og:description", content: "Train like a mission specialist: AI challenges, generators, simulations and quizzes." },
    ],
  }),
  component: Home,
});

const DESCRIPTIONS: Record<string, string> = {
  "/challenges": "AI-crafted missions with hints, scoring and streaks.",
  "/generator": "Design scientifically plausible planets and stars.",
  "/explorer": "Search planets, stars, moons, galaxies and black holes.",
  "/simulator": "Bend orbits by changing mass, distance and velocity.",
  "/assistant": "Ask ORBIT anything about the universe.",
  "/quiz": "Timed-feel, randomized quizzes across three levels.",
};

function Home() {
  return (
    <div>
      <section className="grid items-center gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
        <div className="fade-up">
          <p className="label-mono mb-5 text-accent">Mission control · v1.0</p>
          <h1 className="text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Hack the <span className="text-gradient">universe</span>,<br /> one orbit at a time.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            An AI-powered space lab. Solve challenges, forge new worlds, simulate gravity and learn astronomy with an onboard assistant.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/challenges" className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground glow">
              Start a mission <ArrowRight className="size-4" />
            </Link>
            <Link to="/simulator" className="inline-flex items-center gap-2 rounded-xl border border-border bg-glass px-6 py-3 text-sm">
              Open simulator
            </Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden">
          <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/25" />
          <div className="absolute inset-10 rounded-full border border-accent/15" />
          <div className="absolute inset-0 grid place-items-center">
            <CelestialVisual kind="planet" palette={["#1a0f4a", "#5b5bd6", "#7fe3f0"]} hasRings size={320} seed="hackthespace" />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.map((n, i) => (
          <Link
            key={n.to}
            to={n.to}
            className="glass fade-up group p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl border border-border bg-secondary">
                <n.icon className="size-5 text-accent" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{n.label}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{DESCRIPTIONS[n.to]}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
