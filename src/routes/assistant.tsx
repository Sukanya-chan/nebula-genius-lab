import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Orbit, SendHorizonal, Trash2 } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { PageHeader } from "@/components/space/AppShell";
import { ErrorPanel, GhostButton, RequireAuth } from "@/components/space/common";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "ORBIT Astronomy Assistant — HackTheSpace" },
      { name: "description", content: "Ask a Gemini-powered assistant anything about astronomy, astrophysics and space exploration." },
      { property: "og:title", content: "ORBIT Astronomy Assistant — HackTheSpace" },
      { property: "og:description", content: "Your AI guide to the universe." },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Module 05 · Comms" title="ORBIT Assistant" subtitle="Ask about anything from neutron stars to Mars mission delta-v." />
      <RequireAuth feature="the assistant">
        <Assistant />
      </RequireAuth>
    </>
  ),
});

type Msg = { role: "user" | "assistant"; content: string };
const SUGGESTIONS = ["Why can't anything escape a black hole?", "How does JWST see through dust?", "Explain the Hubble tension simply", "How long would it take to reach Proxima b?"];
const KEY = "hts-orbit-chat";

function Assistant() {
  const ask = useServerFn(askAssistant);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const s = sessionStorage.getItem(KEY); if (s) setMsgs(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(msgs)); } catch { /* Storage may be unavailable. */ }
    const end = endRef.current;
    if (end?.parentElement) end.parentElement.scrollTo({ top: end.parentElement.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [msgs, busy]);

  async function send(content: string, base = msgs) {
    const c = content.trim();
    if (!c || busy) return;
    const next = [...base, { role: "user" as const, content: c.slice(0, 4000) }];
    setMsgs(next); setText(""); setBusy(true); setError(null);
    const res = await ask({ data: { messages: next.slice(-20) } }).catch(() => ({ ok: false as const, error: "Network error contacting ORBIT." }));
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setMsgs([...next, { role: "assistant", content: res.data }]);
  }

  function retry() {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const base = msgs.slice(0, msgs.lastIndexOf(lastUser));
    send(lastUser.content, base);
  }

  return (
    <div className="glass flex h-[min(680px,calc(100dvh-17rem))] min-h-[380px] min-w-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-brand"><Orbit className="size-4 text-primary-foreground" /></span><span className="font-display text-sm">ORBIT</span><span className="size-2 rounded-full bg-success" /></div>
        {msgs.length > 0 && <GhostButton disabled={busy} onClick={() => { setMsgs([]); setError(null); }} className="gap-1 border-0 bg-transparent px-2 py-1 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" />Clear</GhostButton>}
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        {msgs.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-muted-foreground">Transmission channel open. Try one of these:</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm hover:border-primary/50">{s}</button>)}</div>
            </div>
          </div>
        )}
        {msgs.map((m, i) => m.role === "user" ? (
          <div key={i} className="ml-auto max-w-[85%] break-words rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
        ) : (
          <div key={i} className="prose-space fade-up max-w-[92%] break-words [&_pre]:overflow-x-auto text-sm"><ReactMarkdown>{m.content}</ReactMarkdown></div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2 animate-pulse rounded-full bg-accent" />ORBIT is computing…</div>}
        {error && <ErrorPanel message={error} onRetry={retry} />}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 border-t border-border p-3">
        <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          rows={1} maxLength={4000} aria-label="Ask ORBIT" placeholder="Ask about the universe…" className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-input bg-secondary/60 px-4 py-3 text-sm outline-none focus:border-ring" />
        <GhostButton type="submit" disabled={!text.trim() || busy} aria-label="Send" className="size-11 shrink-0 bg-brand p-0 text-primary-foreground disabled:opacity-40"><SendHorizonal className="size-4" /></GhostButton>
      </form>
    </div>
  );
}
