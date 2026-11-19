import type { NextConfig } from "next";

// Static export: `npm run build` writes a fully static site to ./out,
// which Cloudflare Pages serves directly (build output directory: out).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
