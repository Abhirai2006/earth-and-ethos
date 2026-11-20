"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Floating chat button. Appears after the walk-in. Falls back to the contact form until a number is set. */
export default function WhatsAppFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("top");
      const limit = hero ? hero.offsetHeight - window.innerHeight * 0.5 : 300;
      setShow(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const num = site.contact.whatsapp;
  const text = encodeURIComponent("Hello Earth & Ethos, I'd like to talk about a project.");
  const href = num ? `https://wa.me/${num}?text=${text}` : "/#desk";
  return (
    <a
      className={`fab${show ? " is-shown" : ""}`}
      href={href}
      target={num ? "_blank" : undefined}
      rel={num ? "noopener noreferrer" : undefined}
      aria-label={num ? "Chat with us on WhatsApp" : "Send us a message"}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.7 4.8 2 6.8L3.6 29l6.8-1.8c1.8 1 3.8 1.5 5.6 1.5 7.2 0 13-5.6 13-12.6S23.2 3 16 3zm0 23.2c-1.7 0-3.5-.5-5-1.4l-.4-.2-4 1 1.1-3.9-.3-.4c-1-1.6-1.6-3.6-1.6-5.6C5.8 10.1 10.4 5.6 16 5.6s10.2 4.5 10.2 10-4.6 10.6-10.2 10.6zm5.6-7.7c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"
        />
      </svg>
      <span>{num ? "WhatsApp" : "Message us"}</span>
    </a>
  );
}
