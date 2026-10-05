import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { listAdminOrders } from "@/lib/cleanedge-order";

function cookieValue(password: string) {
  return crypto.createHmac("sha256", password).update("CleanEdge admin session").digest("hex");
}

function authorized(request: Request) {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!password) return false;
  const expected = cookieValue(password);
  const actual = request.headers.get("cookie")?.match(/(?:^|; )cleanedge_admin=([^;]+)/)?.[1];
  if (!actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const orders = await listAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Unable to load orders." }, { status: 500 });
  }
}
