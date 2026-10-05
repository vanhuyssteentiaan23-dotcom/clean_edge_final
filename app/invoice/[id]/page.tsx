import { notFound } from "next/navigation";
import { getInvoice, OrderRecord } from "../../../lib/cleanedge-order";

export const dynamic = "force-dynamic";

function money(cents: number) {
  return `R ${(cents / 100).toFixed(2)}`;
}

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  if (!token) notFound();

  let order: OrderRecord;
  try {
    order = await getInvoice(id, token);
  } catch {
    notFound();
  }

  if (!order?.id || !order.items) notFound();

  return (
    <main className="invoicePage">
      <div className="invoice">
        <div className="invoiceTop">
          <div>
            <div className="logo">CLEAN<span>EDGE</span></div>
            <div className="eyebrow">Order invoice</div>
          </div>
          <div className="invoiceMeta">
            <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
            <span>{new Date(order.created_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}</span>
            <span className={`status ${order.status}`}>{order.status}</span>
          </div>
        </div>

        <div className="billTo">
          <div><small>Bill to</small><strong>{order.customer_name || "Customer"}</strong><span>{order.customer_email}</span></div>
          <div><small>Payment</small><strong>Yoco</strong><span>{order.yoco_payment_id || "Payment confirmed"}</span></div>
        </div>

        <div className="invoiceTable">
          <div className="invoiceRow invoiceHead"><span>Item</span><span>Qty</span><span>Unit</span><span>Total</span></div>
          {order.items.map((item) => (
            <div className="invoiceRow" key={item.id}>
              <span>{item.name}</span><span>{item.quantity}</span><span>{money(item.unitPriceCents)}</span><span>{money(item.lineTotalCents)}</span>
            </div>
          ))}
        </div>

        <div className="invoiceTotal"><span>Total paid</span><strong>{money(order.total_cents)}</strong></div>

        <div className="invoiceActions">
          <button className="cta" onClick={() => window.print()}>Print / Save PDF</button>
          <a href="/">Back to CleanEdge</a>
        </div>

        <p className="invoiceFoot">Thank you for your CleanEdge order.</p>
      </div>
    </main>
  );
}
