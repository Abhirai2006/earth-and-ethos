import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/nav/SiteHeader";
import SmoothScroll from "@/components/providers/SmoothScroll";
import JsonLd from "@/components/JsonLd";
import { organizationLd, pageMeta } from "@/lib/seo";
import { site, cfBeaconToken, googleVerification } from "@/lib/site";
import WhatsAppFab from "@/components/ui/WhatsAppFab";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  ...pageMeta({}),
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Architects in ${site.city}: Architecture, Planning & Interiors`,
    template: `%s | ${site.name}`,
  },
  applicationName: site.name,
  authors: [{ name: site.founder.title }],
  creator: site.name,
  keywords: [
    "architect in Bengaluru",
    "architects in Bangalore",
    "residential architect Bengaluru",
    "interior designer Bengaluru",
    "sustainable architecture Karnataka",
    "vernacular architecture",
    "brick jaali",
    "Earth and Ethos",
    "Santhosh K S architect",
  ],
  formatDetection: { telephone: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  alternates: { ...pageMeta({}).alternates, languages: { "en-IN": site.url + "/", "kn-IN": site.url + "/kn/" } },
};

export const viewport: Viewport = {
  themeColor: "#1b2427",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* skip the opening sequence on repeat visits within a session */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('ee-intro'))document.documentElement.classList.add('no-intro');sessionStorage.setItem('ee-intro','1')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <SiteHeader />
        <SmoothScroll />
        <main id="main">{children}</main>
        <WhatsAppFab />
        <JsonLd data={organizationLd()} />
        {cfBeaconToken && (
          <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: cfBeaconToken })} />
        )}
      </body>
    </html>
  );
}
