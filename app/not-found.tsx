import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page nf" data-tone="light">
      <div className="wrap">
        <p className="crumbs">404</p>
        <h1 className="display page__h1">This room isn&rsquo;t on the plan.</h1>
        <p className="page__lede">The page you were looking for doesn&rsquo;t exist, or has moved.</p>
        <p><Link className="btn btn--solid" href="/">Back to the entrance</Link></p>
      </div>
    </section>
  );
}
