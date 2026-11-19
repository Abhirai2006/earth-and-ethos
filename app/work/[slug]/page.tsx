import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import Picture from "@/components/Picture";
import LightboxGroup from "@/components/ui/Lightbox";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/sections/Footer";
import { pageMeta, projectLd } from "@/lib/seo";
import { toLb } from "@/lib/lightbox";
import { imageSet } from "@/lib/images";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const where = p.location ? ` in ${p.location}` : "";
  return pageMeta({
    title: `${p.title}: ${p.typology}${where}`,
    description: `${p.summary} ${p.status === "completed" ? "Completed" : "Ongoing"} project by Earth & Ethos, ${site.city}.`.slice(0, 300),
    path: `/work/${p.slug}/`,
    image: imageSet(p.cover.k).src.replace(/-\d+\.webp$/, "-1280.webp"),
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];
  const items = p.gallery.map((g) => toLb(g.k, g.alt));

  return (
    <>
      <article className="proj">
        <header className="proj__hero" data-tone="dark">
          <Picture k={p.cover.k} alt={p.cover.alt} priority sizes="100vw" />
          <div className="proj__heroText wrap">
            <p className="crumbs">
              <Link href="/">Home</Link> / <Link href="/work/">Projects</Link> / {p.title}
            </p>
            <h1 className="display">{p.title}</h1>
            <p>
              {p.typology}
              {p.location && <> in {p.location}</>}
            </p>
          </div>
          {p.renders && <span className="tag proj__tag">Visualisation</span>}
        </header>

        <section className="proj__body wrap" data-tone="light">
          <dl className="titleblock proj__facts">
            <div><dt>Status</dt><dd>{p.status === "completed" ? "Completed" : "Ongoing"}</dd></div>
            <div><dt>Type</dt><dd>{p.typology}</dd></div>
            {p.location && <div><dt>Location</dt><dd>{p.location}</dd></div>}
            {p.scope && <div><dt>Scope</dt><dd>{p.scope}</dd></div>}
            {p.client && <div><dt>Client</dt><dd>{p.client}</dd></div>}
            <div><dt>Architect</dt><dd>{site.founder.title}</dd></div>
          </dl>
          <div className="proj__text">
            <p className="proj__lede">{p.summary}</p>
            {p.description.map((d) => <p key={d.slice(0, 24)}>{d}</p>)}
            <ul className="proj__features">
              {p.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        </section>

        <section className="proj__gallery wrap" aria-label={`${p.title} gallery`} data-tone="light">
          {p.renders && (
            <p className="proj__note">These images are design visualisations of a project in progress, not photographs.</p>
          )}
          <LightboxGroup items={items} className="pgrid">
            {p.gallery.map((g, i) => (
              <button key={g.k} type="button" className="pgrid__item" data-lb={i} aria-label={`Enlarge: ${g.alt}`}>
                <Picture k={g.k} alt={g.alt} sizes="(min-width: 900px) 45vw, 92vw" />
              </button>
            ))}
          </LightboxGroup>
        </section>

        <nav className="proj__next" aria-label="Next project" data-tone="dark">
          <Link href={`/work/${next.slug}/`} className="wrap">
            <span>Next door</span>
            <strong className="display">{next.title}</strong>
            <span>{next.typology}</span>
          </Link>
        </nav>
      </article>
      <JsonLd data={projectLd(p)} />
      <Footer />
    </>
  );
}
