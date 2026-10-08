const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = process.cwd();
const cleanDir = path.join(root, "public", "images", "clean-products");
const brandedDir = path.join(cleanDir, "branded");

fs.mkdirSync(brandedDir, { recursive: true });

const labelY = {
  "shield-shampoo-conditioner-1l": 0.43,
  "shield-snow-foam-1l": 0.43,
  "shield-xtreme-shampoo-500ml": 0.43,
  "shield-jetwasher-1l": 0.46,
  "shield-tyre-shine-500ml": 0.53,
  "shield-tyre-gloss-aerosol-400ml": 0.48,
  "shield-tyre-polish-paste-400ml": 0.46,
  "shield-max-shine-tyre-gel-500ml": 0.49,
  "shield-mag-cleaner-500ml": 0.47,
  "shield-miraplate-500ml": 0.48,
  "shield-power-force-degreaser-1l": 0.46,
  "shield-waterless-glass-cleaner-1l": 0.46,
  "shield-high-foam-shampoo-5l": 0.46,
  "shield-splash-wash-wax-1l": 0.43,
  "shield-sheen-silicone-500ml": 0.47,
  "shield-car-polish-paste-200ml": 0.45,
  "shield-blade-apc-750ml": 0.46,
  "shield-engine-cleaner-500ml": 0.47,
  "shield-splash-n-dash-sponge": 0.34,
  "shield-foam-applicator-pads-3": 0.32
};

function cleanEdgeLabelSvg(width, height) {
  const radius = Math.round(height * 0.16);
  const border = Math.max(2, Math.round(height * 0.025));
  const titleSize = Math.max(16, Math.round(height * 0.38));
  const subSize = Math.max(8, Math.round(height * 0.15));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#171717"/>
        <stop offset="0.55" stop-color="#0b0b0b"/>
        <stop offset="1" stop-color="#1d1d1d"/>
      </linearGradient>
    </defs>
    <rect x="${border/2}" y="${border/2}" width="${width-border}" height="${height-border}" rx="${radius}" fill="url(#bg)" fill-opacity="0.96" stroke="#ff4b35" stroke-width="${border}"/>
    <text x="${width/2}" y="${height*0.50}" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="800" letter-spacing="1.5">
      <tspan fill="#ffffff">CLEAN</tspan><tspan fill="#ff4b35">EDGE</tspan>
    </text>
    <text x="${width/2}" y="${height*0.79}" text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif" font-size="${subSize}" font-weight="600" letter-spacing="1.8" fill="#d7d7d7">PRO DETAILING</text>
  </svg>`;
}

async function findAlphaBounds(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + 3];
      if (alpha > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function buildBrandedImage(id) {
  const input = path.join(cleanDir, id + ".png");
  const output = path.join(brandedDir, id + ".png");
  if (!fs.existsSync(input)) return;

  const metadata = await sharp(input).metadata();
  const canvasWidth = metadata.width;
  const canvasHeight = metadata.height;
  if (!canvasWidth || !canvasHeight) return;

  const bounds = await findAlphaBounds(input);
  if (!bounds) return;

  // Small secondary label: much smaller than the bottle's existing Shield label.
  const labelWidth = Math.max(120, Math.round(bounds.width * 0.46));
  const labelHeight = Math.max(38, Math.round(bounds.height * 0.13));
  const x = Math.max(0, Math.round(bounds.minX + (bounds.width - labelWidth) / 2));
  const y = Math.max(0, Math.min(canvasHeight - labelHeight, Math.round(bounds.minY + bounds.height * (labelY[id] ?? 0.46))));

  const label = await sharp(Buffer.from(cleanEdgeLabelSvg(labelWidth, labelHeight)))
    .png()
    .toBuffer();

  const labelCanvas = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: label, left: x, top: y }])
    .png()
    .toBuffer();

  await sharp(input)
    .ensureAlpha()
    .composite([{ input: labelCanvas }])
    .png({ compressionLevel: 9 })
    .toFile(output);

  console.log("Branded product:", id, "label", labelWidth + "x" + labelHeight, "at", x + "," + y);
}

(async () => {
  for (const id of Object.keys(labelY)) await buildBrandedImage(id);
  console.log("CleanEdge branded Shield PNGs rebuilt with small fitted labels.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
