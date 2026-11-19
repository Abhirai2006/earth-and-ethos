"use client";

import { RefObject, useEffect } from "react";

/**
 * Calls `cb(p)` with 0→1 progress of `ref` scrolling through the viewport
 * (0 when its top meets the top of the screen, 1 when its bottom meets the
 * bottom). Only listens while the element is near the viewport.
 * Under prefers-reduced-motion it reports 1 once and stops.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, cb: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cb(1);
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      cb(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        tick();
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(el);
    tick();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
