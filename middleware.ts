import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let SUPABASE_HOST = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // URL inválida — connect-src queda restringido a 'self'
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Protect admin routes — redirect to login if cookie absent
  if (pathname.startsWith("/admin/") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("dsf_admin");
    if (!cookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const response = NextResponse.next();

  const connectSrc = [
    "'self'",
    SUPABASE_HOST ? `https://${SUPABASE_HOST}` : "",
    SUPABASE_HOST ? `wss://${SUPABASE_HOST}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
