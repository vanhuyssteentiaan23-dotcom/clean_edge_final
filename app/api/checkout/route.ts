import { NextResponse } from "next/server";
import { attachCheckout, createOrder, makeInvoiceToken, makeOrderId } from "../../../lib/cleanedge-order";

const products = [
  { id: "microfiber-5", name: "5-Pack Microfiber Cloths", cost: 40, salePrice: 50 },
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
  { id: "microfiber-roll", name: "100-Piece Microfiber Cleaning Cloth Roll", cost: 70 },
  { id: "shield-shampoo-conditioner-1l", name: "Shield Car Shampoo & Conditioner 1L", cost: 44.99 },
  { id: "shield-snow-foam-1l", name: "Shield Snow Foam 1L", cost: 99.99 },
  { id: "shield-xtreme-shampoo-500ml", name: "Shield Xtreme Shampoo 500ml", cost: 34.99 },
  { id: "shield-jetwasher-1l", name: "Shield Jetwasher Foam Wash 1L", cost: 109.99 },
  { id: "shield-tyre-shine-500ml", name: "Shield Tyre Shine Silicone 500ml", cost: 79.99 },
  { id: "shield-tyre-gloss-aerosol-400ml", name: "Shield Tyre Gloss Aerosol 400ml", cost: 49.99 },
  { id: "shield-tyre-polish-paste-400ml", name: "Shield Tyre Polish Paste 400ml", cost: 69.99 },
  { id: "shield-max-shine-tyre-gel-500ml", name: "Shield Max Shine Tyre Gel 500ml", cost: 229.99 },
  { id: "shield-mag-cleaner-500ml", name: "Shield Mag Cleaner 500ml", cost: 59.99 },
  { id: "shield-miraplate-500ml", name: "Shield Miraplate 500ml", cost: 79.99 },
  { id: "shield-power-force-degreaser-1l", name: "Shield Power Force Heavy Duty Degreaser 1L", cost: 59.99 },
  { id: "shield-waterless-glass-cleaner-1l", name: "Shield Waterless Auto Glass Cleaner 1L", cost: 49.99 },
  { id: "shield-high-foam-shampoo-5l", name: "Shield High Foam Car Shampoo 5L", cost: 109 },
  { id: "shield-splash-wash-wax-1l", name: "Shield Splash Wash & Wax 1L", cost: 49.99 },
  { id: "shield-sheen-silicone-500ml", name: "Shield Sheen Silicone 500ml", cost: 69.99 },
  { id: "shield-car-polish-paste-200ml", name: "Shield Car Polish Paste 200ml", cost: 69.99 },
  { id: "shield-blade-apc-750ml", name: "Shield Blade All Purpose Cleaner 750ml", cost: 49.99 },
  { id: "shield-engine-cleaner-500ml", name: "Shield Engine Cleaner Water Based 500ml", cost: 39.99 },
  { id: "shield-splash-n-dash-sponge", name: "Shield Splash n Dash Sponge", cost: 29.99 },
  { id: "shield-foam-applicator-pads-3", name: "Shield Foam Applicator Pads 3-Pack", cost: 54.99 },
  { id: "wash-shine-kit", name: "CleanEdge Wash & Shine Kit", cost: 364.98, salePrice: 549 },
  { id: "wheel-tyre-kit", name: "CleanEdge Wheel & Tyre Kit", cost: 239.98, salePrice: 379 },
  { id: "interior-glass-kit", name: "CleanEdge Interior & Glass Kit", cost: 319.98, salePrice: 479 },
  { id: "ultimate-detail-kit", name: "CleanEdge Ultimate Detail Kit", cost: 634.95, salePrice: 999 },
];

const sellingPrice = (cost: number, salePrice?: number) => salePrice ?? cost * 1.65;
const microfiberRollColors = ["Pink", "Grey", "Blue"];

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

    const items = requested.map((item: { id?: string; quantity?: number; color?: string }) => {
      const product = products.find((p) => p.id === item.id);
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid cart item.");
      return { ...product, quantity, color: product.id === "touch-up-pen" ? (typeof item.color === "string" && ["Silvery","Grey","Red","Blue","Black","White","Pearl White","Varnish"].includes(item.color) ? item.color : "Black") : product.id === "microfiber-roll" ? (typeof item.color === "string" && microfiberRollColors.includes(item.color) ? item.color : "Grey") : undefined };
    });

    const subtotalRands = items.reduce((sum, item) => sum + sellingPrice(item.cost, item.salePrice) * item.quantity, 0);
    const subtotalCents = Math.round(subtotalRands * 100);
    const shippingCents = 0;
    const amount = subtotalCents;
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
        items: items.map((item) => `${item.id}x${item.quantity}${item.color ? `-${item.color}` : ""}`).join(","),
        subtotalCents: String(subtotalCents),
        shippingCents: String(shippingCents),
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
        name: item.color ? `${item.name} — ${item.color}` : item.name,
        quantity: item.quantity,
        unitPriceCents: Math.round(sellingPrice(item.cost, item.salePrice) * 100),
        lineTotalCents: Math.round(sellingPrice(item.cost, item.salePrice) * 100) * item.quantity,
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
