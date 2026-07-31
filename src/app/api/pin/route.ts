import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionCookieValue,
  timingSafeStringEqual,
} from "@/lib/session";

export async function POST(request: Request) {
  const appPin = process.env.APP_PIN;
  if (!appPin) {
    return NextResponse.json(
      { error: "APP_PIN is not configured on the server" },
      { status: 500 },
    );
  }

  const { pin } = await request.json().catch(() => ({ pin: "" }));
  if (typeof pin !== "string" || !timingSafeStringEqual(pin, appPin)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
