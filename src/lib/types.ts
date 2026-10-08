export type Difficulty = "cadet" | "pilot" | "commander";

export interface Challenge {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
  points: number;
}

export interface CosmicObject {
  name: string;
  kind: "planet" | "star";
  classification: string;
  tagline: string;
  description: string;
  properties: { label: string; value: string }[];
  palette: string[];
  hasRings: boolean;
  atmosphere: string;
  habitability: number;
  funFacts: string[];
}
