# Earth & Ethos — website

Portfolio site for **Earth & Ethos** (Architecture | Planning | Interiors), Ar. Santhosh K S, Bengaluru.
Next.js 16 (App Router), fully static export, deployed on Cloudflare Pages.

## The idea

The page is a house you walk into.

1. **Opening.** The logo draws itself as a line drawing.
2. **Walk-in (hero).** A physically rendered house (three.js, `components/hero/RealHouse.ts`, no model files).
   It starts as a line drawing, then a construction time-lapse follows real rules:
   - a physical sky, with the sun moving from morning to late afternoon so the shadows sweep across the facade,
   - walls laid in 85 mm brick courses,
   - jaali bricks and timber fins dropping into place under gravity, with dust where they land,
   - roof concrete that dries from dark to pale.
   Then the doors swing open on a spring and you walk into the hall. Inside there are sunlight shafts through the
   pergola, dust that glows only in the sun, and a swing moving with a pendulum's natural period, while the
   exposure adjusts the way your eyes do indoors. Grass and trees move in the wind. All textures are generated in
   code (`components/hero/textures.ts`). On slow GPUs the scene drops to lighter settings by itself.
3. After that, every section is a room on a floor plan (the **Floor plan** menu shows where you are):
   - **Foyer:** about the studio
   - **Study:** the founder
   - **Gallery:** completed works, each a doorway that opens to full-bleed as you scroll
   - **Drawing board:** ongoing works as drawing sheets with title blocks
   - **Material library:** craft details, in a lightbox
   - **Guest book:** testimonials
   - **Front desk:** contact
4. Every project has its own page at `/work/<slug>/` for SEO.

Reduced-motion users, and browsers without WebGL, get a still poster of the building instead of the 3D, with
no scroll choreography.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site → ./out  (must pass before deploying)
npm run lint
npm run images   # re-process photos: reads ../_raw/<folder>/*  → public/images + content/image-manifest.json
```

## Editing content

| What | Where |
| --- | --- |
| Phone, email, address, WhatsApp, Instagram, LinkedIn, hours | `lib/site.ts` (empty values are hidden automatically and left out of the SEO data) |
| About and founder text | `content/about.ts` |
| Projects (text, image choice, alt text) | `content/projects.ts` |
| Testimonials | `content/testimonials.ts` |
| Material-library images | `components/sections/Details.tsx` |
| Privacy / Terms text | `app/privacy/page.tsx`, `app/terms/page.tsx` |

### Adding photos to a project
1. Put the originals in `../_raw/<folder>/` (folder names are mapped in `scripts/process-images.mjs`).
2. `npm run images`. This writes responsive WebP files (640/1280/1920) with blur placeholders.
3. Reference them in `content/projects.ts` as `"<project>/<file-name-slug>"` with real alt text.

## Deploy: GitHub → Cloudflare Pages → GoDaddy domain

1. Push this folder to a GitHub repo (GitHub Desktop is fine).
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**, pick the repo.
   The site deploys as a Worker with static assets (see `wrangler.jsonc`), so use these settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Build output directory: leave empty (it is set in `wrangler.jsonc`, `"directory": "./out"`)
   - Variables and secrets: `NODE_VERSION = 22`, `NEXT_PUBLIC_WEB3FORMS_KEY = <your key>`,
     `NEXT_PUBLIC_SITE_URL = https://portfolio.earth-and-ethos.workers.dev` (change it to the real domain once it is connected)
   - Do **not** let Cloudflare run its Next.js auto-setup; with `wrangler.jsonc` in the repo it is skipped.
3. **Contact form:** go to web3forms.com, enter the studio email, and copy the access key into the variable above,
   then redeploy. (For local testing, put it in `.env.local`; see `.env.example`.)
4. **Domain:** Worker → **Settings → Domains & Routes → Add → Custom domain** → `earthandethosarchitects.com`, and add
   `www.earthandethosarchitects.com` too. The easiest route is to move the domain's DNS to Cloudflare: add the site in Cloudflare, then in
   GoDaddy → *Domain → DNS → Nameservers → Change* paste the two Cloudflare nameservers. Alternatively keep
   GoDaddy DNS and add the CNAME record Cloudflare shows you.
5. **SEO after launch:** add the domain in Google Search Console, submit `https://earthandethosarchitects.com/sitemap.xml`,
   and create or claim a Google Business Profile with the same name, address and phone as `lib/site.ts`.

`public/_headers` sets caching and security headers (supported by Workers static assets).

## What's built in for SEO
- Static HTML for every page (crawlers see all text, no JS required)
- Per-page titles, descriptions and canonical URLs; Open Graph / Twitter image (`public/og.jpg`)
- `sitemap.xml` (with image entries), `robots.txt`, web manifest, icons
- JSON-LD: `ProfessionalService` (studio and founder) on every page, plus `CreativeWork` and `BreadcrumbList` per project
- Descriptive alt text on every image; one `<h1>` per page; semantic landmarks

## Still needed from the studio (placeholders are in place until then)

| What | Where it goes | Until then |
| --- | --- | --- |
| WhatsApp number (digits with country code) | `lib/site.ts` → `contact.whatsapp` | The floating button says "Message us" and opens the contact form |
| Phone, email, street address, hours, Maps link | `lib/site.ts` → `contact` | Hidden on the site and left out of Google's structured data |
| Instagram / LinkedIn links | `lib/site.ts` → `social` | Hidden |
| Web3Forms key | Cloudflare variable `NEXT_PUBLIC_WEB3FORMS_KEY` | Form shows a "not connected yet" message |
| Cloudflare Web Analytics token | Cloudflare variable `NEXT_PUBLIC_CF_BEACON_TOKEN` | No analytics load |
| Google Search Console verification code | Cloudflare variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No verification tag |
| Real before/after photos (e.g. Gautham R Avadhani's rebuild) | `../_raw/stories/` + `content/stories.ts` | A line study traced from the Athreya Mane photo, captioned as an illustration |
| Drawings for other projects (plans, sections) | `drawings` in `content/projects.ts` | Only Banavara Vedike has drawings (contact box blurred) |
| Higher-resolution founder portrait | `public/images/founder/` | The supplied 317 × 413 px photo, backdrop recoloured to the brand tan |
| Kannada review by a native speaker | `content/kn.ts` | My translation |

After changing any studio details, run `npm run build && npm run profile` so the PDF picks them up.

## Google Business Profile and Search Console (one-time)
1. Search Console → Add property → URL prefix `https://earthandethosarchitects.com/` → HTML tag → paste the code into the Cloudflare variable above → redeploy → Verify.
2. Sitemaps → submit `sitemap.xml`.
3. business.google.com → add "Earth & Ethos", category "Architect", the same address and phone as `lib/site.ts`, website link, and upload project photos.

## Link previews (WhatsApp, LinkedIn, X)
Every page has a 1200 x 630 JPEG preview: `public/og.jpg` for the home page and `public/og/<project>.jpg` for each project
(regenerate with `npm run og`). Previews only work when `NEXT_PUBLIC_SITE_URL` matches the address the site is live on.
WhatsApp caches previews: after a change, share the link with `?v=2` on the end to see the new one.
