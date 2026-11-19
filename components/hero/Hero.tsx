"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

type Cap = { from: number; to: number; kicker?: string; text: string };

// Narrative beats, keyed to scroll progress through the hero (0 → 1).
const CAPTIONS: Cap[] = [
  { from: 0.12, to: 0.27, kicker: "Sketch", text: "Every building begins as a line on paper." },
  { from: 0.34, to: 0.48, kicker: "Material", text: "Brick, lime, timber and stone give it weight." },
  { from: 0.55, to: 0.66, kicker: "Light", text: "Light and air give it life." },
  { from: 0.74, to: 0.9, kicker: "Threshold", text: "People make it a home. Come in." },
];

const fade = (p: number, a: number, b: number, edge = 0.025) => {
  if (p < a - edge || p > b + edge) return 0;
  const i = Math.min(1, (p - (a - edge)) / edge);
  const o = Math.min(1, (b + edge - p) / edge);
  return Math.max(0, Math.min(i, o));
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const veil = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"3d" | "static">("3d");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !hasWebGL()) {
      // one-time capability check on mount (needs window); not derived state
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("static");
      return;
    }
    const el = section.current!;
    const cv = canvas.current!;
    let disposed = false;
    let scene: import("./BuildingScene").BuildingScene | null = null;
    let lastReadout = "";

    const progress = () => {
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };

    const paint = () => {
      const p = progress();
      scene?.setProgress(p);
      if (title.current) {
        const o = 1 - Math.min(1, p / 0.09);
        title.current.style.opacity = String(o);
        title.current.style.transform = `translate3d(0, ${-p * 160}px, 0)`;
        title.current.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      if (cue.current) cue.current.style.opacity = String(1 - Math.min(1, p / 0.04));
      caps.current.forEach((c, i) => {
        if (!c) return;
        const cap = CAPTIONS[i];
        const o = fade(p, cap.from, cap.to);
        c.style.opacity = String(o);
        c.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`;
        c.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      if (veil.current) veil.current.style.opacity = String(Math.min(1, Math.max(0, (p - 0.93) / 0.07)));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };

    const onScroll = () => paint();
    const onResize = () => {
      scene?.resize(cv.clientWidth, cv.clientHeight);
      paint();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!scene) return;
        if (e.isIntersecting) scene.start();
        else scene.stop();
      },
      { rootMargin: "100px" },
    );

    import("./BuildingScene").then(({ BuildingScene }) => {
      if (disposed) return;
      const mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
      try {
        scene = new BuildingScene(cv, { mobile });
      } catch {
        setMode("static");
        return;
      }
      scene.onFirstFrame = () => setReady(true);
      scene.onFrame = ({ distanceToDoor, inside }) => {
        const txt = inside
          ? "Inside the hall"
          : distanceToDoor > 30
            ? "Site plan, scale 1:200"
            : `Threshold in ${distanceToDoor.toFixed(1)} m`;
        if (txt !== lastReadout && readout.current) {
          readout.current.textContent = txt;
          lastReadout = txt;
        }
      };
      scene.resize(cv.clientWidth, cv.clientHeight);
      paint();
      io.observe(el);
      scene.start();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    paint();
    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      scene?.dispose();
    };
  }, []);

  return (
    <section
      id="top"
      ref={section}
      className="hero"
      data-tone="dark"
      data-mode={mode}
      data-ready={ready ? "1" : "0"}
      aria-label="Introduction"
    >
      <div className="hero__sticky">
        <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
        <picture className="hero__poster">
          <source
            type="image/webp"
            srcSet="/images/brand/hero-poster-960.webp 960w, /images/brand/hero-poster-1920.webp 1920w"
            sizes="100vw"
          />
          <img src="/images/brand/hero-poster-1920.webp" alt="" width={1920} height={1080} />
        </picture>
        <div className="hero__scrim" aria-hidden="true" />

        <div ref={title} className="hero__title">
          <p className="hero__eyebrow">Architecture studio, {site.city}</p>
          <h1>
            <span className="hero__brand">Earth &amp; Ethos</span>
            <span className="hero__services">Architecture, Planning &amp; Interiors</span>
          </h1>
          <p className="hero__intro">
            Context-responsive, sustainable homes and buildings by Ar. {site.founder.name} —
            rooted in Karnataka&rsquo;s vernacular, built for how people live now.
          </p>
        </div>

        <div className="hero__captions">
          {CAPTIONS.map((c, i) => (
            <div key={c.kicker} ref={(n) => { caps.current[i] = n; }} className="hero__cap">
              <span className="hero__kicker">
                {String(i + 1).padStart(2, "0")} {c.kicker}
              </span>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        <div ref={cue} className="hero__cue" aria-hidden="true">
          <span>Scroll to walk in</span>
          <i />
        </div>

        <div className="hero__hud" aria-hidden="true">
          <span ref={readout}>Site plan, scale 1:200</span>
          <div className="hero__bar"><div ref={bar} /></div>
        </div>

        <a className="hero__skip" href="#foyer">Skip the walk-in</a>
        <div ref={veil} className="hero__veil" aria-hidden="true" />
      </div>
    </section>
  );
}
