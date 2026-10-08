export type QuizLevel = "easy" | "medium" | "hard";
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
  level: QuizLevel;
}

export const QUIZ_BANK: QuizQuestion[] = [
  { level: "easy", q: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Mars", "Earth"], answer: 1, why: "Mercury orbits at about 0.39 AU, closer than any other planet." },
  { level: "easy", q: "What is the largest planet in our Solar System?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], answer: 2, why: "Jupiter is about 318 times Earth's mass and 11 times its diameter." },
  { level: "easy", q: "What type of star is the Sun?", options: ["Red giant", "White dwarf", "Yellow dwarf (G-type)", "Blue supergiant"], answer: 2, why: "The Sun is a G2V main-sequence star, often called a yellow dwarf." },
  { level: "easy", q: "Which planet is known as the Red Planet?", options: ["Mars", "Jupiter", "Mercury", "Venus"], answer: 0, why: "Iron oxide (rust) in Martian dust gives it a reddish color." },
  { level: "easy", q: "What galaxy do we live in?", options: ["Andromeda", "Triangulum", "Milky Way", "Sombrero"], answer: 2, why: "The Solar System sits in the Orion Arm of the Milky Way." },
  { level: "easy", q: "Which planet has the most famous ring system?", options: ["Uranus", "Saturn", "Neptune", "Mars"], answer: 1, why: "All giant planets have rings, but Saturn's are by far the brightest and largest." },
  { level: "easy", q: "How long does light from the Sun take to reach Earth?", options: ["8 seconds", "8 minutes", "8 hours", "8 days"], answer: 1, why: "At 1 AU (~150 million km), sunlight takes about 8 minutes 20 seconds." },
  { level: "easy", q: "Who was the first human to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], answer: 2, why: "Neil Armstrong stepped onto the Moon on 20 July 1969 during Apollo 11." },
  { level: "easy", q: "What is the hottest planet in the Solar System?", options: ["Mercury", "Venus", "Mars", "Jupiter"], answer: 1, why: "Venus's thick CO₂ atmosphere traps heat, keeping its surface near 464 °C." },
  { level: "easy", q: "What force keeps planets in orbit around the Sun?", options: ["Magnetism", "Friction", "Gravity", "Solar wind"], answer: 2, why: "Gravity provides the centripetal force that bends planetary paths into orbits." },
  { level: "medium", q: "What is a light-year a measure of?", options: ["Time", "Distance", "Brightness", "Speed"], answer: 1, why: "A light-year is the distance light travels in a year: about 9.46 trillion km." },
  { level: "medium", q: "Which moon has a thick nitrogen atmosphere and methane lakes?", options: ["Europa", "Ganymede", "Titan", "Triton"], answer: 2, why: "Saturn's moon Titan has a 1.45 bar atmosphere and hydrocarbon lakes." },
  { level: "medium", q: "What is the boundary around a black hole beyond which nothing can escape?", options: ["Photon sphere", "Event horizon", "Ergosphere", "Accretion disk"], answer: 1, why: "Inside the event horizon, the escape velocity exceeds the speed of light." },
  { level: "medium", q: "Which planet rotates on its side with an axial tilt of ~98°?", options: ["Neptune", "Uranus", "Saturn", "Venus"], answer: 1, why: "Uranus likely got its extreme tilt from a giant ancient collision." },
  { level: "medium", q: "What powers a main-sequence star like the Sun?", options: ["Nuclear fission", "Hydrogen fusion into helium", "Gravitational collapse only", "Chemical burning"], answer: 1, why: "In the core, hydrogen nuclei fuse into helium, releasing energy via E = mc²." },
  { level: "medium", q: "What is Earth's escape velocity?", options: ["7.9 km/s", "11.2 km/s", "3.0 km/s", "42 km/s"], answer: 1, why: "v = √(2GM/R) ≈ 11.2 km/s at Earth's surface; 7.9 km/s is low-orbit speed." },
  { level: "medium", q: "Kepler's third law relates a planet's orbital period to its…", options: ["Mass", "Semi-major axis", "Density", "Rotation speed"], answer: 1, why: "T² ∝ a³ — the square of the period is proportional to the cube of the semi-major axis." },
  { level: "medium", q: "Which telescope launched in 2021 observes primarily in infrared?", options: ["Hubble", "Chandra", "James Webb", "Spitzer"], answer: 2, why: "JWST launched on 25 Dec 2021 and observes 0.6–28 μm infrared light." },
  { level: "medium", q: "What is the Great Red Spot?", options: ["A volcano on Mars", "A storm on Jupiter", "A sunspot", "A crater on Mercury"], answer: 1, why: "It's an anticyclonic storm on Jupiter, observed for at least 190 years." },
  { level: "medium", q: "What are the Lagrange points?", options: ["Craters on the Moon", "Positions of gravitational balance in a two-body system", "Stellar classifications", "Comet tails"], answer: 1, why: "At L1–L5 a small object can hold position relative to two larger bodies; JWST sits near Sun–Earth L2." },
  { level: "hard", q: "What is the Chandrasekhar limit, approximately?", options: ["0.08 M☉", "1.4 M☉", "3 M☉", "8 M☉"], answer: 1, why: "Above ~1.4 solar masses, electron degeneracy pressure can't support a white dwarf." },
  { level: "hard", q: "The Schwarzschild radius of a black hole scales with…", options: ["The square root of its mass", "Its mass linearly", "The square of its mass", "Its spin only"], answer: 1, why: "r_s = 2GM/c², so doubling the mass doubles the event horizon radius." },
  { level: "hard", q: "What is the approximate value of the Hubble constant?", options: ["~7 km/s/Mpc", "~70 km/s/Mpc", "~700 km/s/Mpc", "~7,000 km/s/Mpc"], answer: 1, why: "Measurements range 67–73 km/s/Mpc — the discrepancy is called the Hubble tension." },
  { level: "hard", q: "What is the cosmic microwave background's current temperature?", options: ["0.27 K", "2.725 K", "27 K", "273 K"], answer: 1, why: "The CMB is a near-perfect blackbody at 2.725 K, relic light from ~380,000 years after the Big Bang." },
  { level: "hard", q: "In the H–R diagram, where do red giants sit?", options: ["Bottom left", "Upper right", "Bottom right", "Center of the main sequence"], answer: 1, why: "Red giants are cool (right) yet very luminous (top) due to their huge radii." },
  { level: "hard", q: "What is the main sequence turn-off used to estimate?", options: ["A galaxy's distance", "A star cluster's age", "A planet's mass", "Dark energy density"], answer: 1, why: "Stars leave the main sequence in mass order, so the turn-off point dates the cluster." },
  { level: "hard", q: "What causes Type Ia supernovae?", options: ["Core collapse of a massive star", "A white dwarf exceeding its mass limit in a binary", "Neutron star mergers only", "Black hole evaporation"], answer: 1, why: "Thermonuclear runaway in a white dwarf makes them reliable 'standard candles'." },
  { level: "hard", q: "Roughly what fraction of the universe's energy density is dark energy?", options: ["5%", "27%", "68%", "95%"], answer: 2, why: "ΛCDM: ~68% dark energy, ~27% dark matter, ~5% ordinary matter." },
  { level: "hard", q: "What is the Roche limit?", options: ["The max speed of a satellite", "The distance within which tidal forces tear apart a satellite held by its own gravity", "The edge of the heliosphere", "The minimum mass of a star"], answer: 1, why: "Inside the Roche limit, tidal forces exceed self-gravity — which is why rings form near planets." },
  { level: "hard", q: "A pulsar is a rapidly rotating…", options: ["White dwarf", "Neutron star", "Brown dwarf", "Quasar"], answer: 1, why: "Pulsars are magnetized neutron stars sweeping beams of radiation like lighthouses." },
];

export function buildQuiz(level: QuizLevel | "mixed", count = 10): QuizQuestion[] {
  const pool = QUIZ_BANK.filter((q) => level === "mixed" || q.level === level);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  // shuffle options too, tracking the correct answer
  return shuffled.map((q) => {
    const idx = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
    return { ...q, options: idx.map((i) => q.options[i]!), answer: idx.indexOf(q.answer) };
  });
}
