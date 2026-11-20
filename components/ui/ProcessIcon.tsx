// Line drawings for the seven steps, drawn like a sketch: each path has a
// normalised length so CSS can draw it on (stroke-dashoffset 1 -> 0).
const ICONS: Record<string, string[]> = {
  "01": [
    "M8 11h22a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H18l-7 6v-6H8a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z",
    "M38 19h2a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-1v5l-6-5h-8a4 4 0 0 1-4-3",
    "M12 19.5h12",
  ],
  "02": [
    "M6 34a18 18 0 0 1 36 0",
    "M29 15a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0",
    "M3 40h42",
    "M13 40l4-6h14l4 6",
    "M3 25h8M5 29h7",
  ],
  "03": [
    "M31 6l9 9-21 21-11 2 2-11z",
    "M27 10l9 9",
    "M6 44c6-3 10 1 16-1s9-3 15-1",
  ],
  "04": [
    "M5 8h38v32H5z",
    "M5 25h15v15",
    "M20 8v9h23",
    "M30 31h13M30 35.5h13",
    "M11 14h4",
  ],
  "05": [
    "M11 44V7",
    "M4 13h39",
    "M11 7l7 6M11 7l-7 6",
    "M35 13v9",
    "M32 22h6v5h-6z",
    "M4 44h15",
    "M25 44h18v-8H25zM25 40h18M34 36v4M29.5 40v4M38.5 40v4",
  ],
  "06": [
    "M6 24a8 8 0 1 0 16 0a8 8 0 1 0 -16 0",
    "M22 24h22",
    "M36 24v6M42 24v5",
    "M11 24h.01",
  ],
  "07": [
    "M11 26v-6a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v6",
    "M6 26h6v6h24v-6h6v10H6z",
    "M9 36v4M39 36v4",
    "M24 8v3M18 10l1.5 2.5M30 10l-1.5 2.5",
  ],
};

export default function ProcessIcon({ n, className }: { n: string; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {(ICONS[n] ?? []).map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ ["--i" as string]: i }} />
      ))}
    </svg>
  );
}
