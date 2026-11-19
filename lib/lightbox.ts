import { imageSet } from "@/lib/images";
import type { LbItem } from "@/components/ui/Lightbox";

export const toLb = (k: string, alt: string, caption?: string): LbItem => {
  const s = imageSet(k);
  return { src: s.src, srcSet: s.srcSet, alt, caption, w: s.width, h: s.height };
};
