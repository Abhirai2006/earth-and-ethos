import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms of use",
  description: "Terms for using the Earth & Ethos website and its content.",
  path: "/terms/",
});

export default function Terms() {
  return (
    <LegalPage title="Terms of use" updated="19 November 2026">
      <p>By using this website you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Content and copyright</h2>
      <p>
        All designs, drawings, photographs, visualisations and text on this website belong to {site.name} or are used
        with permission. You may view and share links to them, but you may not copy, reproduce or use them commercially
        without our written consent.
      </p>
      <h2>Visualisations</h2>
      <p>
        Images labelled “Visualisation” are design renders of projects in progress. They show design intent; the
        finished buildings may differ.
      </p>
      <h2>No professional advice</h2>
      <p>
        The information here is a general introduction to our work. It is not professional advice for any specific
        project. Any engagement is governed by a separate written agreement.
      </p>
      <h2>Links</h2>
      <p>We are not responsible for the content of external websites we link to.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts of {site.city}, {site.region} have jurisdiction.</p>
    </LegalPage>
  );
}
