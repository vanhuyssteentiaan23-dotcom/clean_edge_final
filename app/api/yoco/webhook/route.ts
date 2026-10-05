import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { markEmailSent, markFailed, markPaid, OrderRecord } from "@/lib/cleanedge-order";

function verifyYocoSignature(rawBody: string, headers: Headers, secret: string) {
  const webhookId = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!webhookId || !timestamp || !signatureHeader || !secret.startsWith("whsec_")) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > 180) return false;

  const secretBytes = Buffer.from(secret.slice("whsec_".length), "base64");
  const signedPayload = `${webhookId}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secretBytes).update(signedPayload).digest("base64");

  return signatureHeader.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(value);
    return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  });
}

function extractCheckoutId(event: any) {
  return event?.data?.metadata?.checkoutId
    ?? event?.metadata?.checkoutId
    ?? event?.data?.object?.metadata?.checkoutId
    ?? event?.data?.object?.id
    ?? event?.data?.id
    ?? event?.id
    ?? null;
}

function extractPaymentId(event: any) {
  return event?.data?.object?.paymentId
    ?? event?.data?.object?.id
    ?? event?.data?.paymentId
    ?? null;
}

async function sendOrderEmail(order: OrderRecord) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const merchant = process.env.ORDER_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !merchant || !order.items) {
    throw new Error("Email delivery is not configured.");
  }

  const invoiceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://cleanedgefinal-xbdw.vercel.app"}/invoice/${order.id}?token=${encodeURIComponent(order.invoice_token)}`;
  const rows = order.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e6e0d7;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e6e0d7;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e6e0d7;text-align:right;">R ${(item.lineTotalCents / 100).toFixed(2)}</td>
    </tr>`).join("");

  const html = `
  <div style="font-family:Arial,sans-serif;background:#f4f0e9;padding:30px;color:#171717;">
    <div style="max-width:640px;margin:auto;background:#fff;padding:32px;border:1px solid #ddd;">
      <div style="font-size:30px;font-weight:900;letter-spacing:-1px;">CLEAN<span style="color:#ff4a1f;">EDGE</span></div>
      <p style="color:#ff4a1f;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Payment confirmed</p>
      <h1 style="font-size:32px;margin:10px 0;">Thanks for your order.</h1>
      <p>Order <strong>#${order.id.slice(0,8).toUpperCase()}</strong> has been paid successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:25px 0;">
        <thead><tr><th style="text-align:left;padding-bottom:8px;">Item</th><th style="text-align:center;padding-bottom:8px;">Qty</th><th style="text-align:right;padding-bottom:8px;">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:18px;text-align:right;"><strong>Total paid: R ${(order.total_cents/100).toFixed(2)}</strong></p>
      <p><a href="${invoiceUrl}" style="display:inline-block;background:#ff4a1f;color:#fff;text-decoration:none;padding:13px 18px;font-weight:700;">VIEW / PRINT INVOICE</a></p>
      <p style="color:#777;font-size:12px;margin-top:28px;">This email was sent by CleanEdge.</p>
    </div>
  </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [order.customer_email, merchant],
      subject: `CleanEdge order #${order.id.slice(0,8).toUpperCase()} — payment confirmed`,
      html,
      text: `CleanEdge order #${order.id.slice(0,8).toUpperCase()} paid. Total: R ${(order.total_cents/100).toFixed(2)}. Invoice: ${invoiceUrl}`,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Resend error:", response.status, data);
    throw new Error("Email delivery failed.");
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });

  const rawBody = await request.text();
  if (!verifyYocoSignature(rawBody, request.headers, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event?.type ?? event?.eventType ?? "unknown";
    const eventId = request.headers.get("webhook-id") ?? event?.id ?? "unknown";
    const checkoutId = extractCheckoutId(event);

    if (eventType === "payment.succeeded" && checkoutId) {
      const order = await markPaid({
        checkoutId,
        paymentId: extractPaymentId(event),
        eventId,
      });

      if (order && !order.email_sent_at) {
        try {
          await sendOrderEmail(order);
          await markEmailSent(order.id);
        } catch (emailError) {
          console.error("CleanEdge order email failed:", emailError);
        }
      }
    } else if (eventType === "payment.failed" && checkoutId) {
      await markFailed(checkoutId, eventId);
    } else {
      console.log("CleanEdge Yoco webhook received:", { eventId, eventType, checkoutId });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
