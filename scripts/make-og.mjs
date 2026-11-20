// Builds 1200 x 630 JPEG link-preview images for every project (WhatsApp,
// LinkedIn and X show JPEG reliably; not every app shows WebP).
// Usage: node scripts/make-og.mjs   (after npm run images)
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const manifest = JSON.parse(await fs.readFile("content/image-manifest.json", "utf8"));
const src = await fs.readFile("content/projects.ts", "utf8");
const re = /slug: "([^"]+)",\s*title: "([^"]+)",\s*location: "([^"]*)",\s*status: "(\w+)",\s*typology: "([^"]+)"[\s\S]*?cover: \{ k: (\w) \+ "([^"]+)"/g;
const prefix = { A: "athreya-mane/", G: "gurukrupa/", Y: "yamoksh-residence/", D: "dasa-rangamandira/", B: "banavara-vedike/", M: "me-riise-foundation/", V: "veena-mahesh-home/", N: "dinesh-home/", J: "jakkur-office/" };
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/–/g, "-");
await fs.mkdir("public/og", { recursive: true });
let m, n = 0;
while ((m = re.exec(src))) {
  const [, slug, title, location, status, typology, p, file] = m;
  const key = prefix[p] + file;
  const e = manifest[key];
  if (!e) continue;
  const img = path.join("public/images", `${key}-${e.widths[e.widths.length - 1]}.webp`);
  const sub = [typology, location].filter(Boolean).join(", ") + (status === "ongoing" ? "  /  Design visualisation" : "");
  const size = title.length > 18 ? 70 : 84;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#101415" stop-opacity=".92"/><stop offset=".6" stop-color="#101415" stop-opacity="0"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <text x="60" y="${600 - 96}" font-family="Georgia, serif" font-size="${size}" fill="#f2ede4">${esc(title)}</text>
    <text x="62" y="${600 - 48}" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="600" fill="#d2b495">${esc(sub)}</text>
    <text x="1140" y="62" text-anchor="end" font-family="Georgia, serif" font-size="30" fill="#f2ede4">Earth &amp; Ethos</text>
  </svg>`;
  await sharp(img).resize(1200, 630, { fit: "cover", position: "attention" }).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 82, mozjpeg: true }).toFile(`public/og/${slug}.jpg`);
  n++;
}
console.log(`${n} preview images → public/og/`);
