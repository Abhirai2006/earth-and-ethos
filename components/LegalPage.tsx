import Link from "next/link";
import Footer from "@/components/sections/Footer";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <section className="page legal" data-tone="light">
        <div className="wrap">
          <p className="crumbs"><Link href="/">Home</Link> / {title}</p>
          <h1 className="display page__h1">{title}</h1>
          <p className="legal__date">Last updated {updated}</p>
          <div className="legal__body">{children}</div>
        </div>
      </section>
      <Footer />
    </>
  );
}
