import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isSessionCookieValid } from "@/lib/session";

const PUBLIC_PATHS = [
  "/pin",
  "/api/pin",
  "/api/telegram/webhook",
  "/api/webhooks/payment-sms",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No PIN configured (e.g. local dev without .env.local) — run in open
  // demo mode instead of locking everyone out.
  if (!process.env.APP_PIN || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (isSessionCookieValid(cookie)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/pin";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
