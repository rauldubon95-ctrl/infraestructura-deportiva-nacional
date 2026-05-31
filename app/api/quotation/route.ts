import { NextRequest, NextResponse } from "next/server";
import { quotationSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeName, sanitizeText, sanitizeOrg, validateUploadedFile, hashIp } from "@/lib/sanitize";
import { createBestAvailableClient } from "@/lib/supabase/server";

// Cotizaciones: límite más estricto (3 por 10 min por IP)
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Rate limiting ────────────────────────────────────────────────────────
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "anonymous";
  const limit = rateLimit(`quotation:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  // ── 2. Parsear FormData ─────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato de solicitud inválido." }, { status: 400 });
  }

  // ── 3. Honeypot ─────────────────────────────────────────────────────────────
  const honeypot = formData.get("website");
  if (honeypot) {
    return NextResponse.json({ success: true }); // silencioso
  }

  // ── 4. Extraer y validar campos con Zod ─────────────────────────────────────
  const rawBody = {
    name:         formData.get("name"),
    email:        formData.get("email"),
    organization: formData.get("organization") || undefined,
    serviceSlug:  formData.get("serviceSlug"),
    serviceName:  formData.get("serviceName"),
    description:  formData.get("description"),
    budget:       formData.get("budget") || undefined,
    website:      formData.get("website") || undefined,
  };

  const parsed = quotationSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Los datos enviados son inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, organization, serviceSlug, serviceName, description, budget } = parsed.data;

  // ── 5. Saneamiento ──────────────────────────────────────────────────────────
  const cleanName    = sanitizeName(name);
  const cleanEmail   = email.toLowerCase().trim();
  const cleanOrg     = organization ? sanitizeOrg(organization) : null;
  const cleanDesc    = sanitizeText(description);
  const ipHash       = await hashIp(ip);

  // ── 6. Validar y subir archivo (si se adjuntó) ──────────────────────────────
  let filePath: string | null = null;
  let fileName: string | null = null;

  const fileEntry = formData.get("file");
  if (fileEntry && fileEntry instanceof File && fileEntry.size > 0) {
    const validation = validateUploadedFile(fileEntry);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Nombre seguro: UUID + extensión original
    const { ext } = validation;
    const safeFileName = `${crypto.randomUUID()}${ext}`;
    const storagePath  = `quotations/${new Date().toISOString().slice(0, 7)}/${safeFileName}`;

    try {
      const supabase = createBestAvailableClient();
      const arrayBuffer = await fileEntry.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("quotation-attachments")
        .upload(storagePath, arrayBuffer, {
          contentType:  fileEntry.type,
          cacheControl: "3600",
          upsert:       false,
        });

      if (uploadError) {
        console.error("[quotation] Storage upload error:", uploadError.message);
        // No bloquear la solicitud si falla el upload; continuar sin archivo
      } else {
        filePath = storagePath;
        fileName = fileEntry.name.slice(0, 200);
      }
    } catch (err) {
      console.error("[quotation] Upload unexpected error:", err);
    }
  }

  // ── 7. Persistir cotización en Supabase ─────────────────────────────────────
  try {
    const supabase = createBestAvailableClient();
    const { error } = await supabase.from("quotation_requests").insert({
      name:         cleanName,
      email:        cleanEmail,
      organization: cleanOrg,
      service_slug: serviceSlug,
      service_name: serviceName,
      description:  cleanDesc,
      budget:       budget ?? null,
      file_path:    filePath,
      file_name:    fileName,
      ip_hash:      ipHash,
    });

    if (error) {
      console.error("[quotation] Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Error al guardar la solicitud. Inténtalo de nuevo." },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error("[quotation] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export function GET(): NextResponse {
  return NextResponse.json({ error: "Método no permitido." }, { status: 405 });
}
