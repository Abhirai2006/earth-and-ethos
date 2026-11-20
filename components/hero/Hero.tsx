"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { CHAPTERS } from "./chapters";

function hasWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"3d" | "static">("3d");
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !hasWebGL2()) {
      // one-time capability check on mount (needs window); not derived state
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("static");
      return;
    }
    const el = section.current!;
    const cv = canvas.current!;
    const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
    let house: import("./RealHouse").RealHouse | null = null;
    let disposed = false;

    const progress = () => {
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const paint = () => {
      const p = progress();
      house?.setProgress(p);
      el.style.setProperty("--p", p.toFixed(4));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setStarted(p > 0.03);
    };
    const onResize = () => {
      house?.resize(cv.clientWidth, cv.clientHeight);
      paint();
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? house?.start() : house?.stop()), { rootMargin: "100px" });

    import("./RealHouse").then(({ RealHouse }) => {
      if (disposed) return;
      try {
        house = new RealHouse(cv, { mobile });
      } catch {
        setMode("static");
        return;
      }
      house.onReady = () => setReady(true);
      house.onChapter = (i) => setChapter(i);
      house.resize(cv.clientWidth, cv.clientHeight);
      paint();
      io.observe(el);
      house.start();
      setReady(true); // the line drawing needs no textures; show it straight away
    });

    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", onResize);
    paint();
    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener("scroll", paint);
      window.removeEventListener("resize", onResize);
      house?.dispose();
    };
  }, []);

  return (
    <section
      id="top"
      ref={section}
      className={`hero${started ? " is-walking" : ""}`}
      data-tone="dark"
      data-mode={mode}
      data-ready={ready ? "1" : "0"}
      aria-label="Introduction"
    >
      <div className="hero__sticky">
        <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero__title">
          <p className="hero__eyebrow">Architecture studio, {site.city}</p>
          <h1>
            <span className="hero__brand">Earth &amp; Ethos</span>
            <span className="hero__services">Architecture, Planning &amp; Interiors</span>
          </h1>
          <p className="hero__intro">
            Homes and buildings that suit their site, their climate and the people in them. Designed by Ar.{" "}
            {site.founder.name}.
          </p>
        </div>

        <p className="hero__credit" aria-live="polite">
          <span className="hero__count">
            {String(chapter + 1).padStart(2, "0")}
            <i>/{String(CHAPTERS.length).padStart(2, "0")}</i>
          </span>
          <span className="hero__room">{CHAPTERS[chapter].label}</span>
        </p>

        <div className="hero__cue" aria-hidden="true">
          <span>Scroll to build, then walk in</span>
          <i />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__hud">
          <a className="hero__skip" href="#foyer">Skip</a>
          <div className="hero__bar" aria-hidden="true"><div ref={bar} /></div>
        </div>
      </div>
    </section>
  );
}
