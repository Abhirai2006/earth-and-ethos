"use client";

import { ReactNode, useEffect, useRef } from "react";

/** Pins the section and slides the drawing sheets sideways as you scroll (desktop). */
export default function DrawingBoardTrack({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current!, t = track.current!;
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference) and (pointer: fine)");
    let raf = 0;
    let dist = 0;
    const measure = () => {
      if (!mq.matches) {
        o.style.height = "";
        t.style.transform = "";
        o.dataset.pinned = "0";
        return;
      }
      o.dataset.pinned = "1";
      dist = Math.max(0, t.scrollWidth - window.innerWidth);
      o.style.height = `${dist + window.innerHeight}px`;
      tick();
    };
    const tick = () => {
      raf = 0;
      if (!mq.matches) return;
      const r = o.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, o.offsetHeight - window.innerHeight)));
      t.style.transform = `translate3d(${-p * dist}px,0,0)`;
      o.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={outer} className="board__outer">
      <div className="board__sticky">
        <div ref={track} className="board__track">
          {children}
        </div>
        <div className="board__progress" aria-hidden="true"><i /></div>
      </div>
    </div>
  );
}
