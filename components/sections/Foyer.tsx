import { about } from "@/content/about";
import Motto from "@/components/ui/Motto";
import { site } from "@/lib/site";
import RoomTag from "@/components/ui/RoomTag";

export default function Foyer() {
  return (
    <section id="foyer" className="foyer" data-tone="light" aria-labelledby="foyer-h">
      <div className="wrap">
        <RoomTag no="01" room="Foyer" label="About the studio" />
        <h2 id="foyer-h" className="display foyer__lede">
          You&rsquo;re inside now.
          <span>Here is who we are and how we work.</span>
        </h2>
        <div className="foyer__cols">
          <p className="foyer__big">{about.intro[0]}</p>
          <div className="foyer__small">
            {about.intro.slice(1).map((t) => (
              <p key={t.slice(0, 20)}>{t}</p>
            ))}
          </div>
        </div>
        <ol className="pillars">
          {about.pillars.map((p) => (
            <li key={p.n} className="pillar">
              <span className="pillar__n">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
        <Motto className="foyer__motto" text={site.motto} />
      </div>
    </section>
  );
}
