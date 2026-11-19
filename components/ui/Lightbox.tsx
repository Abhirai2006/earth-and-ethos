"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

export type LbItem = { src: string; srcSet: string; alt: string; caption?: string; w: number; h: number };

/**
 * Wrap any server-rendered grid. Elements with data-lb="<index>" open the
 * lightbox at that index. Keyboard: ←/→ to move, Esc to close.
 */
export default function LightboxGroup({ items, children, className }: { items: LbItem[]; children: ReactNode; className?: string }) {
  const [i, setI] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);

  const close = useCallback(() => {
    setI(null);
    opener.current?.focus();
  }, []);
  const step = useCallback((d: number) => setI((v) => (v === null ? v : (v + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (i === null) return;
    document.documentElement.classList.add("is-locked");
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        e.preventDefault();
        closeBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("is-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [i, close, step]);

  const item = i === null ? null : items[i];
  return (
    <div
      className={className}
      onClick={(e) => {
        const t = (e.target as HTMLElement).closest<HTMLElement>("[data-lb]");
        if (!t) return;
        e.preventDefault();
        opener.current = t;
        setI(Number(t.dataset.lb));
      }}
    >
      {children}
      {item && (
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${i! + 1} of ${items.length}`}
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <figure className="lb__fig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={item.src} src={item.src} srcSet={item.srcSet} sizes="94vw" alt={item.alt} width={item.w} height={item.h} />
            <figcaption>
              <span>{item.caption ?? item.alt}</span>
              <span className="lb__count">
                {i! + 1} / {items.length}
              </span>
            </figcaption>
          </figure>
          <button className="lb__btn lb__prev" onClick={() => step(-1)} aria-label="Previous image">←</button>
          <button className="lb__btn lb__next" onClick={() => step(1)} aria-label="Next image">→</button>
          <button ref={closeBtn} className="lb__close" onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
