"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";

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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = products.find((item) => item.id === id);
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
      if (product.id === "touch-up-pen") colors[product.id] = color;
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
          <div className="productMainImage"><Image src={product.image} alt={product.name} fill priority unoptimized sizes="(max-width: 800px) 100vw, 58vw" className="productMainImageAsset" /></div>
          <div className="productThumb"><Image src={product.image} alt="" fill unoptimized sizes="90px" className="productThumbAsset" /></div>
        </div>

        <div className="productInfo">
          <div className="productShippingBadge">STANDARD COURIER R60 · FREE OVER R1,500</div>
          <div className="eyebrow">{product.qty}</div>
          <h1>{product.name}</h1>
          <p className="productDescription">{product.description}</p>
          <div className="productPrice">R {sellingPrice(product.cost).toFixed(2)}</div>

          {product.id === "touch-up-pen" && (
            <div className="productOption">
              <strong>Colour</strong>
              <div className="productOptionsGrid">
                {touchUpColors.map((option) => <button key={option} className={color === option ? "productOptionButton active" : "productOptionButton"} onClick={() => setColor(option)}>{option}</button>)}
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
