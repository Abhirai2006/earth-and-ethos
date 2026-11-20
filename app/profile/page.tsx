import { about } from "@/content/about";
import { process } from "@/content/process";
import { completed, ongoing } from "@/content/projects";
import { site } from "@/lib/site";
import Picture from "@/components/Picture";
import LogoMark from "@/components/Logo";
import "./profile.css";

// Two A4 pages, printed to /earth-and-ethos-studio-profile.pdf by
// `npm run profile` (see scripts/make-profile-pdf.mjs). Not indexed.
export const metadata = { title: "Studio profile", robots: { index: false, follow: false } };

export default function Profile() {
  const c = site.contact;
  return (
    <div className="pf">
      <section className="pf__page">
        <header className="pf__top">
          <LogoMark className="pf__logo" title={null} />
          <div>
            <p className="pf__brand">Earth &amp; Ethos</p>
            <p className="pf__tag">{site.tagline}</p>
          </div>
          <p className="pf__motto">{site.motto}</p>
        </header>
        <div className="pf__grid">
          <div>
            <h2>The studio</h2>
            {about.intro.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
            <h2>Services</h2>
            <p>{site.services.join(", ")}.</p>
            <h2>What we stand for</h2>
            <div className="pf__values">
              {about.pillars.map((v) => (
                <div key={v.n}>
                  <h3>{v.title}</h3>
                  <p>{v.body}</p>
                </div>
              ))}
            </div>
            <h2>How we work</h2>
            <ol className="pf__process">
              {process.map((s) => (
                <li key={s.n}><b>{s.n} {s.title}.</b> {s.body}</li>
              ))}
            </ol>
          </div>
          <aside className="pf__founder">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/founder/santhosh-634.webp" width={634} height={826} alt={`Portrait of ${site.founder.title}`} />
            <p className="pf__name">{site.founder.title}</p>
            <p className="pf__role">{site.founder.role}</p>
            <dl>
              {about.founder.facts.map((f) => (
                <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
      <section className="pf__page">
        <h2 className="pf__h">Completed work</h2>
        <div className="pf__work">
          {completed.map((p) => (
            <figure key={p.slug}>
              <Picture k={p.cover.k} alt={p.cover.alt} sizes="60mm" priority />
              <figcaption><b>{p.title}</b> {p.typology}{p.location && <>, {p.location}</>}</figcaption>
            </figure>
          ))}
        </div>
        <h2 className="pf__h">In design and on site</h2>
        <div className="pf__work pf__work--small">
          {ongoing.map((p) => (
            <figure key={p.slug}>
              <Picture k={p.cover.k} alt={p.cover.alt} sizes="40mm" priority />
              <figcaption><b>{p.title}</b> {p.typology}</figcaption>
            </figure>
          ))}
        </div>
        <footer className="pf__contact">
          <p className="pf__brand">Let&rsquo;s talk about your site.</p>
          <ul>
            <li>{site.url.replace("https://", "")}</li>
            {c.email && <li>{c.email}</li>}
            {c.phone && <li>{c.phone}</li>}
            <li>{[c.streetAddress, site.city, site.region].filter(Boolean).join(", ")}</li>
          </ul>
          <p className="pf__note">Images of ongoing projects are design visualisations.</p>
        </footer>
      </section>
    </div>
  );
}
