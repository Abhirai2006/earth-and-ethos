// Generates favicon/app icons from the vector mark and a web logo from the supplied PNG.
// Usage: node scripts/brand-assets.mjs [path-to-logo.png]
import sharp from "sharp";
import fs from "node:fs/promises";

const leaves = [[468,768,372,622],[548,655,652,528],[512,836,664,772],[470,942,308,936],[580,1048,656,898],[612,1166,482,1252]];
function leafPath(bx, by, tx, ty) {
  const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, w = len * 0.42;
  const p = (a, b) => `${a.toFixed(1)},${b.toFixed(1)}`;
  return `M${bx},${by} C${p(bx+dx*.25+nx*w, by+dy*.25+ny*w)} ${p(bx+dx*.8+nx*w*.55, by+dy*.8+ny*w*.55)} ${tx},${ty} C${p(bx+dx*.8-nx*w*.55, by+dy*.8-ny*w*.55)} ${p(bx+dx*.25-nx*w, by+dy*.25-ny*w)} ${bx},${by}Z`;
}
const mark = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="240 0 1120 1310">${bg ? `<rect x="240" y="0" width="1120" height="1310" fill="${bg}"/>` : ""}
<path d="M800,195 A448,448 0 0 0 700,1079.7 L700,830 L800,772 Z" fill="#D2B495"/>
<path d="M824,57 L1216,283 L1216,462 L998,588 L998,655 L824,757 Z" fill="#8C6249"/>
<path d="M722,843 L998,684 L998,1207 L722,1207 Z" fill="#7A8B73"/>
<path d="M1019,605 L1294,449 L1294,1207 L1019,1207 Z" fill="#3E4444"/>
<path d="M725,1198 C560,1132 468,984 476,852 C482,748 516,694 548,655" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>
<path d="M725,1198 C560,1132 468,984 476,852 C482,748 516,694 548,655" fill="none" stroke="#7A8B73" stroke-width="14" stroke-linecap="round"/>
${leaves.map((l) => `<path d="${leafPath(...l)}" fill="#7A8B73" stroke="#fff" stroke-width="12" stroke-linejoin="round"/>`).join("\n")}
</svg>`;

await fs.writeFile("app/icon.svg", mark(null));
const square = (size, bg) =>
  sharp(Buffer.from(mark(null)), { density: 300 })
    .resize(Math.round(size * 0.78), Math.round(size * 0.78), { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: Math.round(size * 0.11), bottom: size - Math.round(size * 0.78) - Math.round(size * 0.11), left: Math.round(size * 0.11), right: size - Math.round(size * 0.78) - Math.round(size * 0.11), background: bg })
    .flatten({ background: bg })
    .png();
await square(180, "#f2ede4").toFile("app/apple-icon.png");
await square(192, "#f2ede4").toFile("public/icon-192.png");
await square(512, "#f2ede4").toFile("public/icon-512.png");

const logo = process.argv[2];
if (logo) {
  await sharp(logo).resize(600, 600, { fit: "contain", background: "#ffffff" }).flatten({ background: "#ffffff" }).png().toFile("public/logo.png");
}
console.log("brand assets written");
