"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const products = [
  { id: "microfiber-5", name: "5-Pack Microfiber Cloths", qty: "5 pcs", cost: 40, image: "/images/microfiber-5.jpg", description: "1200-wash ultra-fine microfiber cleaning cloths. High-performance, super absorbent and streak-free, chemical-free and ideal for car washing and jewelry care. Random colour." },
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
];

const touchUpColors = ["Silvery", "Grey", "Red", "Blue", "Black", "White", "Pearl White", "Varnish"];
const sellingPrice = (cost: number) => cost * 1.65;
const STANDARD_SHIPPING = 60;
const FREE_SHIPPING_THRESHOLD = 1500;

export default function Home() {
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

  const cartItems = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ ...p, quantity: cart[p.id], selectedColor: p.id === "touch-up-pen" ? cartColors[p.id] || "Black" : undefined })),
    [cart, cartColors]
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + sellingPrice(item.cost) * item.quantity, 0);
  const shipping = cartSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const cartTotal = cartSubtotal + shipping;

  const addToCart = (id: string, color?: string) => {
    if (id === "touch-up-pen" && color) setCartColors((current) => ({ ...current, [id]: color }));
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;
      if (quantity <= 0) {
        delete next[id];
        if (id === "touch-up-pen") setCartColors((colors) => {
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
          <div className="eyebrow">Automotive detailing essentials</div>
          <h1>Clean cars.<br/><em>Sharper edges.</em></h1>
          <p>Practical microfiber, brushes, drying towels, gloves and touch-up essentials for people who take the finish seriously.</p>
          <a className="cta" href="#shop">Shop the collection</a>
          <div className="shippingBanner">STANDARD COURIER R60 <span>•</span> ORDERS OVER R1,500 SHIP FREE</div>
        </div>
      </header>

      <div className="ticker shell"><span>✦ DETAILING GEAR</span><span>✦ GARAGE READY</span><span>✦ CLEAN FINISH</span><span>✦ BUILT TO WORK</span></div>

      <section id="shop" className="section shell">
        <div className="sectionhead"><div><div className="eyebrow">The collection</div><h2>Tools for the finish</h2></div></div>
        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p.id}>
              <Link className="photo photoLink" href={`/product/${p.id}`} aria-label={`View ${p.name}`}>
                <span className="productImageCrop"><img src={p.image} alt={p.name} className="productCardImage" /></span>
                <span className="photoHint">View product</span>
              </Link>
              <div className="body">
                <div className="qty">{p.qty}</div>
                <h3>{p.name}</h3>
                <div className="price">R {sellingPrice(p.cost).toFixed(2)}</div>
                <button className="add" onClick={() => addToCart(p.id)}>Add to cart</button>
              </div>
            </article>
          ))}
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
                      <div className="cartThumb"><Image src={item.image} alt="" fill sizes="80px" /></div>
                      <div className="cartInfo"><strong>{item.name}</strong><span>R {sellingPrice(item.cost).toFixed(2)} each</span>{item.selectedColor && <span>Colour: {item.selectedColor}</span>}<div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div>
                      <div className="lineTotal">R {(sellingPrice(item.cost) * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="cartSummary"><span>Subtotal</span><strong>R {cartSubtotal.toFixed(2)}</strong></div>
                <div className="cartSummary"><span>Shipping</span><strong>{shipping === 0 ? "FREE" : `R ${shipping.toFixed(2)}`}</strong></div>
                <div className="cartSummary cartGrandTotal"><span>Total</span><strong>R {cartTotal.toFixed(2)}</strong></div>
                <p className="shippingNote">{shipping === 0 ? "Free shipping applied — your order is over R1,500." : "Standard courier: R60. Orders over R1,500 ship free."}</p>
                <div className="customerFields">
                  <label>Name <span>(optional)</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your name" /></label>
                  <label>Email <span>(required)</span><input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
                  <p>We’ll email your paid invoice and order details here.</p>
                </div>
                {checkoutError && <div className="checkoutError">{checkoutError}</div>}
                <button className="checkout" onClick={checkout} disabled={checkingOut}>{checkingOut ? "Opening Yoco…" : "Checkout with Yoco"}</button>
                <p className="secureNote">Secure payment via Yoco · ZAR</p>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
