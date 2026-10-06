const fs = require("fs");

const path = require("path");
const AdmZip = require("adm-zip");
const sharp = require("sharp");

const root = process.cwd();
const zipPath = path.join(root, "CleanEdge_HD_Originals.zip");
const outDir = path.join(root, "public", "images");

if (!fs.existsSync(zipPath)) {
  throw new Error("CleanEdge_HD_Originals.zip is missing from the repository.");
}

fs.mkdirSync(outDir, { recursive: true });

const carWashSource = path.join(root, "CleanEdge_car-wash-kit.jpg");
const carWashTarget = path.join(outDir, "car-wash-kit.jpg");
if (fs.existsSync(carWashSource)) {
  fs.copyFileSync(carWashSource, carWashTarget);
  console.log("Copied car wash kit image");
}

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

(async () => {
for (const entry of zip.getEntries()) {
  const name = path.basename(entry.entryName);
  if (allowed.has(name)) {
    const target = path.join(outDir, name);
    const temp = path.join(outDir, `.__original-${name}`);
    fs.writeFileSync(temp, entry.getData());
    await sharp(temp)
      .metadata()
      .then(({ width, height }) => sharp(temp)
        .extract({ left: 0, top: 0, width, height: Math.floor(height * 0.945) })
        .jpeg({ quality: 96, mozjpeg: true })
        .toFile(target)
      );
    fs.unlinkSync(temp);
    console.log("Extracted and cleaned", name);
  }
}

const missing = [...allowed].filter((name) => !fs.existsSync(path.join(outDir, name)));
if (missing.length) {
  throw new Error("Missing product images: " + missing.join(", "));
}

console.log("CleanEdge HD product images ready.");
})();
