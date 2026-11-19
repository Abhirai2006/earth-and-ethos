# Earth & Ethos — website

Portfolio site for **Earth & Ethos** (Architecture | Planning | Interiors), Ar. Santhosh K S, Bengaluru.
Next.js 16 (App Router), fully static export, deployed on Cloudflare Pages.

## The idea

The page is a house you walk into.

1. **Opening.** The logo draws itself as a line drawing.
2. **Walk-in (hero).** A procedural 3D building (three.js, no model files) starts as a blueprint line
   drawing, rises in brick, lime, timber and stone while the logo's sun comes up, then its doors open and you
   walk into a double-height hall with a brick wall, pergola skylight, mezzanine and an oonjal.
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
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Environment variables: `NODE_VERSION = 22`, `NEXT_PUBLIC_WEB3FORMS_KEY = <your key>`
3. **Contact form:** go to web3forms.com, enter the studio email, and copy the access key into the variable above,
   then redeploy. (For local testing, put it in `.env.local`; see `.env.example`.)
4. **Domain:** Pages project → **Custom domains → Set up a domain** → `earthandethosarchitects.com`, and add
   `www` too. The easiest route is to move the domain's DNS to Cloudflare: add the site in Cloudflare, then in
   GoDaddy → *Domain → DNS → Nameservers → Change* paste the two Cloudflare nameservers. Alternatively keep
   GoDaddy DNS and add the CNAME record Cloudflare shows you.
5. **SEO after launch:** add the domain in Google Search Console, submit `https://earthandethosarchitects.com/sitemap.xml`,
   and create or claim a Google Business Profile with the same name, address and phone as `lib/site.ts`.

`public/_headers` sets caching and security headers on Cloudflare.

## What's built in for SEO
- Static HTML for every page (crawlers see all text, no JS required)
- Per-page titles, descriptions and canonical URLs; Open Graph / Twitter image (`public/og.jpg`)
- `sitemap.xml` (with image entries), `robots.txt`, web manifest, icons
- JSON-LD: `ProfessionalService` (studio and founder) on every page, plus `CreativeWork` and `BreadcrumbList` per project
- Descriptive alt text on every image; one `<h1>` per page; semantic landmarks
