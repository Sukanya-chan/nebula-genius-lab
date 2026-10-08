import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Challenge, CosmicObject } from "./types";

export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<AiResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected AI error.";
    console.error("[ai]", msg);
    return { ok: false, error: msg };
  }
}

const challengeInput = z.object({
  topic: z.string().min(1).max(60),
  difficulty: z.enum(["cadet", "pilot", "commander"]),
  avoid: z.array(z.string().max(300)).max(10).default([]),
});

export const generateChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => challengeInput.parse(d))
  .handler(async ({ data }): Promise<AiResult<Challenge>> =>
    run(async () => {
      const { callGeminiJSON } = await import("./gemini.server");
      const c = await callGeminiJSON<Challenge>(
        "You are a mission designer creating scientifically accurate astronomy and space-science challenges. Respond ONLY with JSON.",
        `Create one ${data.difficulty} difficulty challenge about "${data.topic}".
Difficulty guide: cadet = basic facts; pilot = reasoning or simple calculation; commander = multi-step physics or advanced astrophysics.
${data.avoid.length ? `Do not repeat these questions: ${data.avoid.join(" | ")}` : ""}
JSON shape: {"title": string (short mission name), "question": string, "options": [4 strings], "correctIndex": number 0-3, "hints": [2 strings, progressively more helpful, never revealing the answer outright], "explanation": string (2-4 sentences), "points": number (cadet 100, pilot 200, commander 350)}`,
      );
      if (!Array.isArray(c.options) || c.options.length !== 4 || typeof c.correctIndex !== "number" || c.correctIndex < 0 || c.correctIndex > 3)
        throw new Error("The AI produced an invalid challenge. Please try again.");
      c.hints = Array.isArray(c.hints) ? c.hints.slice(0, 3) : [];
      c.points = Number(c.points) || { cadet: 100, pilot: 200, commander: 350 }[data.difficulty];
      return c;
    }),
  );

const objectInput = z.object({
  kind: z.enum(["planet", "star"]),
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

export const generateCosmicObject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => objectInput.parse(d))
  .handler(async ({ data }): Promise<AiResult<CosmicObject>> =>
    run(async () => {
      const { callGeminiJSON } = await import("./gemini.server");
      const o = await callGeminiJSON<CosmicObject>(
        "You are an astrophysicist generating scientifically plausible fictional celestial objects. Respect physics (mass-radius relations, stellar classification, equilibrium temperatures, habitable zones). Respond ONLY with JSON.",
        `Generate a fictional ${data.kind} with these user parameters: ${JSON.stringify(data.params)}.
JSON shape: {"name": string (evocative, catalog-like), "kind": "${data.kind}", "classification": string, "tagline": string (max 12 words), "description": string (3-5 sentences, vivid but scientific), "properties": [{"label": string, "value": string}] (6-9 key properties with units, e.g. mass, radius, surface temperature, gravity, orbital period / luminosity, age, spectral class), "palette": [3 hex colors representing its appearance, dark to light], "hasRings": boolean, "atmosphere": string, "habitability": number 0-100, "funFacts": [3 strings]}`,
        1,
      );
      if (!o.name || !Array.isArray(o.properties)) throw new Error("The AI produced an incomplete object. Please try again.");
      const hex = /^#[0-9a-f]{6}$/i;
      o.palette = (Array.isArray(o.palette) ? o.palette : []).filter((c) => hex.test(c));
      if (o.palette.length < 3) o.palette = data.kind === "star" ? ["#ff7a18", "#ffd36b", "#fff6d8"] : ["#1b2a6b", "#3f7bd6", "#a8e0ff"];
      o.kind = data.kind;
      o.habitability = Math.max(0, Math.min(100, Number(o.habitability) || 0));
      return o;
    }),
  );

const chatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(30),
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => chatInput.parse(d))
  .handler(async ({ data }): Promise<AiResult<string>> =>
    run(async () => {
      const { callGemini } = await import("./gemini.server");
      return callGemini({
        system:
          "You are ORBIT, the onboard astronomy assistant of HackTheSpace. Explain astronomy, astrophysics, cosmology and space exploration accurately and engagingly. Use concise markdown, include numbers with units, and use analogies for complex ideas. If a question is outside space science, briefly steer back. If unsure, say so.",
        contents: data.messages.slice(-16).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        temperature: 0.7,
      });
    }),
  );
