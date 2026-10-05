import crypto from "node:crypto";

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderRecord = {
  id: string;
  invoice_token: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  yoco_checkout_id: string | null;
  yoco_payment_id: string | null;
  event_id: string | null;
  email_sent_at: string | null;
  created_at: string;
  paid_at: string | null;
  items?: OrderItem[];
};

const supabaseUrl = () => process.env.SUPABASE_URL;
const supabaseKey = () => process.env.SUPABASE_ANON_KEY;

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) throw new Error("Order database is not configured.");

  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`Supabase RPC ${name} failed:`, response.status, data);
    throw new Error("Order database request failed.");
  }
  return data as T;
}

export function makeInvoiceToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function makeOrderId() {
  return crypto.randomUUID();
}

export async function createOrder(input: {
  id: string;
  invoiceToken: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalCents: number;
}) {
  return rpc<OrderRecord>("cleanedge_create_order", {
    p_order_id: input.id,
    p_invoice_token: input.invoiceToken,
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_items: input.items,
    p_total_cents: input.totalCents,
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}

export async function attachCheckout(orderId: string, checkoutId: string) {
  return rpc<OrderRecord>("cleanedge_attach_checkout", {
    p_order_id: orderId,
    p_yoco_checkout_id: checkoutId,
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}

export async function markPaid(input: {
  checkoutId: string;
  paymentId: string | null;
  eventId: string;
}) {
  return rpc<OrderRecord>("cleanedge_mark_paid", {
    p_yoco_checkout_id: input.checkoutId,
    p_yoco_payment_id: input.paymentId,
    p_event_id: input.eventId,
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}

export async function markFailed(checkoutId: string, eventId: string) {
  return rpc<OrderRecord>("cleanedge_mark_failed", {
    p_yoco_checkout_id: checkoutId,
    p_event_id: eventId,
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}

export async function markEmailSent(orderId: string) {
  return rpc<OrderRecord>("cleanedge_mark_email_sent", {
    p_order_id: orderId,
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}

export async function getInvoice(orderId: string, invoiceToken: string) {
  return rpc<OrderRecord>("cleanedge_get_invoice", {
    p_order_id: orderId,
    p_invoice_token: invoiceToken,
  });
}

export async function listAdminOrders() {
  return rpc<OrderRecord[]>("cleanedge_admin_orders", {
    p_server_secret: process.env.ORDER_API_SECRET ?? "",
  });
}
