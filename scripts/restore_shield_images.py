from pathlib import Path
from io import BytesIO
import requests
import numpy as np
import cv2
from PIL import Image

OUT = Path("public/images/clean-products")
OUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "shield-high-foam-shampoo-5l.png": ("https://www.shopshield.co.za/cdn/shop/files/0033-56901471048526235433_png.png?v=1721826155&width=1946", None),
    "shield-shampoo-conditioner-1l.png": ("https://www.shopshield.co.za/cdn/shop/files/5DC40291-980E-4468-856A-465DADC990B1.png?v=1716546634&width=1946", None),
    "shield-sheen-silicone-500ml.png": ("https://www.shopshield.co.za/cdn/shop/files/46140374-34B7-433D-9F6B-9B9549C79EF0.png?v=1716562405&width=1946", None),
    "shield-tyre-polish-paste-400ml.png": ("https://www.shopshield.co.za/cdn/shop/files/D713A883-59EC-434C-8039-B0D020195CEE.png?v=1716559857&width=1946", None),
    "shield-snow-foam-1l.png": ("https://www.shopshield.co.za/cdn/shop/files/4E32778E-1973-404D-8E3F-204132BB7654.png?v=1716542756&width=1946", None),
    "shield-splash-wash-wax-1l.png": ("https://www.shopshield.co.za/cdn/shop/files/D3381EAB-FE70-4B20-BA8F-B401AC6CBD02.png?v=1716545897&width=1946", None),
    "shield-xtreme-shampoo-500ml.png": ("https://www.shopshield.co.za/cdn/shop/files/PHOTO-2024-05-23-17-51-12.jpg?v=1716479654&width=1946", None),
    "shield-engine-cleaner-500ml.png": ("https://www.shopshield.co.za/cdn/shop/files/90E6F6DC-2C8D-4710-AC2D-F2C8E36776E7.png?v=1716564545&width=1946", None),
    # Official photo shows three colour options; crop the first bottle so the listing represents one unit.
    "shield-jetwasher-1l.png": ("https://www.shopshield.co.za/cdn/shop/files/C7683177-4C18-4C04-BDC6-91CE4610764F.png?v=1716542047&width=1946", (100, 140, 390, 850)),
}

def remove_white_background(image):
    rgb = np.asarray(image.convert("RGB"))
    # White/near-white connected to the canvas edges is background, not product.
    near_white = ((rgb.min(axis=2) > 218) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 42)).astype(np.uint8)
    count, labels = cv2.connectedComponents(near_white, connectivity=8)
    edge_labels = set(np.unique(np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])).tolist())
    bg = np.isin(labels, list(edge_labels)) & (labels != 0)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # Soften the cut edge and remove white spill around the silhouette.
    near_edge = cv2.dilate(bg.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1).astype(bool) & ~bg
    if near_edge.any():
        pix = rgb.astype(np.float32)
        # Decontaminate edge pixels against the known white studio background.
        pix[near_edge] = np.clip((pix[near_edge] - 255.0 * 0.12) / 0.88, 0, 255)
        rgb = pix.astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    return Image.fromarray(rgba, "RGBA")

def trim_and_square(image, size=1024):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError("background removal produced an empty image")
    image = image.crop(bbox)
    # Leave breathing room around the product on a transparent canvas.
    image.thumbnail((int(size * 0.78), int(size * 0.84)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    return canvas

for filename, (url, crop) in SOURCES.items():
    print("Fetching", filename)
    response = requests.get(url, timeout=45, headers={"User-Agent": "Mozilla/5.0"})
    response.raise_for_status()
    source = Image.open(BytesIO(response.content)).convert("RGB")
    if crop:
        source = source.crop(crop)
    result = trim_and_square(remove_white_background(source))
    result.save(OUT / filename, format="PNG", optimize=True)
    print("Wrote", OUT / filename, (OUT / filename).stat().st_size, "bytes")
