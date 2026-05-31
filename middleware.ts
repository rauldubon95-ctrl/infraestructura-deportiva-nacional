import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Orígenes permitidos para connect-src (Supabase project URL).
// El try/catch evita que una URL mal formada en el env var rompa todos los requests.
let SUPABASE_HOST = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    SUPABASE_HOST = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  }
} catch {
  // URL inválida — connect-src queda restringido a 'self'
}

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  // Nonce por request para script-src con 'strict-dynamic'
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const connectSrc = [
    "'self'",
    SUPABASE_HOST ? `https://${SUPABASE_HOST}` : "",
    SUPABASE_HOST ? `wss://${SUPABASE_HOST}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Content-Security-Policy restrictiva.
  // 'unsafe-inline' en style-src es necesario porque Next.js inyecta
  // estilos críticos inline y Tailwind JIT en desarrollo.
  // Trade-off documentado en CLAUDE.md §3.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
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
  // Exponer nonce a Server Components via cabecera (no al cliente)
  response.headers.set("x-nonce", nonce);

  // Strict Transport Security: 2 años, incluir subdominios, preload
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Bloquear acceso a sensores que no se usan
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );

  // Evitar sniffing del tipo MIME en scripts
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Eliminar cabecera que expone tecnología
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto archivos estáticos de Next.js
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
