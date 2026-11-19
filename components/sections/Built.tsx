import Link from "next/link";
import { completed } from "@/content/projects";
import Picture from "@/components/Picture";
import RoomTag from "@/components/ui/RoomTag";
import Doorway from "./Doorway";

export default function Built() {
  return (
    <section id="built" className="built" aria-labelledby="built-h">
      <div className="built__intro" data-tone="light">
        <div className="wrap">
          <RoomTag no="03" room="Gallery" label="Completed works" />
          <h2 id="built-h" className="display">
            Three doors. Three homes, built and lived in.
          </h2>
          <p className="built__sub">Step through each doorway. Every photograph here is of finished, occupied work.</p>
        </div>
      </div>
      {completed.map((p, i) => (
        <Doorway
          key={p.slug}
          index={i}
          info={
            <>
              <p className="door__no">Door {String(i + 1).padStart(2, "0")}</p>
              <h3 className="door__title">{p.title}</h3>
              <p className="door__meta">
                {p.typology}
                {p.location && <> in {p.location}</>}
              </p>
              <p className="door__sum">{p.summary}</p>
              <Link href={`/work/${p.slug}/`} className="btn btn--ghost-light">
                Walk through {p.title}
              </Link>
            </>
          }
        >
          <Picture k={p.cover.k} alt={p.cover.alt} sizes="100vw" />
        </Doorway>
      ))}
    </section>
  );
}
