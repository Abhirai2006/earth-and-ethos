"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Sitewide smooth scroll. Off entirely for prefers-reduced-motion and touch. */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: 0 } });
    const onChange = () => reduce.matches && lenis.destroy();
    reduce.addEventListener("change", onChange);
    return () => {
      reduce.removeEventListener("change", onChange);
      lenis.destroy();
    };
  }, []);
  return null;
}
