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
  { id: "microfiber-roll", name: "100-Piece Microfiber Cleaning Cloth Roll", qty: "100 pcs", cost: 70, image: "https://car101.in/cdn/shop/files/listingrollmicrofiber-2.jpg?v=1774097875&width=900", description: "Extra-large reusable microfiber cleaning cloth roll with tear-away towels. Soft, absorbent and suitable for car detailing, glass, interiors and everyday cleaning." },
];

const newProducts = [
  { id:"shield-shampoo-conditioner-1l", name:"Shield Car Shampoo & Conditioner 1L", qty:"1L", cost:44.99, category:"Wash & Foam", image:"https://www.scotthomedelivery.mu/cdn/shop/products/ShieldCarShampoo_Conditioner1L.jpg?v=1588680044", description:"High-foam, pH-balanced car shampoo that cleans, conditions and protects. Suitable for a wide range of paint finishes, including wrapped and frosted finishes." },
  { id:"shield-snow-foam-1l", name:"Shield Snow Foam 1L", qty:"1L", cost:99.99, category:"Wash & Foam", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/h8c/ha3/46415547007006/silo-product-image-v2-21Mar2026-180035-6001878014933-Straight_on-415816-381_400Wx400H", description:"Concentrated snow foam designed to create dense foam that clings to loosen dirt and road grime before contact washing." },
  { id:"shield-xtreme-shampoo-500ml", name:"Shield Xtreme Shampoo 500ml", qty:"500ml", cost:34.99, category:"Wash & Foam", image:"https://www.scotthomedelivery.mu/cdn/shop/products/ShieldCarShampoo_Conditioner1L.jpg?v=1588680044", description:"Wash-plus-wax shampoo that cleans, shines and leaves a protective wax layer while helping lift road grime from paintwork." },
  { id:"shield-jetwasher-1l", name:"Shield Jetwasher Foam Wash 1L", qty:"1L", cost:109.99, category:"Wash & Foam", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/h82/h18/45204726317086/silo-product-image-v2-04Mar2026-180057-6001878002053-Angle_A-411690-13_400Wx400H", description:"Foaming wash formulated for jetwasher and foam-lance use, helping loosen dirt and road grime before rinsing." },
  { id:"shield-tyre-shine-500ml", name:"Shield Tyre Shine Silicone 500ml", qty:"500ml", cost:79.99, category:"Wheels & Tyres", image:"https://www.shopshield.co.za/cdn/shop/files/9E7E15CB-F37E-410D-BBA6-81AB5C3F90DA.png?v=1716562703&width=1445", description:"Rich wet-gloss tyre dressing that restores colour depth and leaves tyres with a durable, glossy finish." },
  { id:"shield-tyre-gloss-aerosol-400ml", name:"Shield Tyre Gloss Aerosol 400ml", qty:"400ml", cost:49.99, category:"Wheels & Tyres", image:"https://halsteds.co.zw/media/catalog/product/cache/a42e6db42bdc695b178b510ae4ef6009/image/33876f6c3/shield-tyre-gloss-400ml.jpg", description:"Quick aerosol tyre dressing for a wet-look finish that helps protect tyres from dulling and fading." },
  { id:"shield-tyre-polish-paste-400ml", name:"Shield Tyre Polish Paste 400ml", qty:"400ml", cost:69.99, category:"Wheels & Tyres", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/h52/had/11125522038814/silo-product-image-v2-16Mar2023-184351-6001878001537-Angle_A-110173-9867_400Wx400H", description:"Tyre polish paste designed to restore a natural-looking lustre and shine to tyre sidewalls." },
  { id:"shield-max-shine-tyre-gel-500ml", name:"Shield Max Shine Tyre Gel 500ml", qty:"500ml", cost:229.99, category:"Wheels & Tyres", image:"https://www.startmycar.co.za/cdn/shop/products/SH1442_grande.jpg?v=1682344897", description:"High-gloss tyre gel designed for a deeper, longer-lasting shine with a clean finished look." },
  { id:"shield-mag-cleaner-500ml", name:"Shield Mag Cleaner 500ml", qty:"500ml", cost:59.99, category:"Wheels & Tyres", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/h26/hd9/46415687843870/silo-product-image-v2-21Mar2026-180037-6001878010000-Straight_on-415772-390_400Wx400H", description:"Foaming mag-wheel cleaner formulated to help remove carbon deposits and road grime from wheel surfaces." },
  { id:"shield-miraplate-500ml", name:"Shield Miraplate 500ml", qty:"500ml", cost:79.99, category:"Paint & Protection", image:"https://i5-images.massmart.co.za/asr/dabdcef5-a612-4338-9f4a-fa5a3a007be0.92f694bf4af721af02180b7e1d2f243d.jpeg?odnBg=FFFFFF&odnHeight=636&odnWidth=694", description:"Liquid car polish designed to add gloss and depth of colour while providing a smooth, non-streak finish and UV protection." },
  { id:"shield-power-force-degreaser-1l", name:"Shield Power Force Heavy Duty Degreaser 1L", qty:"1L", cost:59.99, category:"Cleaning", image:"https://ismotorsport.co.za/cdn/shop/files/32636e4e1d7406e3e8cc46bdfb43f665.jpg?v=1774017097", description:"Water-based heavy-duty cleaner and degreaser for stubborn grime and demanding automotive cleaning jobs." },
  { id:"shield-waterless-glass-cleaner-1l", name:"Shield Waterless Auto Glass Cleaner 1L", qty:"1L", cost:49.99, category:"Cleaning", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/ha6/h13/11126846750750/silo-product-image-v2-16Mar2023-185155-6001878010027-Straight_on-106793-11969_400Wx400H", description:"Waterless automotive glass cleaner for streak-free windows, helping remove fingerprints, dust and everyday grime." },
  { id:"shield-high-foam-shampoo-5l", name:"Shield High Foam Car Shampoo 5L", qty:"5L", cost:109, category:"Wash & Foam", image:"https://www.nidadanish.com/images/thumbnails/570/570/detailed/77/9ce87c7f5edb547b049454b8a9146918.jpg.webp", description:"Large 5L high-foam car shampoo for regular washing and higher-volume detailing use." },
  { id:"shield-splash-wash-wax-1l", name:"Shield Splash Wash & Wax 1L", qty:"1L", cost:49.99, category:"Wash & Foam", image:"https://www.cashbuild.co.za/37003-large_default/shield-splash-car-shampoo-1l.jpg", description:"Two-in-one wash and wax that removes grease and grime while leaving a protective wax layer on the paintwork." },
  { id:"shield-sheen-silicone-500ml", name:"Shield Sheen Silicone 500ml", qty:"500ml", cost:69.99, category:"Paint & Protection", image:"https://www.shopshield.co.za/cdn/shop/files/46140374-34B7-433D-9F6B-9B9549C79EF0.png?v=1716562405", description:"Exterior detailer for vinyl, plastic and rubber surfaces, designed to restore colour depth and add shine with protective properties." },
  { id:"shield-car-polish-paste-200ml", name:"Shield Car Polish Paste 200ml", qty:"200ml", cost:69.99, category:"Paint & Protection", image:"https://i5-images.massmart.co.za/asr/dabdcef5-a612-4338-9f4a-fa5a3a007be0.92f694bf4af721af02180b7e1d2f243d.jpeg?odnBg=FFFFFF&odnHeight=636&odnWidth=694", description:"Hand-applied car polish paste for paintwork finishing, helping improve gloss and surface appearance." },
  { id:"shield-blade-apc-750ml", name:"Shield Blade All Purpose Cleaner 750ml", qty:"750ml", cost:49.99, category:"Cleaning", image:"https://ismotorsport.co.za/cdn/shop/files/32636e4e1d7406e3e8cc46bdfb43f665.jpg?v=1774017097", description:"Versatile all-purpose cleaner for general automotive cleaning, helping tackle dirt and grime across suitable surfaces." },
  { id:"shield-engine-cleaner-500ml", name:"Shield Engine Cleaner Water Based 500ml", qty:"500ml", cost:39.99, category:"Cleaning", image:"https://ismotorsport.co.za/cdn/shop/files/32636e4e1d7406e3e8cc46bdfb43f665.jpg?v=1774017097", description:"Water-based engine cleaner for removing dirt and grease from suitable engine-bay surfaces. Follow the product label and keep electrical components protected." },
  { id:"shield-splash-n-dash-sponge", name:"Shield Splash n Dash Sponge", qty:"1 pc", cost:29.99, category:"Accessories", image:"https://cdn.shopify.com/s/files/1/0446/9188/2147/products/20210109_110521.jpg?v=1610716389", description:"Soft, high-density car-wash sponge with an easy-grip shape for comfortable washing." },
  { id:"shield-foam-applicator-pads-3", name:"Shield Foam Applicator Pads 3-Pack", qty:"3 pcs", cost:54.99, category:"Accessories", image:"https://wheelsandmore.co.za/wp-content/uploads/2025/03/shield-foam-wax-applicator-pads.jpg", description:"Three soft foam applicator pads for cleaning, detailing and applying waxes or dressings by hand." }
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
