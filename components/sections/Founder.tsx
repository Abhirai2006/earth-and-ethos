import { about } from "@/content/about";
import { site } from "@/lib/site";
import RoomTag from "@/components/ui/RoomTag";

// Deterministic "topographic" lines — a nod to the Western Ghats he grew up in.
function contours() {
  const lines: string[] = [];
  for (let i = 0; i < 22; i++) {
    const base = 40 + i * 17;
    let d = "";
    for (let x = 0; x <= 600; x += 12) {
      const y =
        base -
        Math.sin(x / 95 + i * 0.35) * (26 + i * 0.6) -
        Math.sin(x / 41 + i * 0.9) * 9 -
        Math.cos(x / 160 - i * 0.2) * 22;
      d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(1)} `;
    }
    lines.push(d);
  }
  return lines;
}

export default function Founder() {
  const f = about.founder;
  return (
    <section id="founder" className="founder" data-tone="light" aria-labelledby="founder-h">
      <svg className="founder__topo" viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true">
        {contours().map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      <div className="wrap founder__grid">
        <div className="founder__head">
          <RoomTag no="02" room="Study" label="Meet the founder" />
          <p className="founder__ar">Ar.</p>
          <h2 id="founder-h" className="display founder__name">
            {site.founder.name}
          </h2>
          <p className="founder__role">{site.founder.role}</p>
          <p className="founder__quote">{f.heading}</p>
        </div>
        <div className="founder__body">
          {f.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <dl className="titleblock">
            {f.facts.map((x) => (
              <div key={x.k}>
                <dt>{x.k}</dt>
                <dd>{x.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
