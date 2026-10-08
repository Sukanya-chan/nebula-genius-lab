// Server-only Gemini client. Never import from client components.
const MODEL = "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class GeminiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

type Part = { text: string };
export type GeminiContent = { role: "user" | "model"; parts: Part[] };

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callGemini(opts: {
  system: string;
  contents: GeminiContent[];
  json?: boolean;
  temperature?: number | undefined;
}): Promise<string> {
  const key = process.env['GEMINI_API_KEY'];
  if (!key) throw new GeminiError("AI is not configured on the server.", 500);

  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: opts.contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  let lastErr: GeminiError | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
      });
    } catch {
      lastErr = new GeminiError("Could not reach the AI service. Check your connection.", 503);
      await sleep(600 * (attempt + 1));
      continue;
    }
    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
        promptFeedback?: { blockReason?: string };
      };
      if (json.promptFeedback?.blockReason) {
        throw new GeminiError("The AI declined this request. Try a different question.", 400);
      }
      const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text.trim()) throw new GeminiError("The AI returned an empty response. Please try again.", 502);
      return text;
    }
    const status = res.status;
    if (status === 429) lastErr = new GeminiError("AI rate limit reached. Wait a moment and try again.", 429);
    else if (status >= 500) lastErr = new GeminiError("The AI service is temporarily unavailable.", status);
    else if (status === 401 || status === 403)
      throw new GeminiError("The AI key was rejected. Please check the Gemini API key.", status);
    else throw new GeminiError("The AI could not process this request.", status);
    const retryAfter = Number(res.headers.get("retry-after"));
    await sleep(retryAfter > 0 ? retryAfter * 1000 : 800 * 2 ** attempt + Math.random() * 300);
  }
  throw lastErr ?? new GeminiError("AI request failed.", 500);
}

export async function callGeminiJSON<T>(system: string, prompt: string, temperature?: number): Promise<T> {
  const text = await callGemini({ system, contents: [{ role: "user", parts: [{ text: prompt }] }], json: true, temperature });
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        /* fallthrough */
      }
    }
    throw new GeminiError("The AI returned malformed data. Please try again.", 502);
  }
}
