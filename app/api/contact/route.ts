import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeName, sanitizeText, hashIp } from "@/lib/sanitize";
import { createAdminClient } from "@/lib/supabase/server";

const IP_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Rate limiting por IP ─────────────────────────────────────────────
  const forwarded = request.headers.get("x-forwarded-for");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : "";
  const ip = rawIp && IP_REGEX.test(rawIp) ? rawIp : "anonymous";
  const limit = rateLimit(ip, 5, 60_000);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un momento antes de intentar de nuevo." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  // ── 2. Parsear body ──────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  // ── 3. Honeypot: campo 'website' debe estar vacío ────────────────────────
  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    (body as Record<string, unknown>).website
  ) {
    // Respuesta silenciosa — no revelar al bot que fue detectado
    return NextResponse.json({ success: true });
  }

  // ── 4. Validación con Zod ────────────────────────────────────────────────
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Los datos enviados son inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;

  // ── 5. Saneamiento adicional ─────────────────────────────────────────────
  const cleanName    = sanitizeName(name);
  const cleanEmail   = email.toLowerCase().trim();
  const cleanMessage = sanitizeText(message);
  const ipHash       = await hashIp(ip);

  // ── 6. Persistir en Supabase ─────────────────────────────────────────────
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name:       cleanName,
      email:      cleanEmail,
      message:    cleanMessage,
      ip_hash:    ipHash,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // No exponer detalles internos al cliente
      console.error("[contact] Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Error al guardar el mensaje. Inténtalo de nuevo." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno. Inténtalo de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

// Solo se acepta POST en este endpoint
export function GET(): NextResponse {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
