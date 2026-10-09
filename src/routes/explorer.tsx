import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CATALOG_TYPES, searchCatalog, type CatalogEntry, type CatalogType } from "@/lib/catalog";
import { PageHeader } from "@/components/space/AppShell";
import { Chip, GhostButton, GlassCard } from "@/components/space/common";
import { CelestialVisual } from "@/components/space/CelestialVisual";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Space Explorer Catalog — HackTheSpace" },
      { name: "description", content: "Search planets, stars, moons, galaxies, nebulae and black holes with key scientific facts." },
      { property: "og:title", content: "Space Explorer Catalog — HackTheSpace" },
      { property: "og:description", content: "A searchable catalog of the cosmos." },
    ],
  }),
  component: Explorer,
});

function Visual({ e, size }: { e: CatalogEntry; size: number }) {
  if (e.type === "black hole")
    return (
      <div className="mx-auto grid place-items-center" style={{ width: size, height: size }}>
        <div className="relative rounded-full" style={{ width: size * 0.7, height: size * 0.7, background: `radial-gradient(circle, #000 38%, ${e.palette[1]} 46%, ${e.palette[2]}55 60%, transparent 70%)` }} />
      </div>
    );
  if (e.type === "galaxy" || e.type === "nebula")
    return (
      <div className="mx-auto" style={{ width: size, height: size, background: `radial-gradient(ellipse 50% ${e.type === "galaxy" ? "18%" : "40%"} at 50% 50%, ${e.palette[2]}, ${e.palette[1]}88 40%, transparent 72%)`, transform: e.type === "galaxy" ? "rotate(-25deg)" : undefined, filter: "blur(1px)" }} />
    );
  return <CelestialVisual kind={e.type === "star" ? "star" : "planet"} palette={e.palette} hasRings={e.rings} size={size} seed={e.id} />;
}

function Explorer() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<CatalogType | "all">("all");
  const [sel, setSel] = useState<CatalogEntry | null>(null);
  const results = useMemo(() => searchCatalog(q, type), [q, type]);
  useEffect(() => {
    if (!sel) return;
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSel(null); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); };
  }, [sel]);

  return (
    <div>
      <PageHeader eyebrow="Module 03 · Catalog" title="Space Explorer" subtitle="Real objects, real data. Search by name, property or fact." />
      <div className="glass mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Saturn, red dwarf, methane…" className="w-full rounded-xl border border-input bg-secondary/60 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-ring" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={type === "all"} onClick={() => setType("all")}>All</Chip>
          {CATALOG_TYPES.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}><span className="capitalize">{t}s</span></Chip>)}
        </div>
      </div>
      <p className="label-mono mb-4">{results.length} objects</p>
      {results.length === 0 ? (
        <GlassCard className="text-center text-muted-foreground">No objects match “{q}”. Try another term.</GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((e) => (
            <button key={e.id} onClick={() => setSel(e)} className="glass group p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="transition-transform group-hover:scale-105"><Visual e={e} size={120} /></div>
              <p className="label-mono mt-4 text-accent">{e.type}</p>
              <h3 className="mt-1 text-base font-semibold">{e.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.summary}</p>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={() => setSel(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="catalog-object-title" className="glass fade-up max-h-[90dvh] w-full max-w-2xl overflow-y-auto break-words p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between">
              <p className="label-mono text-accent">{sel.type} · {sel.distance}</p>
               <GhostButton autoFocus aria-label="Close" onClick={() => setSel(null)} className="size-8 shrink-0 border-0 bg-transparent p-0"><X className="size-5" /></GhostButton>
            </div>
            <div className="mt-4 grid gap-6 sm:grid-cols-[200px_1fr]">
              <Visual e={sel} size={200} />
              <div>
                <h2 id="catalog-object-title" className="text-2xl font-semibold">{sel.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sel.summary}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sel.facts.map((f) => (
                <div key={f.label} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="label-mono !text-[0.6rem]">{f.label}</p><p className="mt-1 text-sm">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
