"use client";

import { useEffect, useRef } from "react";
import { process } from "@/content/process";
import RoomTag from "@/components/ui/RoomTag";
import ProcessIcon from "@/components/ui/ProcessIcon";

/**
 * The process as a path drawn across a site sheet. On wide screens the
 * section pins while you scroll: a line is ruled from step to step, each
 * step's sketch draws itself as the line reaches it, and the step number
 * stands large in the background. On phones it is a vertical path that
 * fills as each step comes into view.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>(".process__step"));
    const ghost = el.querySelector<HTMLElement>(".process__ghost");
    const wide = window.matchMedia("(min-width: 1000px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const N = steps.length;
    let raf = 0;
    let shown = -2;
    const paint = () => {
      raf = 0;
      let on: number;
      let fill: number;
      if (still.matches) {
        on = N - 1;
        fill = 1;
      } else if (wide.matches) {
        const r = el.getBoundingClientRect();
        const span = el.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)) * 1.12);
        fill = p;
        on = Math.min(N - 1, Math.floor(p * N + 0.02));
        if (p <= 0.002) on = -1;
      } else {
        const line = window.innerHeight * 0.72;
        on = -1;
        steps.forEach((s, i) => {
          if (s.getBoundingClientRect().top < line) on = i;
        });
        fill = on < 0 ? 0 : (on + 0.5) / N;
      }
      el.style.setProperty("--fill", fill.toFixed(4));
      if (on !== shown) {
        shown = on;
        steps.forEach((s, i) => {
          s.classList.toggle("is-on", i <= on);
          s.classList.toggle("is-now", i === on);
        });
        if (ghost) ghost.textContent = process[Math.max(0, on)].n;
      }
    };
    const ask = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    wide.addEventListener("change", ask);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
      wide.removeEventListener("change", ask);
    };
  }, []);

  return (
    <section id="process" ref={root} className="process" data-tone="light" aria-labelledby="process-h">
      <div className="process__stage">
        <span className="process__ghost" aria-hidden="true">01</span>
        <div className="wrap">
          <RoomTag no="03" room="Our process" label="From first meeting to life after handover" />
          <h2 id="process-h" className="display">How a project comes together.</h2>
          <div className="process__track">
          <span className="process__rail" aria-hidden="true">
            <span className="process__fill" />
          </span>
          <ol className="process__list">
            {process.map((s) => (
              <li key={s.n} className="process__step">
                <ProcessIcon n={s.n} className="process__icon" />
                <span className="process__tick" aria-hidden="true" />
                <span className="process__n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
