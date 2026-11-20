"use client";

import { useRef, useState } from "react";

type Side = { src: string; srcSet: string; alt: string; label: string; w: number; h: number };

/** Drag (or use the arrow keys on the handle) to compare two aligned images. */
export default function BeforeAfter({ before, after }: { before: Side; after: Side }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const fromEvent = (x: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={box}
      className="ba"
      style={{ ["--pos" as string]: `${pos}%`, aspectRatio: `${after.w} / ${after.h}` }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        fromEvent(e.clientX);
      }}
      onPointerMove={(e) => e.buttons && fromEvent(e.clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ba__img" src={after.src} srcSet={after.srcSet} sizes="(min-width: 900px) 70vw, 94vw" alt={after.alt} width={after.w} height={after.h} loading="lazy" draggable={false} />
      <div className="ba__before" aria-hidden="false">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ba__img" src={before.src} srcSet={before.srcSet} sizes="(min-width: 900px) 70vw, 94vw" alt={before.alt} width={before.w} height={before.h} loading="lazy" draggable={false} />
      </div>
      <span className="ba__label ba__label--l">{before.label}</span>
      <span className="ba__label ba__label--r">{after.label}</span>
      <input
        className="ba__range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${before.label} and ${after.label}`}
      />
      <span className="ba__handle" aria-hidden="true" />
    </div>
  );
}
