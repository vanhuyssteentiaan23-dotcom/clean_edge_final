const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const sharp = require("sharp");

const root = process.cwd();
const zipPath = path.join(root, "CleanEdge_HD_Originals.zip");
const outDir = path.join(root, "public", "images");
const cleanDir = path.join(outDir, "clean-products");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cleanDir, { recursive: true });

const shieldProducts = {
  "shield-shampoo-conditioner-1l": "https://www.shopshield.co.za/cdn/shop/files/5DC40291-980E-4468-856A-465DADC990B1.png?v=1716546634&width=1946",
  "shield-snow-foam-1l": "https://www.shopshield.co.za/cdn/shop/files/4E32778E-1973-404D-8E3F-204132BB7654.png?v=1716542756&width=1946",
  "shield-xtreme-shampoo-500ml": "https://www.shopshield.co.za/cdn/shop/files/PHOTO-2024-05-23-17-51-12.jpg?v=1716479654&width=1946",
  "shield-jetwasher-1l": "https://www.shopshield.co.za/cdn/shop/files/C7683177-4C18-4C04-BDC6-91CE4610764F.png?v=1716542047&width=1946",
  "shield-tyre-shine-500ml": "https://www.shopshield.co.za/cdn/shop/files/9E7E15CB-F37E-410D-BBA6-81AB5C3F90DA.png?v=1716562703&width=1946",
  "shield-tyre-gloss-aerosol-400ml": "https://www.shopshield.co.za/cdn/shop/files/1D5EDFE8-B480-4438-9E74-C2F4BDBC42BE.png?v=1716553116&width=1946",
  "shield-tyre-polish-paste-400ml": "https://www.shopshield.co.za/cdn/shop/files/D713A883-59EC-434C-8039-B0D020195CEE.png?v=1716559857&width=1946",
  "shield-max-shine-tyre-gel-500ml": "https://www.shopshield.co.za/cdn/shop/files/47F42304-8636-441B-86A8-41B74E2BE3AA_075c77ea-37a1-4819-890d-5f31337fb73e.png?v=1716554293&width=1946",
  "shield-mag-cleaner-500ml": "https://www.shopshield.co.za/cdn/shop/files/FDBFDF6E-72C9-4126-9FA9-8BA949766806.png?v=1716560208&width=1946",
  "shield-miraplate-500ml": "https://www.shopshield.co.za/cdn/shop/files/5A37F044-E699-4646-A10E-A484D78AE856.png?v=1716549242&width=1946",
  "shield-power-force-degreaser-1l": "https://www.shopshield.co.za/cdn/shop/files/0006-60307596719341819816_png.png?v=1725894512&width=1946",
  "shield-waterless-glass-cleaner-1l": "https://www.shopshield.co.za/cdn/shop/files/3B544585-5DA4-4219-A352-5285F71BEF77.png?v=1716563488&width=1946",
  "shield-high-foam-shampoo-5l": "https://www.shopshield.co.za/cdn/shop/files/0033-56901471048526235433_png.png?v=1721826155&width=1946",
  "shield-splash-wash-wax-1l": "https://www.shopshield.co.za/cdn/shop/files/D3381EAB-FE70-4B20-BA8F-B401AC6CBD02.png?v=1716545897&width=1946",
  "shield-sheen-silicone-500ml": "https://www.shopshield.co.za/cdn/shop/files/46140374-34B7-433D-9F6B-9B9549C79EF0.png?v=1716562405&width=1946",
  "shield-car-polish-paste-200ml": "https://www.shopshield.co.za/cdn/shop/files/C8CF9756-8384-4C34-B5A6-8B95CBEFC43E.png?v=1716549638&width=1946",
  "shield-blade-apc-750ml": "https://www.shopshield.co.za/cdn/shop/files/1F9BFDF9-02FC-4788-BCEF-848E43CF498A.png?v=1716565840&width=1946",
  "shield-engine-cleaner-500ml": "https://www.shopshield.co.za/cdn/shop/files/90E6F6DC-2C8D-4710-AC2D-F2C8E36776E7.png?v=1716564545&width=1946",
  "shield-splash-n-dash-sponge": "https://www.shopshield.co.za/cdn/shop/files/8628FAA0-2E05-4752-9462-215746595535.png?v=1716561845&width=1946",
  "shield-foam-applicator-pads-3": "https://www.shopshield.co.za/cdn/shop/files/0008-19696286120866091878_png.png?v=1717150327&width=1946"
};

const legacyFiles = [
  "microfiber-5.jpg","microfiber-10.jpg","microfiber-50.jpg","microfiber-black-10.jpg",
  "detail-brushes.jpg","drying-towel.jpg","cleaning-mitt.jpg","nitrile-gloves.jpg",
  "touch-up-pen.jpg","tire-rim-brush.jpg"
];

function isWhite(r,g,b) {
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  return max > 224 && (max-min) < 24;
}

async function removeBorderWhite(input, output) {
  const { data, info } = await sharp(input)
    .resize({ width: 1400, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0, tail = 0;

  const visit = (idx) => {
    if (idx < 0 || idx >= total || bg[idx]) return;
    const p = idx * channels;
    if (!isWhite(data[p], data[p+1], data[p+2])) return;
    bg[idx] = 1;
    queue[tail++] = idx;
  };

  for (let x=0;x<width;x++) { visit(x); visit((height-1)*width+x); }
  for (let y=0;y<height;y++) { visit(y*width); visit(y*width+width-1); }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    if (x > 0) visit(idx-1);
    if (x < width-1) visit(idx+1);
    if (idx >= width) visit(idx-width);
    if (idx < total-width) visit(idx+width);
  }

  for (let i=0;i<total;i++) {
    if (!bg[i]) continue;
    const p=i*channels;
    data[p+3]=0;
  }

  await sharp(data,{raw:{width,height,channels}})
    .png({compressionLevel:9})
    .toFile(output);
}

async function processLocalImage(name) {
  const source = path.join(outDir, name);
  if (!fs.existsSync(source)) return;
  const id = path.basename(name, path.extname(name));
  await removeBorderWhite(source, path.join(cleanDir, id + ".png"));
  console.log("Transparent product:", id);
}

(async () => {
  const carWashSource = path.join(root, "CleanEdge_car-wash-kit.jpg");
  if (fs.existsSync(carWashSource)) {
    const target = path.join(outDir, "car-wash-kit.jpg");
    await sharp(carWashSource).jpeg({quality:96, mozjpeg:true}).toFile(target);
    await processLocalImage("car-wash-kit.jpg");
  }

  if (fs.existsSync(zipPath)) {
    const zip = new AdmZip(zipPath);
    for (const name of legacyFiles) {
      const entry = zip.getEntries().find(e => path.basename(e.entryName) === name);
      if (!entry) continue;
      const temp = path.join(outDir, ".__original-" + name);
      fs.writeFileSync(temp, entry.getData());
      const target = path.join(outDir, name);
      await sharp(temp).jpeg({quality:96, mozjpeg:true}).toFile(target);
      fs.unlinkSync(temp);
      await processLocalImage(name);
    }
  }

  for (const [id, url] of Object.entries(shieldProducts)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not download " + id + ": " + response.status);
    const buffer = Buffer.from(await response.arrayBuffer());
    const source = path.join(cleanDir, ".__" + id);
    fs.writeFileSync(source, buffer);
    await removeBorderWhite(source, path.join(cleanDir, id + ".png"));
    fs.unlinkSync(source);
    console.log("Downloaded and cut out:", id);
  }

  console.log("CleanEdge transparent product images ready.");
})().catch(err => { console.error(err); process.exit(1); });
