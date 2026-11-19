import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/site";
import { imageSet } from "@/lib/images";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-19");
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/work/"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((p) => ({
      url: absoluteUrl(`/work/${p.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.status === "completed" ? 0.8 : 0.7,
      images: [p.cover, ...p.gallery].slice(0, 10).map((g) => absoluteUrl(imageSet(g.k).src)),
    })),
    { url: absoluteUrl("/privacy/"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms/"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
