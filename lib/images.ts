import manifest from "@/content/image-manifest.json";

type Entry = { w: number; h: number; widths: number[]; blur: string };
const M = manifest as Record<string, Entry>;

export function imageSet(k: string) {
  const m = M[k];
  if (!m) throw new Error(`Image not found in manifest: ${k} (run npm run images)`);
  const largest = m.widths[m.widths.length - 1];
  return {
    src: `/images/${k}-${largest}.webp`,
    srcSet: m.widths.map((w) => `/images/${k}-${w}.webp ${w}w`).join(", "),
    width: m.w,
    height: m.h,
    blur: m.blur,
    largest,
  };
}
