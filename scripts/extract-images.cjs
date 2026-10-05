const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const root = process.cwd();
const zipPath = path.join(root, "CleanEdge_HD_Originals.zip");
const outDir = path.join(root, "public", "images");

if (!fs.existsSync(zipPath)) {
  throw new Error("CleanEdge_HD_Originals.zip is missing from the repository.");
}

fs.mkdirSync(outDir, { recursive: true });

const zip = new AdmZip(zipPath);
const allowed = new Set([
  "microfiber-5.jpg",
  "microfiber-10.jpg",
  "microfiber-50.jpg",
  "microfiber-black-10.jpg",
  "detail-brushes.jpg",
  "drying-towel.jpg",
  "cleaning-mitt.jpg",
  "nitrile-gloves.jpg",
  "touch-up-pen.jpg",
  "tire-rim-brush.jpg"
]);

for (const entry of zip.getEntries()) {
  const name = path.basename(entry.entryName);
  if (allowed.has(name)) {
    fs.writeFileSync(path.join(outDir, name), entry.getData());
    console.log("Extracted", name);
  }
}

const missing = [...allowed].filter((name) => !fs.existsSync(path.join(outDir, name)));
if (missing.length) {
  throw new Error("Missing product images: " + missing.join(", "));
}

console.log("CleanEdge HD product images ready.");
