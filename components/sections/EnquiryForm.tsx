"use client";

import { FormEvent, useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

export default function EnquiryForm({ accessKey, fallbackEmail }: { accessKey: string; fallbackEmail: string }) {
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.botcheck) return; // honeypot
    if (!accessKey) {
      setState("error");
      setMsg(
        fallbackEmail
          ? `The form isn't connected yet. Please email ${fallbackEmail} instead.`
          : "The form isn't connected yet (missing Web3Forms key).",
      );
      return;
    }
    setState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          access_key: accessKey,
          subject: `New enquiry from ${data.name || "the website"}`,
          from_name: "Earth & Ethos website",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
        setMsg(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Couldn't reach the server. Check your connection and try again.");
    }
  }

  if (state === "sent") {
    return (
      <div className="form__done" role="status">
        <p className="display">Thank you.</p>
        <p>Your message is on the desk. Expect a reply within two working days.</p>
        <button className="link" onClick={() => setState("idle")}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate={false}>
      <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="field">
        <label htmlFor="f-name">Your name</label>
        <input id="f-name" name="name" required autoComplete="name" />
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input id="f-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="f-phone">Phone <span>(optional)</span></label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="f-type">What are you planning?</label>
          <select id="f-type" name="project_type" defaultValue="">
            <option value="" disabled>Choose one</option>
            <option>A new home</option>
            <option>Interiors</option>
            <option>Renovation or rebuild</option>
            <option>Institutional or commercial building</option>
            <option>Planning or site supervision</option>
            <option>Something else</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-site">Where is the site? <span>(optional)</span></label>
          <input id="f-site" name="site_location" placeholder="Area, city" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-msg">Tell us about the project</label>
        <textarea id="f-msg" name="message" rows={4} required placeholder="Plot size, timeline, what matters most to you…" />
      </div>
      <div className="form__foot">
        <button className="btn btn--solid" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="form__note">
          We only use your details to reply to you. See the <a href="/privacy/">privacy notice</a>.
        </p>
      </div>
      {state === "error" && (
        <p className="form__error" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}
