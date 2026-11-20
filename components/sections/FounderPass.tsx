"use client";

import { useEffect, useRef } from "react";
import LogoMark from "@/components/Logo";
import { site } from "@/lib/site";

/**
 * A studio pass on a lanyard. The strap is a Verlet rope (gravity, length
 * constraints, a little air drag); the card hangs from its end. It drops in
 * when the section comes into view and can be grabbed and flung.
 * Reduced motion: it simply hangs still.
 */
export default function FounderPass() {
  const box = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const strap = useRef<SVGPathElement>(null);
  const strapText = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = box.current!, c = card.current!;
    const N = 11, SEG = 21;
    const pts = Array.from({ length: N }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
    let anchorX = 0;
    const layout = () => {
      anchorX = el.clientWidth / 2;
    };
    layout();
    const reset = (dropFrom: number) => {
      pts.forEach((p, i) => {
        p.x = p.px = anchorX + Math.sin(i * 0.9) * 1.5; // nearly straight, a little natural kink
        p.y = p.py = -dropFrom + i * 4;
      });
      pts[0].x = pts[0].px = anchorX;
      pts[0].y = pts[0].py = 0;
    };
    let cardAng = 0;
    const draw = () => {
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < N; i++) {
        const mx = (pts[i - 1].x + pts[i].x) / 2, my = (pts[i - 1].y + pts[i].y) / 2;
        d += ` Q${pts[i - 1].x},${pts[i - 1].y} ${mx},${my}`;
      }
      d += ` L${pts[N - 1].x},${pts[N - 1].y}`;
      strap.current?.setAttribute("d", d);
      strapText.current?.setAttribute("d", d);
      const a = pts[N - 1], b = pts[N - 3];
      // the card has its own inertia: it only follows the strap when the strap is taut
      const taut = Math.hypot(a.x - b.x, a.y - b.y) > SEG * 1.8;
      const target = taut ? Math.max(-1.2, Math.min(1.2, Math.atan2(a.x - b.x, a.y - b.y))) : cardAng * 0.96;
      cardAng += (target - cardAng) * 0.3;
      c.style.transform = `translate(${a.x - c.offsetWidth / 2}px, ${a.y}px) rotate(${(-cardAng * 180) / Math.PI}deg)`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pts.forEach((p, i) => {
        p.x = anchorX;
        p.y = i * SEG;
      });
      draw();
      return;
    }

    reset(0);
    pts.forEach((p, i) => {
      p.x = p.px = anchorX;
      p.y = p.py = i * SEG;
    });
    draw();

    const G = 2400; // px/s², the card feels about A6-sized at this scale
    let raf = 0, last = 0, running = false, dropped = false;
    let drag: { id: number; ox: number; oy: number } | null = null;
    let target = { x: 0, y: 0 };

    const step = (now: number) => {
      const dt = Math.min(1 / 30, (now - (last || now)) / 1000) || 1 / 60;
      last = now;
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        const vx = (p.x - p.px) * 0.988, vy = (p.y - p.py) * 0.988; // air drag
        p.px = p.x;
        p.py = p.y;
        const heavy = i === N - 1 ? 1 : 0.35; // most of the weight is the card
        p.x += vx;
        p.y += vy + G * heavy * dt * dt;
      }
      if (drag) {
        const e = pts[N - 1];
        e.x = target.x;
        e.y = target.y;
      }
      for (let k = 0; k < 14; k++) {
        pts[0].x = anchorX;
        pts[0].y = 0;
        for (let i = 1; i < N; i++) {
          const a = pts[i - 1], b = pts[i];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - SEG) / dist;
          // the rope only resists stretching, it can go slack
          if (diff <= 0) continue;
          const wa = i === 1 ? 0 : 0.5;
          const wb = drag && i === N - 1 ? 0 : 1 - wa;
          a.x += dx * diff * wa;
          a.y += dy * diff * wa;
          b.x -= dx * diff * wb;
          b.y -= dy * diff * wb;
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!dropped) {
            dropped = true;
            reset(420);
          }
          start();
        } else stop();
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      const p = local(e);
      const end = pts[N - 1];
      drag = { id: e.pointerId, ox: end.x - p.x, oy: end.y - p.y };
      target = { x: end.x, y: end.y };
      c.setPointerCapture(e.pointerId);
      c.classList.add("is-grabbed");
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = local(e);
      target = { x: p.x + drag.ox, y: p.y + drag.oy };
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      c.classList.remove("is-grabbed");
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div ref={box} className="pass">
      <svg className="pass__strap" aria-hidden="true">
        <path ref={strap} className="pass__band" />
        <path ref={strapText} id="pass-strap" fill="none" stroke="none" />
        <text className="pass__print" dy="3.5">
          <textPath href="#pass-strap" startOffset="4">
            EARTH &amp; ETHOS · EARTH &amp; ETHOS · EARTH &amp; ETHOS ·
          </textPath>
        </text>
      </svg>
      <div ref={card} className="pass__card">
        <span className="pass__clip" aria-hidden="true" />
        <div className="pass__head">
          <LogoMark className="pass__logo" title={null} />
          <span>Earth &amp; Ethos</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="pass__photo"
          src="/images/founder/santhosh-880.webp"
          srcSet="/images/founder/santhosh-440.webp 440w, /images/founder/santhosh-880.webp 880w"
          sizes="250px"
          width={880}
          height={1000}
          alt={`Portrait of ${site.founder.title}, founder of Earth & Ethos`}
          draggable={false}
        />
        <div className="pass__body">
          <p className="pass__name">{site.founder.title}</p>
          <p className="pass__role">{site.founder.role}</p>
          <div className="pass__foot">
            <span>Studio pass</span>
            <span>{site.city}</span>
          </div>
          <div className="pass__scale" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
