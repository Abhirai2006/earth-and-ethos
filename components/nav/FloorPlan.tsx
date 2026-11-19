import { rooms } from "@/lib/rooms";

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
    <svg viewBox="0 0 400 310" className={className} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        </pattern>
      </defs>
      {rooms.map((r) => (
        <g
          key={r.id}
          className={`plan__room${active === r.id ? " is-active" : ""}`}
          onClick={interactive && onPick ? () => onPick(r.id) : undefined}
        >
          <rect x={r.x} y={r.y} width={r.w} height={r.h} className="plan__fill" />
          {interactive && (
            <text x={r.x + 8} y={r.y + 18} className="plan__label">
              {r.room}
            </text>
          )}
        </g>
      ))}
      {/* walls */}
      <path
        className="plan__walls"
        d="M20 20 H380 V290 H250 M150 290 H20 V20 M120 20 V60 M120 90 V230 M120 260 V290 M280 20 V45 M280 75 V250 M120 80 H160 M200 80 H280 M280 130 H310 M340 130 H380 M120 170 H140 M180 170 H280 M20 170 H60 M90 170 H120 M150 250 V290 M250 250 V290"
      />
      {/* door swings */}
      <path className="plan__doors" d="M150 290 A40 40 0 0 1 190 250 M120 60 A30 30 0 0 1 150 90 M280 45 A30 30 0 0 0 250 75 M160 80 A40 40 0 0 0 200 40 M310 130 A30 30 0 0 0 340 100 M140 170 A40 40 0 0 0 180 130 M60 170 A30 30 0 0 1 90 140" />
      {/* north arrow */}
      <g className="plan__north" transform="translate(360 300)">
        <path d="M0 -14 L5 0 L0 -4 L-5 0 Z" />
      </g>
    </svg>
  );
}
