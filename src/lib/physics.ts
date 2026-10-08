export const G = 6.674e-11;
export const M_SUN = 1.989e30;
export const AU = 1.496e11;

/** Orbital analysis for a body at distance r (m) with tangential speed v (m/s) around mass M (kg). */
export function analyzeOrbit(M: number, r: number, v: number) {
  const mu = G * M;
  const vCirc = Math.sqrt(mu / r);
  const vEsc = Math.sqrt((2 * mu) / r);
  const energy = (v * v) / 2 - mu / r; // specific orbital energy
  const h = r * v; // specific angular momentum (tangential launch)
  const e = Math.sqrt(Math.max(0, 1 + (2 * energy * h * h) / (mu * mu)));
  const bound = energy < 0;
  const a = bound ? -mu / (2 * energy) : Infinity;
  const period = bound ? 2 * Math.PI * Math.sqrt((a * a * a) / mu) : Infinity;
  const periapsis = bound ? a * (1 - e) : (h * h) / mu / (1 + e);
  const apoapsis = bound ? a * (1 + e) : Infinity;
  const type = !bound ? (Math.abs(e - 1) < 0.01 ? "Parabolic escape" : "Hyperbolic escape") : e < 0.02 ? "Circular orbit" : "Elliptical orbit";
  return { vCirc, vEsc, energy, e, a, period, periapsis, apoapsis, bound, type };
}
