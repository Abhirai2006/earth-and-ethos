import Link from "next/link";
import LogoMark from "@/components/Logo";
import { site } from "@/lib/site";

export default function Footer() {
  const s = site.social;
  return (
    <footer className="footer" data-tone="dark">
      <div className="wrap">
        <div className="footer__top">
          <LogoMark className="footer__mark" outline="#1f2526" />
          <div>
            <p className="footer__word">Earth &amp; Ethos</p>
            <p className="footer__tag">{site.tagline}</p>
          </div>
          <p className="footer__motto">{site.motto}</p>
        </div>
        <div className="footer__cols">
          <nav aria-label="Footer">
            <ul>
              <li><Link href="/#foyer">About</Link></li>
              <li><Link href="/#built">Completed works</Link></li>
              <li><Link href="/#drawing-board">Ongoing works</Link></li>
              <li><Link href="/work/">All projects</Link></li>
              <li><Link href="/#desk">Contact</Link></li>
            </ul>
          </nav>
          <ul>
            {s.instagram && <li><a href={s.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
            {s.linkedin && <li><a href={s.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
            {site.contact.email && <li><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>}
            <li>{site.city}, {site.region}</li>
          </ul>
          <ul>
            <li><Link href="/privacy/">Privacy notice</Link></li>
            <li><Link href="/terms/">Terms of use</Link></li>
          </ul>
        </div>
        <p className="footer__legal">
          © {new Date().getFullYear()} {site.legalName}. All rights reserved. Images marked
          “Visualisation” are design renders of projects in progress.
        </p>
      </div>
    </footer>
  );
}
