import { describe, expect, it } from "vitest";
import { analyzeOrbit, AU, M_SUN } from "@/lib/physics";
import { buildQuiz, QUIZ_BANK } from "@/lib/quiz-bank";

describe("orbital physics", () => {
  it("Earth around the Sun is a ~1 year near-circular orbit", () => {
    const o = analyzeOrbit(M_SUN, AU, 29780);
    expect(o.bound).toBe(true);
    expect(o.period / 86400 / 365.25).toBeCloseTo(1, 1);
    expect(o.e).toBeLessThan(0.02);
  });
  it("velocity above escape velocity is unbound", () => {
    const o = analyzeOrbit(M_SUN, AU, 43000);
    expect(o.vEsc / 1000).toBeCloseTo(42.1, 0);
    expect(o.bound).toBe(false);
  });
});

describe("quiz builder", () => {
  it("keeps the correct answer after shuffling options", () => {
    for (const q of buildQuiz("mixed", 30)) {
      const original = QUIZ_BANK.find((b) => b.q === q.q)!;
      expect(q.options[q.answer]).toBe(original.options[original.answer]);
    }
  });
  it("only returns questions of the chosen level", () => {
    expect(buildQuiz("hard", 8).every((q) => q.level === "hard")).toBe(true);
  });
});
