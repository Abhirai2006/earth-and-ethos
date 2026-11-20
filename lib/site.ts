// ─────────────────────────────────────────────────────────────
//  SITE CONFIG — the one place to edit business details.
//  Anything marked TODO is a placeholder: fill it in before launch.
//  Empty strings are hidden automatically on the site and left
//  out of the structured data, so nothing fake is ever published.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: "Earth & Ethos",
  legalName: "Earth & Ethos", // TODO: confirm registered name (S&E registration certificate)
  tagline: "Architecture | Planning | Interiors",
  motto: "Rooted in purpose. Guided by design. Built to inspire.",
  url: "https://earthandethosarchitects.com",
  locale: "en_IN",
  city: "Bengaluru",
  region: "Karnataka",
  country: "IN",

  founder: {
    name: "Santhosh K S",
    title: "Ar. Santhosh K S",
    role: "Founder",
  },

  contact: {
    email: "", // TODO e.g. hello@earthandethosarchitects.com
    phone: "", // TODO e.g. +91 90000 00000  (shown as written, dialled without spaces)
    whatsapp: "", // TODO digits only with country code, e.g. 919000000000
    streetAddress: "", // TODO studio street address (optional)
    postalCode: "", // TODO
    mapsUrl: "", // TODO Google Maps share link (optional)
    hours: "", // TODO e.g. "Mon to Sat, 10:00 to 18:30"
  },

  social: {
    instagram: "", // TODO full URL
    linkedin: "", // TODO full URL
  },

  areaServed: ["Bengaluru", "Karnataka"],
  services: ["Architecture", "Interior Design", "Planning", "Site Supervision"],
} as const;

export const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export const absoluteUrl = (path = "/") =>
  new URL(path.endsWith("/") || path.includes(".") ? path : `${path}/`, site.url).toString();
