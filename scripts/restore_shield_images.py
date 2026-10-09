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
    "shield-jetwasher-1l.png": ("https://www.shopshield.co.za/cdn/shop/files/C7683177-4C18-4C04-BDC6-91CE4610764F.png?v=1716542047&width=1000", (100, 140, 355, 850)),
}

def remove_white_background(image):
    rgb = np.asarray(image.convert("RGB"))
    # Start with pixels that are meaningfully different from the white studio backdrop.
    # Close small gaps along product edges, then fill the external silhouette so white
    # bottle handles, labels and caps are kept instead of being mistaken for background.
    minc = rgb.min(axis=2).astype(np.int16)
    maxc = rgb.max(axis=2).astype(np.int16)
    chroma = maxc - minc
    foreground_hint = ((minc < 242) | (chroma > 18)).astype(np.uint8)

    # Keep the dominant object and bridge tiny breaks caused by white plastic on white.
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
    closed = cv2.morphologyEx(foreground_hint, cv2.MORPH_CLOSE, kernel, iterations=2)
    closed = cv2.morphologyEx(closed, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8), iterations=1)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)
    if count <= 1:
        raise RuntimeError("could not detect product silhouette")
    candidates = [(stats[i, cv2.CC_STAT_AREA], i) for i in range(1, count)
                  if stats[i, cv2.CC_STAT_AREA] > 0]
    _, main_label = max(candidates)
    silhouette = (labels == main_label).astype(np.uint8)

    # Fill enclosed light areas (notably white handles and white bottle bodies).
    contours, _ = cv2.findContours(silhouette, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise RuntimeError("could not trace product silhouette")
    mask = np.zeros(silhouette.shape, dtype=np.uint8)
    cv2.drawContours(mask, [max(contours, key=cv2.contourArea)], -1, 255, thickness=cv2.FILLED)

    # Smooth only the alpha edge slightly; keep original product colours intact.
    mask = cv2.GaussianBlur(mask, (3, 3), 0.6)
    alpha = mask
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
        # The catalogue photo joins three Jetwasher colour options with one shared yellow applicator.
        # Keep a single red bottle and remove the shared yellow cross-piece above the bottle.
        arr = np.asarray(source).copy()
        yy, xx = np.indices(arr.shape[:2])
        yellow_applicator = (yy < 190) & (arr[:, :, 0] > 170) & (arr[:, :, 1] > 120) & (arr[:, :, 2] < 110)
        arr[yellow_applicator] = [255, 255, 255]
        source = Image.fromarray(arr, "RGB")
    result = trim_and_square(remove_white_background(source))
    result.save(OUT / filename, format="PNG", optimize=True)
    print("Wrote", OUT / filename, (OUT / filename).stat().st_size, "bytes")
