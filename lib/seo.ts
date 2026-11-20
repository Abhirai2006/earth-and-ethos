import type { Metadata } from "next";
import { site, absoluteUrl } from "./site";
import type { Project } from "@/content/projects";
import { imageSet } from "./images";

export const defaultDescription =
  "Earth & Ethos is an architecture, planning and interior design studio in Bengaluru, led by Ar. Santhosh K S. We design sustainable homes and buildings that draw on Karnataka's traditional ways of building.";

export function pageMeta({
  title,
  description = defaultDescription,
  path = "/",
  image = "/og.jpg",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      locale: site.locale,
      title: title ? `${title} | ${site.name}` : `${site.name} | Architects in ${site.city}`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${site.name}, architecture studio in ${site.city}` }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

const clean = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined && !(Array.isArray(v) && !v.length)));

export function organizationLd() {
  const c = site.contact;
  return clean({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#studio"),
    name: site.name,
    alternateName: "Earth & Ethos Architects",
    description: defaultDescription,
    url: site.url,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/og.jpg"),
    email: c.email,
    telephone: c.phone,
    address: clean({
      "@type": "PostalAddress",
      streetAddress: c.streetAddress,
      postalCode: c.postalCode,
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    }),
    areaServed: site.areaServed.map((n) => ({ "@type": "Place", name: n })),
    knowsAbout: ["Architecture", "Interior design", "Planning", "Sustainable architecture", "Vernacular architecture"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: site.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
    },
    founder: {
      "@type": "Person",
      name: site.founder.name,
      jobTitle: "Architect",
      alumniOf: [
        { "@type": "CollegeOrUniversity", name: "BMS College of Architecture" },
        { "@type": "CollegeOrUniversity", name: "Indian Institute of Science" },
      ],
    },
    sameAs: [site.social.instagram, site.social.linkedin].filter(Boolean),
  });
}

export function projectLd(p: Project) {
  const img = imageSet(p.cover.k);
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: p.title,
      about: p.typology,
      description: p.summary,
      url: absoluteUrl(`/work/${p.slug}/`),
      image: absoluteUrl(img.src),
      creator: { "@id": absoluteUrl("/#studio") },
      ...(p.location ? { locationCreated: { "@type": "Place", name: p.location } } : {}),
      creativeWorkStatus: p.status === "completed" ? "Completed" : "In progress",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/work/") },
        { "@type": "ListItem", position: 3, name: p.title, item: absoluteUrl(`/work/${p.slug}/`) },
      ],
    },
  ];
}

