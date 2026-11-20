import { about } from "@/content/about";
import { process } from "@/content/process";
import { completed, ongoing } from "@/content/projects";
import { site } from "@/lib/site";
import Picture from "@/components/Picture";
import LogoMark from "@/components/Logo";
import ProcessIcon from "@/components/ui/ProcessIcon";
import "./profile.css";

// The studio profile, laid out like the website: a dark drawing-sheet cover,
// then rooms on limewash paper. Printed to /earth-and-ethos-studio-profile.pdf
// by `npm run profile` (scripts/make-profile-pdf.mjs). Not indexed.
export const metadata = { title: "Studio profile", robots: { index: false, follow: false } };

function Tag({ no, room, label }: { no: string; room: string; label: string }) {
  return (
    <p className="pf__tagline">
      <span className="pf__bubble"><span>{no}</span><span>A</span></span>
      <span><b>{room}</b><i>{label}</i></span>
    </p>
  );
}

function Sheet({ n, of, children, dark }: { n: number; of: number; children: React.ReactNode; dark?: boolean }) {
  return (
    <section className={`pf__page${dark ? " pf__page--dark" : ""}`}>
      {children}
      <footer className="pf__foot">
        <span>Earth &amp; Ethos, studio profile</span>
        <span>{site.url.replace("https://", "")}</span>
        <span>Sheet {n} / {of}</span>
      </footer>
    </section>
  );
}

export default function Profile() {
  const c = site.contact;
  const cover = completed.find((p) => p.slug === "athreya-mane") ?? completed[0];
  const PAGES = 4;
  const hall = completed.find((p) => p.slug === "gurukrupa")?.cover;
  return (
    <div className="pf">
      {/* 1. cover */}
      <Sheet n={1} of={PAGES} dark>
        <header className="pf__bar">
          <LogoMark className="pf__mark" title={null} outline="#2f3436" />
          <span className="pf__word">Earth &amp; Ethos</span>
          <span className="pf__bar-r">Studio profile</span>
        </header>
        <figure className="pf__cover">
          <Picture k={cover.cover.k} alt={cover.cover.alt} sizes="180mm" priority />
          <figcaption>{cover.title}, {cover.location}</figcaption>
        </figure>
        <div className="pf__title">
          <h1>Earth &amp; Ethos</h1>
          <p className="pf__services">Architecture, Planning &amp; Interiors</p>
          <p className="pf__motto">{site.motto}</p>
          <p className="pf__by">{site.founder.title}, {site.founder.role}. {site.city}.</p>
        </div>
      </Sheet>

      {/* 2. the studio */}
      <Sheet n={2} of={PAGES}>
        <Tag no="01" room="Foyer" label="About the studio" />
        <h2 className="pf__display">
          Here is who we are <em>and how we work.</em>
        </h2>
        <div className="pf__cols">
          <p className="pf__big">{about.intro[0]}</p>
          <div>
            {about.intro.slice(1).map((t) => (
              <p key={t.slice(0, 16)}>{t}</p>
            ))}
            <p className="pf__svc"><b>Services</b> {site.services.join(", ")}.</p>
          </div>
        </div>
        <ol className="pf__pillars">
          {about.pillars.map((v) => (
            <li key={v.n}>
              <span>{v.n}</span>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </li>
          ))}
        </ol>
        <p className="pf__line">{site.motto}</p>
        {hall && (
          <figure className="pf__band">
            <Picture k={hall.k} alt={hall.alt} sizes="180mm" priority />
            <figcaption>Gurukrupa, Hosakerehalli: the double-height hall under its pergola skylight.</figcaption>
          </figure>
        )}
      </Sheet>

      {/* 3. founder and process */}
      <Sheet n={3} of={PAGES}>
        <Tag no="02" room="Study" label="Meet the founder" />
        <div className="pf__founder">
          <div className="pf__pass">
            <span className="pf__clip" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/founder/santhosh-880.webp" width={880} height={1000} alt={`Portrait of ${site.founder.title}`} />
            <p className="pf__pass-name">{site.founder.title}</p>
            <p className="pf__pass-role">{site.founder.role}</p>
            <p className="pf__pass-foot"><span>Studio pass</span><span>{site.city}</span></p>
          </div>
          <div>
            <h2 className="pf__name"><em>Ar.</em> {site.founder.name}</h2>
            <p className="pf__lede">{about.founder.heading}</p>
            {about.founder.paragraphs.map((t) => (
              <p key={t.slice(0, 16)}>{t}</p>
            ))}
            <dl className="pf__facts">
              {about.founder.facts.map((f) => (
                <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
        <Tag no="03" room="Our process" label="From first meeting to life after handover" />
        <ol className="pf__process">
          {process.map((s) => (
            <li key={s.n}>
              <ProcessIcon n={s.n} className="pf__icon" />
              <span className="pf__tick" />
              <span className="pf__n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </Sheet>

      {/* 4. work and contact */}
      <Sheet n={4} of={PAGES}>
        <Tag no="04" room="Gallery" label="Completed works" />
        <div className="pf__work">
          {completed.map((p) => (
            <figure key={p.slug} className="pf__card">
              <Picture k={p.cover.k} alt={p.cover.alt} sizes="60mm" priority />
              <dl>
                <div className="pf__card-t"><dt>Project</dt><dd>{p.title}</dd></div>
                <div><dt>Type</dt><dd>{p.typology}</dd></div>
                <div><dt>Location</dt><dd>{p.location}</dd></div>
              </dl>
            </figure>
          ))}
        </div>
        <Tag no="05" room="Drawing board" label="Ongoing projects" />
        <div className="pf__work pf__work--small">
          {ongoing.map((p) => (
            <figure key={p.slug} className="pf__card">
              <Picture k={p.cover.k} alt={p.cover.alt} sizes="42mm" priority />
              <dl>
                <div className="pf__card-t"><dt>Project</dt><dd>{p.title}</dd></div>
                <div><dt>Type</dt><dd>{p.typology}</dd></div>
              </dl>
            </figure>
          ))}
        </div>
        <div className="pf__desk">
          <h2>Have a site in mind? <em>Let&rsquo;s talk.</em></h2>
          <dl>
            {c.email && <div><dt>Email</dt><dd>{c.email}</dd></div>}
            {c.phone && <div><dt>Phone and WhatsApp</dt><dd>{c.phone}</dd></div>}
            <div><dt>Studio</dt><dd>{[c.streetAddress, site.city, c.postalCode].filter(Boolean).join(", ")}</dd></div>
            <div><dt>Online</dt><dd>{site.url.replace("https://", "")}</dd></div>
          </dl>
        </div>
      </Sheet>
    </div>
  );
}
