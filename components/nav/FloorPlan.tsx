import { rooms } from "@/lib/rooms";

// Plan geometry, in the same units as lib/rooms.ts (the plan is 360 x 270).
// Outer walls are drawn heavier than partitions, as on a real drawing.
const OUTER = "M20 20 H380 V290 H230 M170 290 H20 V20";
const INNER =
  "M120 20 V60 M120 90 V255 M120 285 V290 M280 20 V45 M280 75 V250 M120 80 H230 M270 80 H280 M280 130 H310 M340 130 H380 M120 170 H140 M180 170 H280 M20 170 H60 M90 170 H120 M150 250 V290 M250 250 V290 M150 290 H170 M230 290 H250";

// Each door: hinge, the end of the opening it closes against, and where the open leaf points.
type Door = { h: [number, number]; c: [number, number]; t: [number, number]; sweep: 0 | 1 };
const DOORS: Door[] = [
  { h: [120, 90], c: [120, 60], t: [150, 90], sweep: 1 }, // gallery / drawing board
  { h: [280, 45], c: [280, 75], t: [310, 45], sweep: 0 }, // front desk / design library
  { h: [270, 80], c: [230, 80], t: [270, 40], sweep: 1 }, // front desk / drawing board
  { h: [310, 130], c: [340, 130], t: [310, 160], sweep: 1 }, // design library / guest lounge
  { h: [140, 170], c: [180, 170], t: [140, 210], sweep: 1 }, // drawing board / foyer
  { h: [90, 170], c: [60, 170], t: [90, 140], sweep: 1 }, // gallery / study
  { h: [120, 285], c: [120, 255], t: [90, 285], sweep: 0 }, // study / foyer
  { h: [170, 290], c: [200, 290], t: [170, 260], sweep: 0 }, // main door, left leaf
  { h: [230, 290], c: [200, 290], t: [230, 260], sweep: 1 }, // main door, right leaf
];

/** A small architectural floor plan. Each room maps to a page section. */
export default function FloorPlan({
  active,
  interactive = false,
  onPick,
  className,
}: {
  active?: string;
  interactive?: boolean;
  onPick?: (id: string) => void;
  className?: string;
}) {
  return (
    <svg viewBox={interactive ? "0 0 400 330" : "0 0 400 310"} className={className} aria-hidden="true" focusable="false">
      {rooms.map((r) => {
        const cx = r.x + r.w / 2;
        const tall = r.h >= 60;
        const outside = r.id === "top"; // the entrance is named outside, under its door
        const nudge = r.id === "details" ? 12 : 0; // clear of the door swing into the library
        const cy = outside ? r.y + r.h + 22 : r.y + r.h / 2 + (tall ? -2 : 4) + nudge;
        return (
          <g
            key={r.id}
            className={`plan__room${active === r.id ? " is-active" : ""}`}
            onClick={interactive && onPick ? () => onPick(r.id) : undefined}
          >
            <rect x={r.x} y={r.y} width={r.w} height={r.h} className="plan__fill" />
            {interactive && (
              <text x={cx} y={cy} textAnchor="middle" className="plan__label">
                <tspan className="plan__name">{r.room}</tspan>
                {tall && (
                  <tspan x={cx} dy="14" className="plan__sub">
                    {r.label}
                  </tspan>
                )}
              </text>
            )}
          </g>
        );
      })}
      {/* door leaves and their swing */}
      <g className="plan__doors">
        {DOORS.map((d, i) => {
          const r = Math.hypot(d.t[0] - d.h[0], d.t[1] - d.h[1]);
          return (
            <g key={i}>
              <path className="plan__swing" d={`M${d.c[0]} ${d.c[1]} A${r} ${r} 0 0 ${d.sweep} ${d.t[0]} ${d.t[1]}`} />
              <path className="plan__leaf" d={`M${d.h[0]} ${d.h[1]} L${d.t[0]} ${d.t[1]}`} />
            </g>
          );
        })}
      </g>
      <path className="plan__walls plan__walls--inner" d={INNER} />
      <path className="plan__walls" d={OUTER} />
      {interactive && (
        <g className="plan__key">
          {/* north point */}
          <g transform="translate(366 312)">
            <circle r="9" className="plan__ncircle" />
            <path d="M0 -7 L3.4 4 L0 1.8 L-3.4 4 Z" className="plan__npoint" />
          </g>
          <text x="352" y="316" textAnchor="end" className="plan__nlabel">N</text>
        </g>
      )}
    </svg>
  );
}
