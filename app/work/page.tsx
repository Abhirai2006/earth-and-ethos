import Link from "next/link";
import { completed, ongoing, type Project } from "@/content/projects";
import Picture from "@/components/Picture";
import Footer from "@/components/sections/Footer";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Projects: homes, interiors and public buildings",
  description:
    "Completed and ongoing work by Earth & Ethos, Bengaluru: Athreya Mane, Gurukrupa, D.A.S.A Rangamandira, Banavara Vedike and more. Homes, interiors, cultural and institutional buildings.",
  path: "/work/",
});

function Card({ p, i }: { p: Project; i: number }) {
  return (
    <li className="wcard">
      <Link href={`/work/${p.slug}/`}>
        <div className="wcard__img">
          <Picture k={p.cover.k} alt={p.cover.alt} sizes="(min-width: 900px) 45vw, 92vw" priority={i < 2} />
          {p.renders && <span className="tag">Visualisation</span>}
        </div>
        <h3>{p.title}</h3>
        <p>
          {p.typology}
          {p.location && <>, {p.location}</>}
        </p>
      </Link>
    </li>
  );
}

export default function WorkIndex() {
  return (
    <>
      <section className="page" data-tone="light">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Home</Link> / Projects</p>
          <h1 className="display page__h1">Projects</h1>
          <p className="page__lede">Homes, interiors and buildings for communities, designed by Ar. Santhosh K S.</p>
          <h2 className="page__h2">Completed</h2>
          <ul className="wgrid">{completed.map((p, i) => <Card key={p.slug} p={p} i={i} />)}</ul>
          <h2 className="page__h2">Ongoing</h2>
          <ul className="wgrid">{ongoing.map((p, i) => <Card key={p.slug} p={p} i={i + 3} />)}</ul>
        </div>
      </section>
      <Footer />
    </>
  );
}
