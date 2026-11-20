import Link from "next/link";
import { Noto_Serif_Kannada, Noto_Sans_Kannada } from "next/font/google";
import { kn } from "@/content/kn";
import { completed, ongoing } from "@/content/projects";
import Picture from "@/components/Picture";
import Footer from "@/components/sections/Footer";
import { pageMeta } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

const serif = Noto_Serif_Kannada({ subsets: ["kannada"], weight: ["400", "600"], variable: "--font-kn-serif", display: "swap" });
const sans = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "600"], variable: "--font-kn-sans", display: "swap" });

export const metadata = {
  ...pageMeta({
    title: "ಬೆಂಗಳೂರಿನ ವಾಸ್ತುಶಿಲ್ಪ ಸಂಸ್ಥೆ",
    description: "ಅರ್ಥ್ & ಎಥೋಸ್: ಬೆಂಗಳೂರಿನ ವಾಸ್ತುಶಿಲ್ಪ, ಯೋಜನೆ ಮತ್ತು ಒಳಾಂಗಣ ವಿನ್ಯಾಸ ಸಂಸ್ಥೆ. ಆರ್ಕಿಟೆಕ್ಟ್ ಸಂತೋಷ್ ಕೆ.ಎಸ್. ಅವರ ನೇತೃತ್ವದಲ್ಲಿ ಸುಸ್ಥಿರ ಮನೆಗಳು ಮತ್ತು ಕಟ್ಟಡಗಳು.",
    path: "/kn/",
  }),
  alternates: { canonical: absoluteUrl("/kn/"), languages: { "en-IN": absoluteUrl("/"), "kn-IN": absoluteUrl("/kn/") } },
};

export default function Kannada() {
  return (
    <div lang="kn" className={`kn ${serif.variable} ${sans.variable}`}>
      <section className="kn__hero" data-tone="dark">
        <div className="wrap">
          <p className="kn__lang"><Link href="/" hrefLang="en-IN">{kn.english}</Link></p>
          <h1>
            <span className="kn__brand" lang="en">Earth &amp; Ethos</span>
            <span className="kn__tag">{kn.tagline}</span>
          </h1>
          <p className="kn__intro">{kn.heroIntro}</p>
        </div>
      </section>

      <section className="kn__sec" data-tone="light">
        <div className="wrap">
          <h2>{kn.aboutTitle}</h2>
          <div className="kn__cols">
            {kn.about.map((p) => <p key={p.slice(0, 16)}>{p}</p>)}
          </div>
          <ol className="pillars kn__pillars">
            {kn.pillars.map((p) => (
              <li key={p.n} className="pillar">
                <span className="pillar__n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="kn__sec kn__sec--alt" data-tone="light">
        <div className="wrap kn__founder">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/founder/santhosh-880.webp" width={880} height={1000} alt="ಆರ್ಕಿಟೆಕ್ಟ್ ಸಂತೋಷ್ ಕೆ.ಎಸ್. ಅವರ ಭಾವಚಿತ್ರ" loading="lazy" />
          <div>
            <h2>{kn.founderTitle}</h2>
            <p className="kn__name">{kn.founderName}</p>
            {kn.founder.map((p) => <p key={p.slice(0, 16)}>{p}</p>)}
          </div>
        </div>
      </section>

      <section className="kn__sec" data-tone="light">
        <div className="wrap">
          <h2>{kn.processTitle}</h2>
          <ol className="process__list">
            {kn.process.map((s) => (
              <li key={s.n} className="process__step">
                <span className="process__n">{s.n}</span>
                <span className="process__tick" aria-hidden="true" />
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="kn__sec kn__sec--alt" data-tone="light">
        <div className="wrap">
          <h2>{kn.workTitle}</h2>
          {[{ h: kn.completed, list: completed }, { h: kn.ongoing, list: ongoing }].map(({ h, list }) => (
            <div key={h}>
              <h3 className="kn__h3">{h}</h3>
              <ul className="wgrid">
                {list.map((p) => (
                  <li key={p.slug} className="wcard">
                    <Link href={`/work/${p.slug}/`}>
                      <div className="wcard__img">
                        <Picture k={p.cover.k} alt={p.cover.alt} sizes="(min-width: 900px) 45vw, 92vw" />
                      </div>
                      <h3 lang="en">{p.title}</h3>
                      <p>{kn.typology[p.typology] ?? p.typology}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="kn__sec kn__contact" data-tone="dark">
        <div className="wrap">
          <h2>{kn.contactTitle}</h2>
          <p>{kn.contactBody}</p>
          <p><Link className="btn btn--solid" href="/#desk">{kn.contactCta}</Link></p>
          <ul className="kn__reach">
            {site.contact.phone && <li>{kn.phone}: <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`}>{site.contact.phone}</a></li>}
            {site.contact.whatsapp && <li><a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">{kn.whatsapp}</a></li>}
            {site.contact.email && <li>{kn.email}: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>}
          </ul>
          <p className="kn__city">{kn.city}</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
