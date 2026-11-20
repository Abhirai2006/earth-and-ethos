import LegalPage from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";
import { site, cfBeaconToken } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy notice",
  description: "How Earth & Ethos handles the information you share through this website.",
  path: "/privacy/",
});

export default function Privacy() {
  const email = site.contact.email;
  return (
    <LegalPage title="Privacy notice" updated="19 November 2026">
      <p>
        This notice explains what information {site.name} (“we”) collects through this website and how we use it. We
        keep it short because we collect very little.
      </p>
      <h2>What we collect</h2>
      <p>
        If you send us a message through the enquiry form, we receive the details you enter: your name, email address,
        and optionally your phone number, project type, site location and message. We use these only to reply to you
        and to discuss your project.
      </p>
      <p>
        Form messages are delivered to us by email through Web3Forms, a form-delivery service. Web3Forms processes the
        message in order to deliver it; see their privacy policy at web3forms.com for details.
      </p>
      <h2>Cookies and tracking</h2>
      {cfBeaconToken && (
        <p>
          We count visits with Cloudflare Web Analytics, which does not use cookies or collect personal data. It tells us
          things like which pages are read most, never who you are.
        </p>
      )}
      <p>
        This website does not use cookies or advertising trackers. Your browser&rsquo;s session storage holds a
        single flag so the opening animation plays only once per visit; it never leaves your device. Fonts and images are
        served from this website itself.
      </p>
      <h2>How long we keep it</h2>
      <p>We keep enquiry emails only as long as needed to respond and, if we work together, for the length of the project and any records we are required to keep by law.</p>
      <h2>Your choices</h2>
      <p>
        You can ask us to see, correct or delete the information you sent us at any time
        {email ? <> by writing to <a href={`mailto:${email}`}>{email}</a></> : " through the contact form"}. We do not sell
        or share your information with anyone for marketing.
      </p>
      <h2>Changes</h2>
      <p>If we change how we handle information, we will update this page and the date above.</p>
    </LegalPage>
  );
}
