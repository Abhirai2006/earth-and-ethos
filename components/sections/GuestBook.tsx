"use client";

import { useRef, useState } from "react";
import type { Testimonial } from "@/content/testimonials";

export default function GuestBook({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = items[i];
  const pick = (n: number) => {
    setI(n);
    setFull(false);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const n = (i + d + items.length) % items.length;
    pick(n);
    tabs.current[n]?.focus();
  };

  return (
    <div className="guest">
      <div className="guest__tabs" role="tablist" aria-label="Clients" aria-orientation="vertical" onKeyDown={onKey}>
        {items.map((x, n) => (
          <button
            key={x.name}
            ref={(el) => { tabs.current[n] = el; }}
            role="tab"
            id={`gtab-${n}`}
            aria-selected={n === i}
            aria-controls="gpanel"
            tabIndex={n === i ? 0 : -1}
            className="guest__tab"
            onClick={() => pick(n)}
          >
            <span className="guest__page">p. {n + 1}</span>
            <span className="guest__who">{x.name}</span>
            {x.role && <span className="guest__role">{x.role}</span>}
          </button>
        ))}
      </div>
      <div className="guest__panel" role="tabpanel" id="gpanel" aria-labelledby={`gtab-${i}`} key={i}>
        <blockquote>
          <p className="guest__quote">&ldquo;{t.quote}&rdquo;</p>
          <footer>
            <cite>{t.name}</cite>
            {t.role && <span>{t.role}</span>}
          </footer>
        </blockquote>
        <button className="link" aria-expanded={full} aria-controls="gfull" onClick={() => setFull((f) => !f)}>
          {full ? "Close the note" : "Read the full note"}
        </button>
        <div id="gfull" className="guest__full" hidden={!full}>
          {t.full.map((p) => (
            <p key={p.slice(0, 30)}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
