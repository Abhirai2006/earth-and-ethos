import { imageSet } from "@/lib/images";

type Props = {
  k: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
};

/** Responsive WebP image with a blurred placeholder. Works in a static export. */
export default function Picture({ k, alt, sizes = "100vw", className, priority, fit = "cover" }: Props) {
  const s = imageSet(k);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={s.src}
      srcSet={s.srcSet}
      sizes={sizes}
      alt={alt}
      width={s.width}
      height={s.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={{ backgroundImage: `url(${s.blur})`, backgroundSize: "cover", objectFit: fit }}
    />
  );
}
