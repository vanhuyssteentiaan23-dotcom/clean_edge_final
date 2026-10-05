import crypto from "node:crypto";
import { NextResponse } from "next/server";

function verifyYocoSignature(rawBody: string, headers: Headers, secret: string) {
  const webhookId = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");

  if (!webhookId || !timestamp || !signatureHeader || !secret.startsWith("whsec_")) {
    return false;
  }

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  // Reject stale deliveries to reduce replay risk.
  if (Math.abs(Date.now() / 1000 - timestampNumber) > 180) return false;

  const secretBytes = Buffer.from(secret.slice("whsec_".length), "base64");
  const signedPayload = `${webhookId}.${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedPayload)
    .digest("base64");

  return signatureHeader.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;

    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(value);
    return expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("YOCO_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();

  if (!verifyYocoSignature(rawBody, request.headers, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event?.type ?? event?.eventType ?? "unknown";
    const eventId = request.headers.get("webhook-id") ?? event?.id ?? "unknown";

    // The webhook is the authoritative payment notification.
    // Keep the event handling server-side; never trust the browser redirect as payment proof.
    if (eventType === "payment.succeeded") {
      console.log("CleanEdge Yoco payment succeeded:", { eventId, event });
    } else if (eventType === "payment.failed") {
      console.log("CleanEdge Yoco payment failed:", { eventId, event });
    } else {
      console.log("CleanEdge Yoco webhook received:", { eventId, eventType });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
}
