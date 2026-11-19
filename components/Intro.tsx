import { MARK_PATHS } from "./Logo";

/**
 * Opening sequence: the mark draws itself as a line drawing, fills with
 * colour, then lifts away into the 3D walk-in. Pure CSS — it fades out on
 * its own (no JS gate), and is skipped for reduced motion / repeat visits.
 */
export default function Intro() {
  const shapes = [
    { d: MARK_PATHS.sun, c: "#D2B495" },
    { d: MARK_PATHS.brown, c: "#8C6249" },
    { d: MARK_PATHS.sage, c: "#7A8B73" },
    { d: MARK_PATHS.charcoal, c: "#3E4444" },
  ];
  return (
    <div className="intro" aria-hidden="true" data-tone="dark">
      <svg viewBox="290 40 1020 1230" className="intro__mark">
        {shapes.map((s, i) => (
          <path key={i} d={s.d} pathLength={1} className="intro__shape" style={{ ["--c" as string]: s.c, ["--i" as string]: i }} />
        ))}
        <path d={MARK_PATHS.stem} pathLength={1} className="intro__stem" />
        {MARK_PATHS.leaves.map((d, i) => (
          <path key={i} d={d} pathLength={1} className="intro__leaf" style={{ ["--i" as string]: i }} />
        ))}
      </svg>
      <p className="intro__word">Earth &amp; Ethos</p>
    </div>
  );
}
