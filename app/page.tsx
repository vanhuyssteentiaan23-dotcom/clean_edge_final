"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const products = [
  { id: "microfiber-roll", category: "Microfiber & Cloths", name: "100-Piece Microfiber Cleaning Cloth Roll", qty: "100 pcs", cost: 70, image: "https://car101.in/cdn/shop/files/listingrollmicrofiber-2.jpg?v=1774097875&width=900", description: "Extra-large reusable microfiber cleaning cloth roll with tear-away towels. Soft, absorbent and suitable for car detailing, glass, interiors and everyday cleaning." },
  { id: "microfiber-5", category: "Microfiber & Cloths", name: "5-Pack Microfiber Cloths", qty: "5 pcs", cost: 40, image: "/images/microfiber-5.jpg", description: "1200-wash ultra-fine microfiber cleaning cloths. High-performance, super absorbent and streak-free, chemical-free and ideal for car washing and jewelry care. Random colour." },
  { id: "microfiber-black-10", category: "Microfiber & Cloths", name: "10-Pack Black Microfiber Cloths", qty: "10 pcs", cost: 50, image: "/images/microfiber-black-10.jpg", description: "Ultra-soft, absorbent black microfiber cleaning cloths for housekeeping. Lint-free, reusable and washable for everyday cleaning." },
  { id: "drying-towel", category: "Tools & Accessories", name: "Car Drying Towel", qty: "1 pc", cost: 120, image: "/images/drying-towel.jpg", description: "Full-size SUV and truck drying towel with double-sided microfiber, high absorbency and a scratch-resistant, machine-washable design." },
  { id: "cleaning-mitt", category: "Tools & Accessories", name: "Detailing Cleaning Mitt", qty: "1 pc", cost: 60, image: "/images/cleaning-mitt.jpg", description: "Chenille microfiber car wash mitt with thick double-sided plush material. Designed to help clean without scratching." },
  { id: "touch-up-pen", category: "Paint & Protection", name: "Automotive Paint Touch-Up Pen", qty: "Multiple colours", cost: 40, image: "/images/touch-up-pen.jpg", description: "Car paint repair pen for scratch and rust touch-up. Supplied with water sandpaper. Choose your colour before adding to cart." },
  { id: "nitrile-gloves", category: "Tools & Accessories", name: "Heavy-Duty Nitrile Gloves", qty: "Box", cost: 105, image: "/images/nitrile-gloves.jpg", description: "Black Diamond textured nitrile gloves with thick construction, high elasticity and an easy-to-wear fit for demanding cleaning work." },
  { id: "tire-rim-brush", category: "Wheels & Tyres", name: "Car Tire & Rim Cleaning Brush", qty: "1 pc", cost: 50, image: "/images/tire-rim-brush.jpg", description: "Covered hub brush with wax-coated crystal bead foam for smooth tire brushing, interior crevices, edges and corners. PP material." },
  { id: "car-wash-kit", category: "Tools & Kits", name: "16-Piece Car Wash Kit", qty: "16 pcs", cost: 300, image: "/images/car-wash-kit.jpg", description: "16-piece car cleaning tool set with various detail brushes for air-conditioning vents, seat gaps and other car and motorcycle cleaning jobs." },
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
  { id:"shield-mag-cleaner-500ml", name:"Shield Mag Cleaner 500ml", qty:"500ml", cost:59.99, category:"Wheels & Tyres", image:"https://cdn-prd-02.pnp.co.za/sys-master/images/h26/hd9/46415687843870/silo-product-image-v2-21Mar2026-180037-6001878001230-Straight_on-415772-390_400Wx400H", description:"Foaming mag-wheel cleaner formulated to help remove carbon deposits and road grime from wheel surfaces." },
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
const sellingPrice = (cost: number) => cost * 1.65;
const productPrice = (product: { id: string; cost: number; salePrice?: number }) => product.salePrice ?? (product.id === "microfiber-5" ? 50 : sellingPrice(product.cost));

const bundles = [
  { id: "wash-shine-kit", name: "CleanEdge Wash & Shine Kit", qty: "5 essentials", cost: 364.98, compareAtPrice: 586.21, salePrice: 549, badge: "MOST POPULAR", image: "/images/cleanedge-bundle-deal.svg", description: "Everything for a proper wash: shampoo, snow foam, wash mitt, drying towel and microfiber cloths." },
  { id: "wheel-tyre-kit", name: "CleanEdge Wheel & Tyre Kit", qty: "4 essentials", cost: 239.98, compareAtPrice: 395.96, salePrice: 379, badge: "WHEELS", image: "/images/cleanedge-bundle-deal.svg", description: "Clean and finish your wheels and tyres with tyre shine, mag cleaner, a rim brush and black microfiber cloths." },
  { id: "interior-glass-kit", name: "CleanEdge Interior & Glass Kit", qty: "5 essentials", cost: 319.98, compareAtPrice: 527.96, salePrice: 479, badge: "INTERIOR", image: "/images/cleanedge-bundle-deal.svg", description: "A practical interior setup with all-purpose cleaner, glass cleaner, black microfiber cloths, detail brushes and gloves." },
  { id: "ultimate-detail-kit", name: "CleanEdge Ultimate Detail Kit", qty: "9 essentials", cost: 634.95, compareAtPrice: 1047.65, salePrice: 999, badge: "BEST VALUE", image: "/images/cleanedge-bundle-deal.svg", description: "The full CleanEdge setup: wash chemistry, tyre care, wheel cleaner, APC, drying towel, wash mitt, rim brush and microfiber roll." },
];
const STANDARD_SHIPPING = 60;
const FREE_SHIPPING_THRESHOLD = 1500;

type SortOption = "best" | "high" | "low";

export default function Home() {
  const [sortOption, setSortOption] = useState<SortOption>("best");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cartColors, setCartColors] = useState<Record<string, string>>({});
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cleanedge_cart");
      const savedColors = localStorage.getItem("cleanedge_cart_colors");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedColors) setCartColors(JSON.parse(savedColors));
    } catch {}
    setCartReady(true);
    if (new URLSearchParams(window.location.search).get("cart") === "open") setCartOpen(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem("cleanedge_cart", JSON.stringify(cart));
    localStorage.setItem("cleanedge_cart_colors", JSON.stringify(cartColors));
  }, [cart, cartColors, cartReady]);

  const sortedProducts = useMemo(() => {
    let list = [...products, ...newProducts];
    if (categoryFilter !== "All") list = list.filter((product) => product.category === categoryFilter);
    if (sortOption === "high") return list.sort((a, b) => productPrice(b) - productPrice(a));
    if (sortOption === "low") return list.sort((a, b) => productPrice(a) - productPrice(b));
    return list;
  }, [sortOption, categoryFilter]);

  const allProducts = useMemo(() => [...products, ...newProducts, ...bundles], []);
  const cartItems = useMemo(
    () => allProducts.filter((p) => cart[p.id]).map((p) => ({ ...p, quantity: cart[p.id], selectedColor: p.id === "touch-up-pen" ? cartColors[p.id] || "Black" : p.id === "microfiber-roll" ? cartColors[p.id] || "Grey" : undefined })),
    [allProducts, cart, cartColors]
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + productPrice(item) * item.quantity, 0);
  const shipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const cartTotal = cartSubtotal + shipping;

  const addToCart = (id: string, color?: string) => {
    if ((id === "touch-up-pen" || id === "microfiber-roll") && color) setCartColors((current) => ({ ...current, [id]: color }));
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;
      if (quantity <= 0) {
        delete next[id];
        if (id === "touch-up-pen" || id === "microfiber-roll") setCartColors((colors) => {
          const nextColors = { ...colors };
          delete nextColors[id];
          return nextColors;
        });
      } else next[id] = quantity;
      return next;
    });
  };

  const checkout = async () => {
    if (!cartItems.length || checkingOut) return;
    if (!customerEmail.trim()) {
      setCheckoutError("Please enter your email address so we can send your invoice.");
      return;
    }
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity, color: item.selectedColor })),
          customerName,
          customerEmail,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.redirectUrl) throw new Error(data.error || "Unable to start checkout.");
      window.location.assign(data.redirectUrl);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout.");
      setCheckingOut(false);
    }
  };

  return (
    <main>
      <div className="topbar">Professional detailing essentials · built for the garage</div>
      <nav className="nav shell">
        <div className="logo">CLEAN<span>EDGE</span></div>
        <div className="navlinks"><a href="#shop">Shop</a><a href="#about">About</a><a href="/terms">T&amp;C</a></div>
        <div className="navActions"><a className="whatsappTop" href="https://wa.me/27823160428?text=Hi%20CleanEdge%2C%20I%27d%20like%20to%20ask%20about%20your%20products." target="_blank" rel="noreferrer">WhatsApp</a>
        <button className="cart" onClick={() => setCartOpen(true)}>Cart <b>{cartCount}</b></button></div>
      </nav>

      <header className="hero">
        <div className="shell">
          <div className="eyebrow">South African automotive detailing essentials</div>
          <h1>Your car.<br/><em>Properly clean.</em></h1>
          <p>Premium-feel detailing gear without the premium price. Start with a CleanEdge kit, then build your garage with products you actually use.</p>
          <div className="heroActions"><a className="cta" href="#kits">Shop detailing kits</a><a className="secondaryCta" href="#shop">Shop individual products</a></div>
          <div className="shippingBanner">R60 STANDARD COURIER <span>•</span> FREE SHIPPING OVER R1,500 <span>•</span> SECURE YOCO CHECKOUT</div>
        </div>
      </header>

      <div className="ticker shell"><span>✦ DETAILING GEAR</span><span>✦ GARAGE READY</span><span>✦ CLEAN FINISH</span><span>✦ BUILT TO WORK</span></div>

      <section id="kits" className="section shell kitsSection">
        <div className="sectionhead">
          <div><div className="eyebrow">Start here</div><h2>Detailing kits that make it easy</h2></div>
        </div>
        <p className="sectionLead">Don't know what to buy? We've bundled the essentials so you can get everything you need in one order.</p>
        <div className="bundleGrid">
          {bundles.map((bundle) => (
            <article className="bundleCard" key={bundle.id}>
              <div className="bundleImage"><img src={bundle.image} alt={bundle.name} /></div>
              <div className="bundleBody">
                <span className="bundleBadge">{bundle.badge}</span>
                <h3>{bundle.name}</h3>
                <p>{bundle.description}</p>
                <div className="bundlePrice"><strong>R {bundle.salePrice.toFixed(2)}</strong><del>R {bundle.compareAtPrice.toFixed(2)}</del><small>Save R {(bundle.compareAtPrice - bundle.salePrice).toFixed(2)}</small></div>
                <button className="add bundleAdd" onClick={() => addToCart(bundle.id)}>Add kit to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="shop" className="section shell">
        <div className="sectionhead">
          <div><div className="eyebrow">Build your garage</div><h2>Individual detailing gear</h2></div>
          <label className="productSort">
            <span>Sort products</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category"><option value="All">All categories</option><option value="Wash & Foam">Wash & Foam</option><option value="Wheels & Tyres">Wheels & Tyres</option><option value="Paint & Protection">Paint & Protection</option><option value="Cleaning">Cleaning</option><option value="Accessories">Accessories</option><option value="Microfiber & Cloths">Microfiber & Cloths</option><option value="Tools & Accessories">Tools & Accessories</option><option value="Tools & Kits">Tools & Kits</option></select>
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)} aria-label="Sort products">
              <option value="best">Featured</option>
              <option value="high">Price: Highest to Lowest</option>
              <option value="low">Price: Lowest to Highest</option>
            </select>
          </label>
        </div>
        <div className="grid">
          {sortedProducts.map((p) => (
            <article className="card" key={p.id}>
              <Link className="photo photoLink" href={`/product/${p.id}`} aria-label={`View ${p.name}`}>
                <span className="productImageCrop"><img src={p.image} alt={p.name} className="productCardImage" /></span>
                <span className="photoHint">View product</span>
              </Link>
              <div className="body">
                <div className="qty">{p.category ? `${p.category} · ` : ""}{p.qty}</div>
                <h3>{p.name}</h3>
                <div className="price">{p.id === "microfiber-5" ? <><span>R 50.00</span> <del>R 66.00</del></> : <>R {productPrice(p).toFixed(2)}</>}</div>
                <button className="add" onClick={() => addToCart(p.id, p.id === "microfiber-roll" ? "Grey" : undefined)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="whySection">
        <div className="shell whyGrid">
          <div><div className="eyebrow">Why CleanEdge</div><h2>Made for people who care how their car looks.</h2></div>
          <div className="whyPoints">
            <div><strong>01 · Practical products</strong><span>No filler. Just detailing tools you can actually use.</span></div>
            <div><strong>02 · Easy bundles</strong><span>Start with a kit and add products as your detailing setup grows.</span></div>
            <div><strong>03 · Secure checkout</strong><span>Pay online securely through Yoco in South African rand.</span></div>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="shell aboutGrid">
          <div><div className="eyebrow">About CleanEdge</div><h2>Built for the finish.</h2></div>
          <div className="aboutCopy"><p>CleanEdge supplies practical automotive detailing essentials for everyday car care, from microfiber cloths and brushes to drying towels and garage-ready accessories.</p><p>We keep the range focused on useful products, straightforward pricing and a simple checkout experience.</p></div>
        </div>
      </section>

      <footer className="shell footer">
        <div><strong>© 2026 CleanEdge · Automotive detailing supplies</strong><div className="contactDetails"><a href="tel:+27823160428">082 316 0428</a><a href="mailto:tiaanvanhuyssteen18@gmail.com">tiaanvanhuyssteen18@gmail.com</a></div></div>
        <div className="footerLinks"><a href="/terms">Terms &amp; Conditions</a><a href="/cookies">Cookie Policy</a></div>
      </footer>

      {cartOpen && (
        <div className="cartBackdrop" onClick={() => setCartOpen(false)}>
          <aside className="cartPanel" onClick={(event) => event.stopPropagation()}>
            <div className="cartHead"><div><div className="eyebrow">Your order</div><h2>Cart</h2></div><button className="close" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button></div>
            {cartItems.length === 0 ? <p className="emptyCart">Your cart is empty.</p> : (
              <>
                <div className="cartItems">
                  {cartItems.map((item) => (
                    <div className="cartItem" key={item.id}>
                      <div className="cartThumb"><img src={item.image} alt="" /></div>
                      <div className="cartInfo"><strong>{item.name}</strong><span>R {productPrice(item).toFixed(2)} each</span>{item.selectedColor && <span>Colour: {item.selectedColor}</span>}<div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div>
                      <div className="lineTotal">R {(productPrice(item) * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="cartSummary"><span>Subtotal</span><strong>R {cartSubtotal.toFixed(2)}</strong></div>
                <div className="cartSummary"><span>Shipping</span><strong>{shipping === 0 ? "FREE" : `R ${shipping.toFixed(2)}`}</strong></div>
                <div className="cartSummary cartGrandTotal"><span>Total</span><strong>R {cartTotal.toFixed(2)}</strong></div>
                <div className="shippingProgress">{shipping === 0 ? <><strong>Free shipping unlocked ✓</strong><span>Your order qualifies for free delivery.</span></> : <><strong>Add R {(FREE_SHIPPING_THRESHOLD - cartSubtotal).toFixed(2)} for free shipping</strong><div className="shippingTrack"><i style={{ width: `${Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} /></div><span>Standard courier is R60 until you reach R1,500.</span></>}</div>
                <div className="customerFields">
                  <label>Name <span>(optional)</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" /></label>
                  <label>Email <span>(required)</span><input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
                  <p>We’ll email your paid invoice and order details here.</p>
                </div>
                {checkoutError && <div className="checkoutError">{checkoutError}</div>}
                <button className="checkout" onClick={checkout} disabled={checkingOut}>{checkingOut ? "Opening Yoco…" : "Checkout with Yoco"}</button>
                <p className="secureNote">Secure payment via Yoco · ZAR · Your payment is encrypted</p>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
