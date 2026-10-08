<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

- Gemini is called only from `src/lib/gemini.server.ts` (dynamically imported inside server function handlers) with `GEMINI_API_KEY` from server env — keeps the user's key out of the browser.
- AI server functions in `src/lib/ai.functions.ts` require auth and return `{ ok, data | error }` instead of throwing — so friendly error messages survive serialization to the UI.
- Catalog and quiz content are static local data (`src/lib/catalog.ts`, `src/lib/quiz-bank.ts`) — instant, offline-safe, no AI cost.
- Orbit math lives in `src/lib/physics.ts` and is covered by tests — single source of truth for simulator numbers.
- Visuals for planets/stars are procedural SVG from AI-provided palettes (`CelestialVisual`) — no image generation cost.
