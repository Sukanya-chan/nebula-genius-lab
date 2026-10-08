import { useId } from "react";

export function CelestialVisual({
  kind,
  palette,
  hasRings,
  size = 240,
  seed = "x",
}: {
  kind: "planet" | "star";
  palette: string[];
  hasRings?: boolean | undefined;
  size?: number;
  seed?: string;
}) {
  const id = useId().replace(/:/g, "");
  const [c1, c2, c3] = [palette[0] ?? "#222", palette[1] ?? "#555", palette[2] ?? "#aaa"];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const bands = Array.from({ length: 6 }, (_, i) => ({ y: 30 + ((h >> i) % 140), w: 6 + ((h >> (i + 3)) % 18) }));

  if (kind === "star") {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size} className="mx-auto">
        <defs>
          <radialGradient id={`g${id}`}>
            <stop offset="0%" stopColor="#fff" />
            <stop offset="35%" stopColor={c3} />
            <stop offset="70%" stopColor={c2} />
            <stop offset="100%" stopColor={c1} />
          </radialGradient>
          <radialGradient id={`h${id}`}>
            <stop offset="40%" stopColor={c2} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c1} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill={`url(#h${id})`}>
          <animate attributeName="r" values="90;98;90" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="56" fill={`url(#g${id})`} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="mx-auto overflow-visible">
      <defs>
        <radialGradient id={`p${id}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={c3} />
          <stop offset="55%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
        <radialGradient id={`s${id}`} cx="30%" cy="30%">
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <clipPath id={`c${id}`}>
          <circle cx="100" cy="100" r="62" />
        </clipPath>
      </defs>
      {hasRings && <ellipse cx="100" cy="100" rx="96" ry="22" fill="none" stroke={c3} strokeOpacity="0.35" strokeWidth="9" transform="rotate(-18 100 100)" />}
      <circle cx="100" cy="100" r="68" fill={c2} opacity="0.18" />
      <circle cx="100" cy="100" r="62" fill={`url(#p${id})`} />
      <g clipPath={`url(#c${id})`} opacity="0.28">
        {bands.map((b, i) => (
          <rect key={i} x="30" y={b.y} width="140" height={b.w} fill={i % 2 ? c1 : c3} transform="rotate(-12 100 100)" />
        ))}
      </g>
      <circle cx="100" cy="100" r="62" fill={`url(#s${id})`} />
      {hasRings && (
        <path d="M 4 100 A 96 22 0 0 0 196 100" fill="none" stroke={c3} strokeOpacity="0.55" strokeWidth="9" transform="rotate(-18 100 100)" />
      )}
    </svg>
  );
}
