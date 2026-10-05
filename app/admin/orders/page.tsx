"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: string; name: string; quantity: number; unitPriceCents: number; lineTotalCents: number };
type Order = { id: string; customer_name: string; customer_email: string; subtotal_cents?: number; shipping_cents?: number; total_cents: number; status: string; created_at: string; paid_at: string | null; items: Item[] };

const money = (cents: number) => `R ${(cents / 100).toFixed(2)}`;

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [password, setPassword] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    if (response.status === 401) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }
    const data = await response.json();
    if (!response.ok) setError(data.error || "Unable to load orders.");
    else setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const productTotals = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const order of orders.filter((o) => o.status === "paid")) {
      for (const item of order.items || []) {
        const current = totals.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.lineTotalCents;
        totals.set(item.id, current);
      }
    }
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total_cents, 0);
  const units = productTotals.reduce((sum, item) => sum + item.quantity, 0);

  const login = async () => {
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Login failed."); return; }
    setPassword("");
    setNeedsLogin(false);
    await load();
  };

  if (loading) return <main className="adminPage"><div className="adminBox">Loading orders…</div></main>;

  if (needsLogin) {
    return (
      <main className="adminPage">
        <div className="adminBox">
          <div className="eyebrow">CleanEdge</div>
          <h1>Order dashboard</h1>
          <p>Private sales tracking for CleanEdge.</p>
          <input className="adminInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" onKeyDown={(e) => e.key === "Enter" && void login()} />
          {error && <div className="checkoutError">{error}</div>}
          <button className="cta" onClick={() => void login()}>Sign in</button>
        </div>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <div className="adminShell">
        <div className="adminHeader">
          <div><div className="eyebrow">CleanEdge</div><h1>Orders</h1></div>
          <div className="adminActions"><button onClick={() => void load()}>Refresh</button><a href="/">Store</a></div>
        </div>

        <div className="stats">
          <div><span>Paid orders</span><strong>{paidOrders.length}</strong></div>
          <div><span>Units sold</span><strong>{units}</strong></div>
          <div><span>Revenue</span><strong>{money(revenue)}</strong></div>
        </div>

        <section className="adminSection">
          <div className="adminSectionHead"><div><div className="eyebrow">What is selling</div><h2>Product totals</h2></div></div>
          <div className="productTotals">
            {productTotals.length === 0 ? <p className="muted">No paid orders yet.</p> : productTotals.map((item) => (
              <div className="totalRow" key={item.name}><strong>{item.name}</strong><span>{item.quantity} units</span><span>{money(item.revenue)}</span></div>
            ))}
          </div>
        </section>

        <section className="adminSection">
          <div className="adminSectionHead"><div><div className="eyebrow">Sales log</div><h2>Recent orders</h2></div></div>
          <div className="ordersTable">
            <div className="orderRow orderHead"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span></div>
            {orders.length === 0 ? <p className="muted">No orders yet.</p> : orders.map((order) => (
              <div className="orderRow" key={order.id}>
                <span>#{order.id.slice(0, 8).toUpperCase()}<small>{new Date(order.created_at).toLocaleString("en-ZA")}</small></span>
                <span>{order.customer_name || "Customer"}<small>{order.customer_email}</small></span>
                <span>{(order.items || []).map((item) => `${item.quantity}× ${item.name}`).join(", ")}</span>
                <span>{money(order.total_cents)}<small>{order.shipping_cents === 0 ? "Free shipping" : `Shipping ${money(order.shipping_cents || 0)}`}</small></span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
