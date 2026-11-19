import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Earth & Ethos: Architecture, Planning, Interiors",
    short_name: "Earth & Ethos",
    start_url: "/",
    display: "standalone",
    background_color: "#f2ede4",
    theme_color: "#1b2427",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
