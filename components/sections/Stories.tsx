import { stories } from "@/content/stories";
import { imageSet } from "@/lib/images";
import RoomTag from "@/components/ui/RoomTag";
import BeforeAfter from "@/components/ui/BeforeAfter";

const side = (k: string, alt: string, label: string) => {
  const s = imageSet(k);
  return { src: s.src, srcSet: s.srcSet, alt, label, w: s.width, h: s.height };
};

export default function Stories() {
  return (
    <section id="stories" className="stories" data-tone="light" aria-labelledby="stories-h">
      <div className="wrap">
        <RoomTag no="05" room="Site stories" label="Before and after" />
        <h2 id="stories-h" className="display">{stories[0].title}</h2>
        {stories.map((s) => (
          <figure key={s.title} className="stories__fig">
            <BeforeAfter before={side(s.before.k, s.before.alt, s.before.label)} after={side(s.after.k, s.after.alt, s.after.label)} />
            <figcaption>
              {s.caption}
              {s.illustration && <span className="stories__note"> The line study is an illustration traced from the photograph.</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
