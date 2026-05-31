import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminCookie } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { buildReplyHtml } from "@/lib/email-templates";
import { sanitizeText } from "@/lib/sanitize";

const replySchema = z.object({
  id:             z.string().uuid(),
  type:           z.enum(["quotation", "contact"]),
  recipientName:  z.string().min(1).max(200),
  recipientEmail: z.string().email().max(320),
  subject:        z.string().min(1).max(200),
  body:           z.string().min(10).max(10_000),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!await verifyAdminCookie(request.cookies)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: "Body inválido." }, { status: 400 }); }

  const parsed = replySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", details: parsed.error.flatten() }, { status: 422 });
  }

  const { id, type, recipientName, recipientEmail, subject, body } = parsed.data;
  const cleanBody = sanitizeText(body);
  const table   = type === "quotation" ? "quotation_requests" : "contact_submissions";
  const context = type === "quotation" ? "solicitud de cotización" : "mensaje de contacto";

  const supabase = createAdminClient();
  const { data: record, error: fetchError } = await supabase
    .from(table)
    .select("id, replied_at")
    .eq("id", id)
    .single();

  if (fetchError || !record) {
    return NextResponse.json({ error: "Registro no encontrado." }, { status: 404 });
  }

  if (record.replied_at) {
    return NextResponse.json({ error: "Este registro ya tiene una respuesta enviada." }, { status: 409 });
  }

  const { error: emailError } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      [recipientEmail],
    subject,
    html:    buildReplyHtml({ recipientName, replyBody: cleanBody, context }),
  });

  if (emailError) {
    console.error("[admin/reply] Resend error:", emailError);
    return NextResponse.json({ error: "Error al enviar el correo. Verifica la configuración de Resend." }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from(table)
    .update({ replied_at: new Date().toISOString(), reply_text: cleanBody })
    .eq("id", id);

  if (updateError) {
    console.error("[admin/reply] DB update error:", updateError.message);
  }

  return NextResponse.json({ success: true });
}
