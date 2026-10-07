"use client";

import Link from "next/link";
import { use, useState } from "react";

const products = [
  { id: "microfiber-5", name: "5-Pack Microfiber Cloths", qty: "5 pcs", cost: 40, salePrice: 50, image: "/images/microfiber-5.jpg", description: "1200-wash ultra-fine microfiber cleaning cloths. High-performance, super absorbent and streak-free, chemical-free and ideal for car washing and jewelry care. Random colour." },
  { id: "microfiber-10", name: "10-Pack Microfiber Cloths", qty: "10 pcs", cost: 70, image: "/images/microfiber-10.jpg", description: "1200-wash ultra-fine microfiber cleaning cloths. High-performance, super absorbent and streak-free, chemical-free and ideal for car washing and jewelry care. Random colour." },
  { id: "microfiber-50", name: "50-Pack Microfiber Cloths", qty: "50 pcs", cost: 329, image: "/images/microfiber-50.jpg", description: "1200-wash ultra-fine microfiber cleaning cloths. High-performance, super absorbent and streak-free, chemical-free and ideal for car washing and jewelry care. Random colour." },
  { id: "microfiber-black-10", name: "10-Pack Black Microfiber Cloths", qty: "10 pcs", cost: 50, image: "/images/microfiber-black-10.jpg", description: "Ultra-soft, absorbent black microfiber cleaning cloths for housekeeping. Lint-free, reusable and washable for everyday cleaning." },
  { id: "detail-brushes", name: "5-Piece Detail Brush Set", qty: "5 pcs", cost: 65, image: "/images/detail-brushes.jpg", description: "Car cleaning brush set and detailing brush kit for vents, leather, wheels, interiors, seats, upholstery and engine cleaning." },
  { id: "drying-towel", name: "Car Drying Towel", qty: "1 pc", cost: 120, image: "/images/drying-towel.jpg", description: "Full-size SUV and truck drying towel with double-sided microfiber, high absorbency and a scratch-resistant, machine-washable design." },
  { id: "cleaning-mitt", name: "Detailing Cleaning Mitt", qty: "1 pc", cost: 60, image: "/images/cleaning-mitt.jpg", description: "Chenille microfiber car wash mitt with thick double-sided plush material. Designed to help clean without scratching." },
  { id: "nitrile-gloves", name: "Heavy-Duty Nitrile Gloves", qty: "Box", cost: 105, image: "/images/nitrile-gloves.jpg", description: "Black Diamond textured nitrile gloves with thick construction, high elasticity and an easy-to-wear fit for demanding cleaning work." },
  { id: "touch-up-pen", name: "Automotive Paint Touch-Up Pen", qty: "Multiple colours", cost: 40, image: "/images/touch-up-pen.jpg", description: "Car paint repair pen for scratch and rust touch-up. Supplied with water sandpaper. Choose your colour before adding to cart." },
  { id: "tire-rim-brush", name: "Car Tire & Rim Cleaning Brush", qty: "1 pc", cost: 50, image: "/images/tire-rim-brush.jpg", description: "Covered hub brush with wax-coated crystal bead foam for smooth tire brushing, interior crevices, edges and corners. PP material." },
  { id: "car-wash-kit", name: "16-Piece Car Wash Kit", qty: "16 pcs", cost: 300, image: "/images/car-wash-kit.jpg", description: "16-piece car cleaning tool set with various detail brushes for air-conditioning vents, seat gaps and other car and motorcycle cleaning jobs." },
  { id: "microfiber-roll", name: "100-Piece Microfiber Cleaning Cloth Roll", qty: "100 pcs", cost: 70, image: "/images/products/microfiber-roll.svg", description: "Extra-large reusable microfiber cleaning cloth roll with tear-away towels. Soft, absorbent and suitable for car detailing, glass, interiors and everyday cleaning." },
];

const newProducts = [
  { id:"shield-shampoo-conditioner-1l", name:"Shield Car Shampoo & Conditioner 1L", qty:"1L", cost:44.99, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/5DC40291-980E-4468-856A-465DADC990B1.png?v=1716546634&width=1946", description:"High-foam, pH-balanced car shampoo that cleans, conditions and protects. Suitable for a wide range of paint finishes, including wrapped and frosted finishes." },
  { id:"shield-snow-foam-1l", name:"Shield Snow Foam 1L", qty:"1L", cost:99.99, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/4E32778E-1973-404D-8E3F-204132BB7654.png?v=1716542756&width=1946", description:"Concentrated snow foam designed to create dense foam that clings to loosen dirt and road grime before contact washing." },
  { id:"shield-xtreme-shampoo-500ml", name:"Shield Xtreme Shampoo 500ml", qty:"500ml", cost:34.99, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/PHOTO-2024-05-23-17-51-12.jpg?v=1716479654&width=1946", description:"Wash-plus-wax shampoo that cleans, shines and leaves a protective wax layer while helping lift road grime from paintwork." },
  { id:"shield-jetwasher-1l", name:"Shield Jetwasher Foam Wash 1L", qty:"1L", cost:109.99, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/C7683177-4C18-4C04-BDC6-91CE4610764F.png?v=1716542047&width=1946", description:"Foaming wash formulated for jetwasher and foam-lance use, helping loosen dirt and road grime before rinsing." },
  { id:"shield-tyre-shine-500ml", name:"Shield Tyre Shine Silicone 500ml", qty:"500ml", cost:79.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/9E7E15CB-F37E-410D-BBA6-81AB5C3F90DA.png?v=1716562703&width=1946", description:"Rich wet-gloss tyre dressing that restores colour depth and leaves tyres with a durable, glossy finish." },
  { id:"shield-tyre-gloss-aerosol-400ml", name:"Shield Tyre Gloss Aerosol 400ml", qty:"400ml", cost:49.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/1D5EDFE8-B480-4438-9E74-C2F4BDBC42BE.png?v=1716553116&width=1946", description:"Quick aerosol tyre dressing for a wet-look finish that helps protect tyres from dulling and fading." },
  { id:"shield-tyre-polish-paste-400ml", name:"Shield Tyre Polish Paste 400ml", qty:"400ml", cost:69.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/D713A883-59EC-434C-8039-B0D020195CEE.png?v=1716559857&width=1946", description:"Tyre polish paste designed to restore a natural-looking lustre and shine to tyre sidewalls." },
  { id:"shield-max-shine-tyre-gel-500ml", name:"Shield Max Shine Tyre Gel 500ml", qty:"500ml", cost:229.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/47F42304-8636-441B-86A8-41B74E2BE3AA_075c77ea-37a1-4819-890d-5f31337fb73e.png?v=1716554293&width=1946", description:"High-gloss tyre gel designed for a deeper, longer-lasting shine with a clean finished look." },
  { id:"shield-mag-cleaner-500ml", name:"Shield Mag Cleaner 500ml", qty:"500ml", cost:59.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/FDBFDF6E-72C9-4126-9FA9-8BA949766806.png?v=1716560208&width=1946", description:"Foaming mag-wheel cleaner formulated to help remove carbon deposits and road grime from wheel surfaces." },
  { id:"shield-miraplate-500ml", name:"Shield Miraplate 500ml", qty:"500ml", cost:79.99, category:"Paint & Protection", image:"https://www.shopshield.co.za/cdn/shop/files/5A37F044-E699-4646-A10E-A484D78AE856.png?v=1716549242&width=1946", description:"Liquid car polish designed to add gloss and depth of colour while providing a smooth, non-streak finish and UV protection." },
  { id:"shield-power-force-degreaser-1l", name:"Shield Power Force Heavy Duty Degreaser 1L", qty:"1L", cost:59.99, category:"Cleaning", image:"https://www.shopshield.co.za/cdn/shop/files/0006-60307596719341819816_png.png?v=1725894512&width=1946", description:"Water-based heavy-duty cleaner and degreaser for stubborn grime and demanding automotive cleaning jobs." },
  { id:"shield-waterless-glass-cleaner-1l", name:"Shield Waterless Auto Glass Cleaner 1L", qty:"1L", cost:49.99, category:"Cleaning", image:"https://www.shopshield.co.za/cdn/shop/files/3B544585-5DA4-4219-A352-5285F71BEF77.png?v=1716563488&width=1946", description:"Waterless automotive glass cleaner for streak-free windows, helping remove fingerprints, dust and everyday grime." },
  { id:"shield-high-foam-shampoo-5l", name:"Shield High Foam Car Shampoo 5L", qty:"5L", cost:109, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/0033-56901471048526235433_png.png?v=1721826155&width=1946", description:"Large 5L high-foam car shampoo for regular washing and higher-volume detailing use." },
  { id:"shield-splash-wash-wax-1l", name:"Shield Splash Wash & Wax 1L", qty:"1L", cost:49.99, category:"Wash & Foam", image:"https://www.shopshield.co.za/cdn/shop/files/D3381EAB-FE70-4B20-BA8F-B401AC6CBD02.png?v=1716545897&width=1946", description:"Two-in-one wash and wax that removes grease and grime while leaving a protective wax layer on the paintwork." },
  { id:"shield-sheen-silicone-500ml", name:"Shield Sheen Silicone 500ml", qty:"500ml", cost:69.99, category:"Paint & Protection", image:"https://www.shopshield.co.za/cdn/shop/files/46140374-34B7-433D-9F6B-9B9549C79EF0.png?v=1716562405&width=1946", description:"Exterior detailer for vinyl, plastic and rubber surfaces, designed to restore colour depth and add shine with protective properties." },
  { id:"shield-car-polish-paste-200ml", name:"Shield Car Polish Paste 200ml", qty:"200ml", cost:69.99, category:"Paint & Protection", image:"https://www.shopshield.co.za/cdn/shop/files/C8CF9756-8384-4C34-B5A6-8B95CBEFC43E.png?v=1716549638&width=1946", description:"Hand-applied car polish paste for paintwork finishing, helping improve gloss and surface appearance." },
  { id:"shield-blade-apc-750ml", name:"Shield Blade All Purpose Cleaner 750ml", qty:"750ml", cost:49.99, category:"Cleaning", image:"https://www.shopshield.co.za/cdn/shop/files/1F9BFDF9-02FC-4788-BCEF-848E43CF498A.png?v=1716565840&width=1946", description:"Versatile all-purpose cleaner for general automotive cleaning, helping tackle dirt and grime across suitable surfaces." },
  { id:"shield-engine-cleaner-500ml", name:"Shield Engine Cleaner Water Based 500ml", qty:"500ml", cost:39.99, category:"Cleaning", image:"https://www.shopshield.co.za/cdn/shop/files/90E6F6DC-2C8D-4710-AC2D-F2C8E36776E7.png?v=1716564545&width=1946", description:"Water-based engine cleaner for removing dirt and grease from suitable engine-bay surfaces. Follow the product label and keep electrical components protected." },
  { id:"shield-splash-n-dash-sponge", name:"Shield Splash n Dash Sponge", qty:"1 pc", cost:29.99, category:"Accessories", image:"https://www.shopshield.co.za/cdn/shop/files/8628FAA0-2E05-4752-9462-215746595535.png?v=1716561845&width=1946", description:"Soft, high-density car-wash sponge with an easy-grip shape for comfortable washing." },
  { id:"shield-foam-applicator-pads-3", name:"Shield Foam Applicator Pads 3-Pack", qty:"3 pcs", cost:54.99, category:"Accessories", image:"https://www.shopshield.co.za/cdn/shop/files/0008-19696286120866091878_png.png?v=1717150327&width=1946", description:"Three soft foam applicator pads for cleaning, detailing and applying waxes or dressings by hand." }
];

const touchUpColors = ["Silvery", "Grey", "Red", "Blue", "Black", "White", "Pearl White", "Varnish"];
const microfiberRollColors = ["Pink", "Grey", "Blue"];
const sellingPrice = (cost: number, salePrice?: number) => salePrice ?? cost * 1.65;
const productPrice = (product: { cost: number; salePrice?: number }) => product.salePrice ?? sellingPrice(product.cost);

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = [...products, ...newProducts].find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("Black");
  const [added, setAdded] = useState(false);

  if (!product) {
    return <main className="productNotFound"><div><h1>Product not found.</h1><Link href="/">Back to CleanEdge</Link></div></main>;
  }

  const saveToCart = (goToCart: boolean) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cleanedge_cart") || "{}");
      const colors = JSON.parse(localStorage.getItem("cleanedge_cart_colors") || "{}");
      cart[product.id] = (cart[product.id] || 0) + quantity;
      if (product.id === "touch-up-pen" || product.id === "microfiber-roll") colors[product.id] = product.id === "microfiber-roll" && color === "Black" ? "Grey" : color;
      localStorage.setItem("cleanedge_cart", JSON.stringify(cart));
      localStorage.setItem("cleanedge_cart_colors", JSON.stringify(colors));
      if (goToCart) window.location.assign("/?cart=open");
      else setAdded(true);
    } catch {}
  };

  return (
    <main className="productPage">
      <div className="topbar">Professional detailing essentials · built for the garage</div>
      <nav className="nav shell">
        <Link className="logo" href="/">CLEAN<span>EDGE</span></Link>
        <div className="navlinks"><Link href="/#shop">Shop</Link><Link href="/#about">About</Link><Link href="/terms">T&amp;C</Link></div>
        <div className="navActions"><a className="whatsappTop" href="https://wa.me/27823160428?text=Hi%20CleanEdge%2C%20I%27d%20like%20to%20ask%20about%20your%20products." target="_blank" rel="noreferrer">WhatsApp</a><Link className="cart" href="/?cart=open">Cart</Link></div>
      </nav>

      <div className="shell productBreadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/#shop">Shop</Link><span>›</span><strong>{product.name}</strong></div>

      <section className="shell productDetail">
        <div className="productGallery">
          <div className="productMainImage"><img src={product.image} alt={product.name} className="productMainImageAsset" /></div>
          <div className="productThumb"><img src={product.image} alt="" className="productThumbAsset" /></div>
        </div>

        <div className="productInfo">
          <div className="productShippingBadge">STANDARD COURIER R60 · FREE OVER R1,500</div>
          <div className="eyebrow">{product.qty}</div>
          <h1>{product.name}</h1>
          <p className="productDescription">{product.description}</p>
          <div className="productPrice">R {productPrice(product).toFixed(2)}</div>

          {(product.id === "touch-up-pen" || product.id === "microfiber-roll") && (
            <div className="productOption">
              <strong>Colour</strong>
              <div className="productOptionsGrid">
                {(product.id === "microfiber-roll" ? microfiberRollColors : touchUpColors).map((option) => <button key={option} className={(product.id === "microfiber-roll" && color === "Black" ? "Grey" : color) === option ? "productOptionButton active" : "productOptionButton"} onClick={() => setColor(option)}>{option}</button>)}
              </div>
            </div>
          )}

          <div className="productOption">
            <strong>Quantity</strong>
            <div className="detailQuantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div>
          </div>

          <div className="productActions">
            <button className="detailAdd" onClick={() => saveToCart(false)}>Add to cart</button>
            <button className="detailBuy" onClick={() => saveToCart(true)}>Buy now</button>
          </div>
          {added && <div className="addedMessage">Added to your cart. <Link href="/?cart=open">View cart →</Link></div>}

          <div className="productTrust">
            <div><strong>✓</strong><span>Secure checkout<br/>via Yoco</span></div>
            <div><strong>✓</strong><span>Standard courier<br/>R60</span></div>
            <div><strong>✓</strong><span>Free shipping<br/>over R1,500</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
