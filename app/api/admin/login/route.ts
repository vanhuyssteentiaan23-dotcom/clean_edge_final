import crypto from "node:crypto";
import { NextResponse } from "next/server";

function cookieValue(password: string) {
  return crypto.createHmac("sha256", password).update("CleanEdge admin session").digest("hex");
}

export async function POST(request: Request) {
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Admin dashboard is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body?.password !== "string") {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const supplied = Buffer.from(body.password);
  const expected = Buffer.from(password);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("cleanedge_admin", cookieValue(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
