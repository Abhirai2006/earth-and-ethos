// The Earth & Ethos mark, redrawn as vector from the supplied logo PNG:
// sun disc, three angular volumes and the sage vine. Colours are the brand's.
const leaves: [number, number, number, number][] = [
  [468, 768, 372, 622],
  [548, 655, 652, 528],
  [512, 836, 664, 772],
  [470, 942, 308, 936],
  [580, 1048, 656, 898],
  [612, 1166, 482, 1252],
];

function leafPath(bx: number, by: number, tx: number, ty: number) {
  const dx = tx - bx, dy = ty - by;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const w = len * 0.42;
  const c1 = [bx + dx * 0.25 + nx * w, by + dy * 0.25 + ny * w];
  const c2 = [bx + dx * 0.8 + nx * w * 0.55, by + dy * 0.8 + ny * w * 0.55];
  const c3 = [bx + dx * 0.8 - nx * w * 0.55, by + dy * 0.8 - ny * w * 0.55];
  const c4 = [bx + dx * 0.25 - nx * w, by + dy * 0.25 - ny * w];
  const f = (n: number) => n.toFixed(1);
  return `M${bx},${by} C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${tx},${ty} C${f(c3[0])},${f(c3[1])} ${f(c4[0])},${f(c4[1])} ${bx},${by}Z`;
}

export const MARK_PATHS = {
  sun: "M800,195 A448,448 0 0 0 700,1079.7 L700,830 L800,772 Z",
  brown: "M824,57 L1216,283 L1216,462 L998,588 L998,655 L824,757 Z",
  sage: "M722,843 L998,684 L998,1207 L722,1207 Z",
  charcoal: "M1019,605 L1294,449 L1294,1207 L1019,1207 Z",
  stem: "M725,1198 C560,1132 468,984 476,852 C482,748 516,694 548,655",
  leaves: leaves.map((l) => leafPath(...l)),
};

export default function LogoMark({
  className,
  title = "Earth & Ethos",
  outline = "#ffffff",
}: {
  className?: string;
  title?: string | null;
  outline?: string;
}) {
  return (
    <svg
      viewBox="290 40 1020 1230"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <path d={MARK_PATHS.sun} fill="#D2B495" />
      <path d={MARK_PATHS.brown} fill="#8C6249" />
      <path d={MARK_PATHS.sage} fill="#7A8B73" />
      <path d={MARK_PATHS.charcoal} fill="#3E4444" />
      <path d={MARK_PATHS.stem} fill="none" stroke={outline} strokeWidth="30" strokeLinecap="round" />
      <path d={MARK_PATHS.stem} fill="none" stroke="#7A8B73" strokeWidth="14" strokeLinecap="round" />
      {MARK_PATHS.leaves.map((d, i) => (
        <path key={i} d={d} fill="#7A8B73" stroke={outline} strokeWidth="12" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
