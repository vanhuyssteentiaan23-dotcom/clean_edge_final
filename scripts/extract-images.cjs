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

(async () => {
  if (fs.existsSync(carWashSource)) {
    const metadata = await sharp(carWashSource).metadata();
    const width = metadata.width ?? 297;
    const height = metadata.height ?? 300;
    const keepHeight = Math.max(1, height - Math.round(height * 0.105));

    await sharp(carWashSource)
      .extract({ left: 0, top: 0, width, height: keepHeight })
      .resize({ width: 1800, height: 1800, fit: "fill" })
      .jpeg({ quality: 96, mozjpeg: true })
      .toFile(carWashTarget);

    console.log("Upscaled and cleaned car wash kit image");
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

  for (const entry of zip.getEntries()) {
    const name = path.basename(entry.entryName);
    if (!allowed.has(name)) continue;

    const target = path.join(outDir, name);
    const temp = path.join(outDir, `.__original-${name}`);
    fs.writeFileSync(temp, entry.getData());

    const metadata = await sharp(temp).metadata();
    const width = metadata.width;
    const height = metadata.height;

    if (!width || !height) {
      fs.unlinkSync(temp);
      throw new Error(`Could not read dimensions for ${name}`);
    }

    // Remove the baked-in supplier quantity/color badge from the actual
    // image, then resize back to the original dimensions so card height
    // stays unchanged and no CSS overlay/mask is required.
    const keepHeight = Math.max(1, height - Math.round(height * 0.10));

    await sharp(temp)
      .extract({ left: 0, top: 0, width, height: keepHeight })
      .resize({ width, height, fit: "fill" })
      .jpeg({ quality: 96, mozjpeg: true })
      .toFile(target);

    fs.unlinkSync(temp);
    console.log("Extracted, cleaned and preserved HD dimensions:", name);
  }

  const required = [...allowed, "car-wash-kit.jpg"];
  const missing = required.filter((name) => !fs.existsSync(path.join(outDir, name)));
  if (missing.length) {
    throw new Error("Missing product images: " + missing.join(", "));
  }

  console.log("CleanEdge HD product images ready.");
})();
