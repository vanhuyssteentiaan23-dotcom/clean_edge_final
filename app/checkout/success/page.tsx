import Link from "next/link";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const { order, token } = await searchParams;
  const invoiceHref = order && token ? `/invoice/${encodeURIComponent(order)}?token=${encodeURIComponent(token)}` : null;

  return (
    <main className="checkoutPage">
      <div className="checkoutBox">
        <div className="eyebrow">CleanEdge</div>
        <h1>Thanks for your order.</h1>
        <p>Your payment was completed through Yoco. Your paid invoice will also be emailed to the address you entered at checkout.</p>
        <div className="successActions">
          {invoiceHref && <Link className="cta" href={invoiceHref}>View invoice</Link>}
          <Link className="secondaryCta" href="/">Back to CleanEdge</Link>
        </div>
      </div>
    </main>
  );
}
