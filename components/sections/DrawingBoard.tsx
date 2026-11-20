import Link from "next/link";
import { ongoing } from "@/content/projects";
import { site } from "@/lib/site";
import Picture from "@/components/Picture";
import RoomTag from "@/components/ui/RoomTag";
import DrawingBoardTrack from "./DrawingBoardTrack";

export default function DrawingBoard() {
  return (
    <section id="drawing-board" className="board" data-tone="dark" aria-labelledby="board-h">
      <DrawingBoardTrack>
        <div className="board__lead">
          <RoomTag no="06" room="Drawing board" label="Ongoing works" />
          <h2 id="board-h" className="display">On the drawing board.</h2>
          <p>
            Six projects being designed or built right now: homes, interiors, an office, a performance centre and
            a college building in Hassan. The images are design renders.
          </p>
          <p className="board__hint" aria-hidden="true">Keep scrolling to see each sheet</p>
        </div>
        {ongoing.map((p, i) => (
          <article key={p.slug} className="sheet">
            <Link href={`/work/${p.slug}/`} className="sheet__img" aria-label={`${p.title}: view project`}>
              <Picture k={p.cover.k} alt={p.cover.alt} sizes="(min-width: 900px) 46vw, 88vw" />
              <span className="tag">Visualisation</span>
            </Link>
            <dl className="sheet__tb">
              <div className="sheet__tb-title">
                <dt>Project</dt>
                <dd>
                  <Link href={`/work/${p.slug}/`}>{p.title}</Link>
                </dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{p.typology}</dd>
              </div>
              {p.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{p.location}</dd>
                </div>
              )}
              {p.client && (
                <div>
                  <dt>Client</dt>
                  <dd>{p.client}</dd>
                </div>
              )}
              <div>
                <dt>Designed by</dt>
                <dd>{site.founder.title}</dd>
              </div>
              <div>
                <dt>Sheet</dt>
                <dd>A-{String(i + 1).padStart(2, "0")} / {String(ongoing.length).padStart(2, "0")}</dd>
              </div>
            </dl>
          </article>
        ))}
      </DrawingBoardTrack>
    </section>
  );
}
