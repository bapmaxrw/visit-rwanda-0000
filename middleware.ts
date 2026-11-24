import { NextResponse, type NextRequest } from "next/server";
import { authSecretOrNull } from "@/lib/auth-secret";

/**
 * Early gate for the administrator area.
 *
 * The admin layout still verifies the session against the database and checks
 * the role, but Next renders layouts and pages in parallel: without this gate a
 * request with no valid session was answered with the page's HTML (streamed
 * before the redirect), which could expose visitor data. Requiring a session
 * cookie plus its signature here means such requests are rejected before any
 * admin page is rendered. The signature is an HMAC of the token, so it cannot be
 * produced for a made-up value.
 */
const SESSION_COOKIE = "vr_session";
const SIGNATURE_COOKIE = "vr_session_sig";

const encoder = new TextEncoder();

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function signatureMatches(token: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  return safeEqual(base64Url(digest), signature);
}

export async function middleware(request: NextRequest) {
  const secret = authSecretOrNull();
  if (!secret) {
    return new NextResponse(
      "AUTH_SECRET is not configured, so administrator access is disabled. Set AUTH_SECRET and restart the app.",
      { status: 503 }
    );
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const signature = request.cookies.get(SIGNATURE_COOKIE)?.value;

  if (token && signature && (await signatureMatches(token, signature, secret))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
