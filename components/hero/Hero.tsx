"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { CHAPTERS } from "./chapters";
import type { Ambience } from "@/lib/ambience";

const isNightHour = () => {
  const h = new Date().getHours();
  return h >= 19 || h < 6;
};

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
  const [sound, setSound] = useState(false);
  const [night, setNight] = useState(false);
  const houseRef = useRef<import("./RealHouse").RealHouse | null>(null);
  const amb = useRef<Ambience | null>(null);
  const place = useRef({ inside: 0, present: 1 });

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
      const inside = Math.min(1, Math.max(0, (p - 0.62) / 0.14));
      const present = p > 0.97 ? Math.max(0, 1 - (p - 0.97) / 0.03) : 1;
      place.current = { inside, present };
      amb.current?.setPlace(inside, present);
      el.style.setProperty("--p", p.toFixed(4));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setStarted(p > 0.03);
    };
    const onResize = () => {
      house?.resize(cv.clientWidth, cv.clientHeight);
      paint();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) house?.start();
        else house?.stop();
        amb.current?.setPlace(place.current.inside, e.isIntersecting ? place.current.present : 0);
      },
      { rootMargin: "100px" },
    );

    import("./RealHouse").then(({ RealHouse }) => {
      if (disposed) return;
      try {
        house = new RealHouse(cv, { mobile });
      } catch {
        setMode("static");
        return;
      }
      houseRef.current = house;
      const n = isNightHour();
      house.setNight(n, true);
      setNight(n);
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
      amb.current?.close();
    };
  }, []);

  const toggleSound = async () => {
    if (!amb.current) {
      const { Ambience } = await import("@/lib/ambience");
      amb.current = new Ambience();
    }
    if (sound) amb.current.disable();
    else {
      await amb.current.enable();
      amb.current.setPlace(place.current.inside, place.current.present);
    }
    setSound(!sound);
  };
  const toggleNight = () => {
    houseRef.current?.setNight(!night);
    setNight(!night);
  };

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
          <span className="hero__room">{CHAPTERS[chapter].label}</span>
        </p>

        <div className="hero__cue" aria-hidden="true">
          <span>Scroll to build, then walk in</span>
          <i />
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__hud">
          {mode === "3d" && (
            <>
              <button className="hero__tog" onClick={toggleNight} aria-pressed={night} aria-label={night ? "Switch the house to evening" : "Switch the house to night"}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {night ? (
                    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="currentColor" />
                  ) : (
                    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="12" r="4.2" />
                      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                    </g>
                  )}
                </svg>
                <span>{night ? "Night" : "Evening"}</span>
              </button>
              <button className="hero__tog" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Turn sound off" : "Turn sound on"}>
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
                  {sound ? <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
                </svg>
                <span>{sound ? "Sound on" : "Sound off"}</span>
              </button>
            </>
          )}
          <a className="hero__skip" href="#foyer">Skip</a>
          <div className="hero__bar" aria-hidden="true"><div ref={bar} /></div>
        </div>
      </div>
    </section>
  );
}
