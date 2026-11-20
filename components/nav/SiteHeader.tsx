"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import LogoMark from "@/components/Logo";
import FloorPlan from "./FloorPlan";
import { rooms } from "@/lib/rooms";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");
  const [tone, setTone] = useState<"dark" | "light">(onHome ? "dark" : "light");
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  // which room is under the middle of the screen, and what tone is under the header
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);
      const probe = document.elementFromPoint(window.innerWidth / 2, 80); // just below the header
      const toneEl = probe?.closest("[data-tone]") as HTMLElement | null;
      setTone((toneEl?.dataset.tone as "dark" | "light") ?? "light");
      if (!onHome) return;
      const mid = window.innerHeight * 0.45;
      let current = "top";
      for (const r of rooms) {
        const el = document.getElementById(r.id);
        if (el && el.getBoundingClientRect().top <= mid) current = r.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [onHome, open]);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("is-locked");
    const first = dialog.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>("a, button");
        const a = f[0], b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("is-locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const go = (id: string) => {
    setOpen(false);
    if (onHome) document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    else router.push(`/#${id}`);
  };
  const activeRoom = rooms.find((r) => r.id === active);

  return (
    <>
      <header className={`header header--${tone}${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
        <Link href="/" className="header__brand" aria-label="Earth & Ethos home page">
          <LogoMark className="header__mark" title={null} />
          <span className="header__name">Earth &amp; Ethos</span>
        </Link>
        <div className="header__right">
          {onHome && (
            <div className="header__where" aria-hidden="true">
              <FloorPlan active={active} className="header__plan" />
              <span>
                <small>You are in</small>
                {activeRoom?.room}
              </span>
            </div>
          )}
          <Link href={href("desk")} className="btn btn--solid header__cta">
            Start a project
          </Link>
          <button
            ref={button}
            className="header__menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="header__burger" aria-hidden="true"><i /><i /></span>
            <span>{open ? "Close" : "Floor plan"}</span>
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        ref={dialog}
        className={`menu${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
      >
        <div className="menu__inner">
          <div className="menu__plan">
            <FloorPlan active={active} interactive onPick={go} />
            <p className="menu__note">Ground floor plan. Pick a room.</p>
          </div>
          <nav aria-label="Rooms">
            <ol className="menu__list">
              {rooms.map((r, i) => (
                <li key={r.id}>
                  <a href={href(r.id)} onClick={(e) => { e.preventDefault(); go(r.id); }} aria-current={active === r.id ? "true" : undefined}>
                    <span className="menu__no">{String(i).padStart(2, "0")}</span>
                    <span className="menu__room">{r.room}</span>
                    <span className="menu__label">{r.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <Link href="/work/" onClick={() => setOpen(false)}>
                  <span className="menu__no" aria-hidden="true">+</span>
                  <span className="menu__room">Archive</span>
                  <span className="menu__label">All projects</span>
                </Link>
              </li>
            </ol>
          </nav>
          <button className="menu__close" onClick={close}>Close</button>
        </div>
      </div>
    </>
  );
}
