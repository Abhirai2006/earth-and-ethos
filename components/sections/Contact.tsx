import { site, web3formsKey } from "@/lib/site";
import RoomTag from "@/components/ui/RoomTag";
import EnquiryForm from "./EnquiryForm";

export default function Contact() {
  const c = site.contact;
  const tel = c.phone.replace(/[^\d+]/g, "");
  return (
    <section id="desk" className="desk" data-tone="dark" aria-labelledby="desk-h">
      <div className="wrap desk__grid">
        <div className="desk__head">
          <RoomTag no="09" room="Front desk" label="Contact" />
          <h2 id="desk-h" className="display">Have a site in mind? Let&rsquo;s talk.</h2>
          <p>
            Tell us about your plot, your home or your building. We&rsquo;ll get back to you and find a time to
            talk it through.
          </p>
          <ul className="desk__list">
            {c.email && (
              <li>
                <span>Email</span>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
            )}
            {c.phone && (
              <li>
                <span>Phone</span>
                <a href={`tel:${tel}`}>{c.phone}</a>
              </li>
            )}
            {c.whatsapp && (
              <li>
                <span>WhatsApp</span>
                <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  Message on WhatsApp
                </a>
              </li>
            )}
            <li>
              <span>Studio</span>
              {c.mapsUrl ? (
                <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {[c.streetAddress, site.city, site.region].filter(Boolean).join(", ")}
                </a>
              ) : (
                <span>{[c.streetAddress, site.city, site.region].filter(Boolean).join(", ")}</span>
              )}
            </li>
            {c.hours && (
              <li>
                <span>Hours</span>
                <span>{c.hours}</span>
              </li>
            )}
          </ul>
        </div>
        <EnquiryForm accessKey={web3formsKey} fallbackEmail={c.email} />
      </div>
    </section>
  );
}
