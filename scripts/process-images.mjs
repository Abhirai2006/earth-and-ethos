// Converts the client's raw photos/renders into responsive WebP sets.
// Usage: npm run images -- [rawDir]
// rawDir defaults to ../_raw (one folder per project, as downloaded from Drive).
// Output: public/images/<project>/<name>-<w>.webp  +  content/image-manifest.json
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const RAW = path.resolve(process.argv[2] ?? "../_raw");
const OUT = path.resolve("public/images");
const MANIFEST = path.resolve("content/image-manifest.json");
const WIDTHS = [640, 1280, 1920];

const FOLDERS = {
  gurukrupa: "gurukrupa",
  athreya: "athreya-mane",
  yamoksh: "yamoksh-residence",
  meriise: "me-riise-foundation",
  banavara: "banavara-vedike",
  dasa: "dasa-rangamandira",
  veena: "veena-mahesh-home",
  dinesh: "dinesh-home",
  jakkur: "jakkur-office",
  stock: "stock", // licensed third-party photography (Unsplash), credited in content/hero.ts
};

const slug = (s) =>
  s
    .replace(/\.(png|jpe?g)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const manifest = {};
for (const [src, dest] of Object.entries(FOLDERS)) {
  const dir = path.join(RAW, src);
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  } catch {
    console.warn("skip (missing):", dir);
    continue;
  }
  await fs.mkdir(path.join(OUT, dest), { recursive: true });
  for (const f of files.sort()) {
    const name = slug(f);
    const key = `${dest}/${name}`;
    const { info } = await sharp(path.join(dir, f)).rotate().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const widths = WIDTHS.filter((x) => x <= w);
    if (!widths.length) widths.push(w);
    for (const width of widths) {
      const file = path.join(OUT, dest, `${name}-${width}.webp`);
      try {
        await fs.access(file);
        continue;
      } catch {}
      await sharp(path.join(dir, f))
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width > 1000 ? 74 : 72, effort: 5 })
        .toFile(file);
    }
    const blurBuf = await sharp(path.join(dir, f)).rotate().resize(16).webp({ quality: 40 }).toBuffer();
    manifest[key] = {
      w,
      h,
      widths,
      blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    };
    process.stdout.write(".");
  }
}
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
console.log(`\n${Object.keys(manifest).length} images → ${MANIFEST}`);
