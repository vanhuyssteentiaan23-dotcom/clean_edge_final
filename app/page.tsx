"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const products = [
  { id: "microfiber-5", name: "5-Pack Microfiber Cloths", qty: "5 pcs", cost: 40, image: "/images/microfiber-5.jpg" },
  { id: "microfiber-10", name: "10-Pack Microfiber Cloths", qty: "10 pcs", cost: 70, image: "/images/microfiber-10.jpg" },
  { id: "microfiber-50", name: "50-Pack Microfiber Cloths", qty: "50 pcs", cost: 329, image: "/images/microfiber-50.jpg" },
  { id: "microfiber-black-10", name: "10-Pack Black Microfiber Cloths", qty: "10 pcs", cost: 50, image: "/images/microfiber-black-10.jpg" },
  { id: "detail-brushes", name: "5-Piece Detail Brush Set", qty: "5 pcs", cost: 65, image: "/images/detail-brushes.jpg" },
  { id: "drying-towel", name: "Car Drying Towel", qty: "1 pc", cost: 120, image: "/images/drying-towel.jpg" },
  { id: "cleaning-mitt", name: "Detailing Cleaning Mitt", qty: "1 pc", cost: 60, image: "/images/cleaning-mitt.jpg" },
  { id: "nitrile-gloves", name: "Heavy-Duty Nitrile Gloves", qty: "Box", cost: 105, image: "/images/nitrile-gloves.jpg" },
  { id: "touch-up-pen", name: "Automotive Paint Touch-Up Pen", qty: "Multiple colours", cost: 40, image: "/images/touch-up-pen.jpg" },
  { id: "tire-rim-brush", name: "Car Tire & Rim Cleaning Brush", qty: "1 pc", cost: 50, image: "/images/tire-rim-brush.jpg" },
  { id: "car-wash-kit", name: "16-Piece Car Wash Kit", qty: "16 pcs", cost: 300, image: "/images/car-wash-kit.jpg" },
];

const sellingPrice = (cost: number) => cost * 1.65;

export default function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const cartItems = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ ...p, quantity: cart[p.id] })),
    [cart]
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + sellingPrice(item.cost) * item.quantity, 0);

  const addToCart = (id: string) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  };

  const changeQuantity = (id: string, amount: number) => {
    setCart((current) => {
      const next = { ...current };
      const quantity = (next[id] || 0) + amount;
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  };

  const checkout = async () => {
    if (!cartItems.length || checkingOut) return;
    setCheckingOut(true);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || "Unable to start checkout.");
      }
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
        <div className="navlinks"><a href="#shop">Shop</a><a href="#about">About</a></div>
        <button className="cart" onClick={() => setCartOpen(true)}>Cart <b>{cartCount}</b></button>
      </nav>

      <header className="hero">
        <div className="shell">
          <div className="eyebrow">Automotive detailing essentials</div>
          <h1>Clean cars.<br/><em>Sharper edges.</em></h1>
          <p>Practical microfiber, brushes, drying towels, gloves and touch-up essentials for people who take the finish seriously.</p>
          <a className="cta" href="#shop">Shop the collection</a>
        </div>
      </header>

      <div className="ticker shell"><span>✦ DETAILING GEAR</span><span>✦ GARAGE READY</span><span>✦ CLEAN FINISH</span><span>✦ BUILT TO WORK</span></div>

      <section id="shop" className="section shell">
        <div className="sectionhead">
          <div><div className="eyebrow">The collection</div><h2>Tools for the finish</h2></div>
        </div>

        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p.id}>
              <div className="photo">
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              </div>
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
        <div className="shell sectionhead">
          <div><div className="eyebrow">CleanEdge</div><h2>Rugged. Simple. Focused.</h2></div>
        </div>
      </section>
      <footer className="shell">© 2026 CleanEdge · Automotive detailing supplies</footer>

      {cartOpen && (
        <div className="cartBackdrop" onClick={() => setCartOpen(false)}>
          <aside className="cartPanel" onClick={(event) => event.stopPropagation()}>
            <div className="cartHead">
              <div><div className="eyebrow">Your order</div><h2>Cart</h2></div>
              <button className="close" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
            </div>

            {cartItems.length === 0 ? (
              <p className="emptyCart">Your cart is empty.</p>
            ) : (
              <>
                <div className="cartItems">
                  {cartItems.map((item) => (
                    <div className="cartItem" key={item.id}>
                      <div className="cartThumb"><Image src={item.image} alt="" fill sizes="80px" /></div>
                      <div className="cartInfo">
                        <strong>{item.name}</strong>
                        <span>R {sellingPrice(item.cost).toFixed(2)} each</span>
                        <div className="quantity">
                          <button onClick={() => changeQuantity(item.id, -1)}>−</button>
                          <b>{item.quantity}</b>
                          <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                        </div>
                      </div>
                      <div className="lineTotal">R {(sellingPrice(item.cost) * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="cartSummary">
                  <span>Total</span>
                  <strong>R {cartTotal.toFixed(2)}</strong>
                </div>
                {checkoutError && <div className="checkoutError">{checkoutError}</div>}
                <button className="checkout" onClick={checkout} disabled={checkingOut}>
                  {checkingOut ? "Opening Yoco…" : "Checkout with Yoco"}
                </button>
                <p className="secureNote">Secure payment via Yoco · ZAR</p>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
