// Prints /profile/ to public/earth-and-ethos-studio-profile.pdf.
// Run after `npm run build`:  npm run profile
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright is needed once to print the PDF: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  try {
    const f = await readFile(path.join(root, p));
    res.writeHead(200, { "Content-Type": types[path.extname(p)] ?? "application/octet-stream" });
    res.end(f);
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(4199);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:4199/profile/", { waitUntil: "networkidle" });
await page.addStyleTag({ content: "header.header,.fab,.skip,.intro{display:none!important}" });
await page.pdf({ path: "public/earth-and-ethos-studio-profile.pdf", format: "A4", printBackground: true, margin: { top: "0", bottom: "0", left: "0", right: "0" } });
await browser.close();
server.close();
console.log("wrote public/earth-and-ethos-studio-profile.pdf");
