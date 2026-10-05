import Image from "next/image";

const products = [
  { name: "5-Pack Microfiber Cloths", qty: "5 pcs", cost: 40, image: "/images/microfiber-5.jpg" },
  { name: "10-Pack Microfiber Cloths", qty: "10 pcs", cost: 70, image: "/images/microfiber-10.jpg" },
  { name: "50-Pack Microfiber Cloths", qty: "50 pcs", cost: 329, image: "/images/microfiber-50.jpg" },
  { name: "10-Pack Black Microfiber Cloths", qty: "10 pcs", cost: 50, image: "/images/microfiber-black-10.jpg" },
  { name: "5-Piece Detail Brush Set", qty: "5 pcs", cost: 65, image: "/images/detail-brushes.jpg" },
  { name: "Car Drying Towel", qty: "1 pc", cost: 120, image: "/images/drying-towel.jpg" },
  { name: "Detailing Cleaning Mitt", qty: "1 pc", cost: 60, image: "/images/cleaning-mitt.jpg" },
  { name: "Heavy-Duty Nitrile Gloves", qty: "Box", cost: 105, image: "/images/nitrile-gloves.jpg" },
  { name: "Automotive Paint Touch-Up Pen", qty: "Multiple colours", cost: 40, image: "/images/touch-up-pen.jpg" },
  { name: "Car Tire & Rim Cleaning Brush", qty: "1 pc", cost: 50, image: "/images/tire-rim-brush.jpg" },
  { name: "16-Piece Car Wash Kit", qty: "16 pcs", cost: 300, image: "/images/car-wash-kit.jpg" },
];

const sellingPrice = (cost: number) => cost * 1.65;

export default function Home() {
  return (
    <main>
      <div className="topbar">Professional detailing essentials · built for the garage</div>
      <nav className="nav shell">
        <div className="logo">CLEAN<span>EDGE</span></div>
        <div className="navlinks"><a href="#shop">Shop</a><a href="#about">About</a></div>
        <button className="cart">Cart <b>0</b></button>
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
            <article className="card" key={p.name}>
              <div className="photo">
                <Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw" />
              </div>
              <div className="body">
                <div className="qty">{p.qty}</div>
                <h3>{p.name}</h3>
                <div className="price">R {sellingPrice(p.cost).toFixed(2)}</div>
                <button className="add">Add to cart</button>
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
    </main>
  );
}
