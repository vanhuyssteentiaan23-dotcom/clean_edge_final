import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { attachCheckout, createOrder, makeInvoiceToken, makeOrderId } from "../../../lib/cleanedge-order";

const products = [
  { id: "microfiber-5", name: "5-Pack Microfiber Cloths", cost: 40 },
  { id: "microfiber-10", name: "10-Pack Microfiber Cloths", cost: 70 },
  { id: "microfiber-50", name: "50-Pack Microfiber Cloths", cost: 329 },
  { id: "microfiber-black-10", name: "10-Pack Black Microfiber Cloths", cost: 50 },
  { id: "detail-brushes", name: "5-Piece Detail Brush Set", cost: 65 },
  { id: "drying-towel", name: "Car Drying Towel", cost: 120 },
  { id: "cleaning-mitt", name: "Detailing Cleaning Mitt", cost: 60 },
  { id: "nitrile-gloves", name: "Heavy-Duty Nitrile Gloves", cost: 105 },
  { id: "touch-up-pen", name: "Automotive Paint Touch-Up Pen", cost: 40 },
  { id: "tire-rim-brush", name: "Car Tire & Rim Cleaning Brush", cost: 50 },
  { id: "car-wash-kit", name: "16-Piece Car Wash Kit", cost: 300 },
];

const sellingPrice = (cost: number) => cost * 1.65;

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const secretKey = process.env.YOCO_SECRET_KEY ?? process.env.YOCO_SECRET_KEY1;
  if (!secretKey) return NextResponse.json({ error: "Yoco is not configured on the server yet." }, { status: 500 });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.ORDER_API_SECRET) {
    return NextResponse.json({ error: "Order tracking is not configured on the server yet." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const requested = Array.isArray(body?.items) ? body.items : [];
    const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
    const customerName = typeof body?.customerName === "string" ? body.customerName.trim().slice(0, 120) : "";

    if (!requested.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    if (!validEmail(customerEmail)) return NextResponse.json({ error: "Please enter a valid email address for your invoice." }, { status: 400 });

    const items = requested.map((item: { id?: string; quantity?: number }) => {
      const product = products.find((p) => p.id === item.id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid cart item.");
      return { ...product, quantity };
    });

    const totalRands = items.reduce((sum, item) => sum + sellingPrice(item.cost) * item.quantity, 0);
    const amount = Math.round(totalRands * 100);
    if (amount < 200) return NextResponse.json({ error: "Yoco requires a minimum payment of R2.00." }, { status: 400 });

    const origin = new URL(request.url).origin;
    const orderId = makeOrderId();
    const invoiceToken = makeInvoiceToken();

    const payload = {
      amount,
      currency: "ZAR",
      successUrl: `${origin}/checkout/success?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(invoiceToken)}`,
      cancelUrl: `${origin}/checkout/cancel`,
      failureUrl: `${origin}/checkout/cancel`,
      metadata: {
        store: "CleanEdge",
        orderId,
        invoiceToken,
        items: items.map((item) => `${item.id}x${item.quantity}`).join(","),
      },
    };

    const response = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Yoco checkout error:", response.status, data);
      return NextResponse.json({ error: "Yoco could not start the payment. Please try again." }, { status: 502 });
    }
    if (!data.redirectUrl || !data.id) {
      console.error("Yoco response missing checkout id/redirectUrl:", data);
      return NextResponse.json({ error: "Yoco did not return a payment link." }, { status: 502 });
    }

    await createOrder({
      id: orderId,
      invoiceToken,
      customerName,
      customerEmail,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPriceCents: Math.round(sellingPrice(item.cost) * 100),
        lineTotalCents: Math.round(sellingPrice(item.cost) * 100) * item.quantity,
      })),
      totalCents: amount,
    });
    await attachCheckout(orderId, data.id);

    return NextResponse.json({ redirectUrl: data.redirectUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 400 });
  }
}
