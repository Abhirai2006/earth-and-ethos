"use client";

import { ReactNode, useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

/** A doorway that opens to full-bleed as you scroll — walking into the project. */
export default function Doorway({ children, info, index }: { children: ReactNode; info: ReactNode; index: number }) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, (p) => {
    // open during the first 55% of the scroll, hold, then let it go
    const k = Math.min(1, p / 0.55);
    const e = 1 - Math.pow(1 - k, 3);
    ref.current?.style.setProperty("--k", e.toFixed(4));
    ref.current?.style.setProperty("--p", p.toFixed(4));
  });
  return (
    <article ref={ref} className={`door${index % 2 ? " door--alt" : ""}`} data-tone="dark">
      <div className="door__stage">
        <div className="door__frame">{children}</div>
        <div className="door__jamb" aria-hidden="true" />
        <div className="door__info">{info}</div>
      </div>
    </article>
  );
}
