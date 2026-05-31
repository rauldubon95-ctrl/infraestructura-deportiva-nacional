// Edge Function: contact-notify
// Enviada después de un insert en contact_submissions.
// Configurar como Database Webhook en Supabase Dashboard:
//   Tabla: contact_submissions · Evento: INSERT · URL: /functions/v1/contact-notify
//
// Variables de entorno requeridas en Supabase:
//   ADMIN_EMAIL — destinatario de las notificaciones
//   (Para envío real, integrar Resend / SendGrid / SMTP)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
  };
  schema: string;
  old_record: null | Record<string, unknown>;
}

serve(async (req: Request) => {
  // Verificar método
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Verificar que viene del webhook de Supabase
  // En producción, verificar el header Authorization con el JWT del proyecto.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json() as WebhookPayload;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (payload.type !== "INSERT" || payload.table !== "contact_submissions") {
    return new Response("OK — evento ignorado", { status: 200 });
  }

  const { name, email, message, created_at } = payload.record;
  const adminEmail = Deno.env.get("ADMIN_EMAIL");

  if (!adminEmail) {
    console.error("[contact-notify] ADMIN_EMAIL no configurado");
    return new Response("Config error", { status: 500 });
  }

  // TODO: integrar proveedor de email real (Resend, SendGrid, etc.)
  // Por ahora, solo loguea el evento.
  console.log("[contact-notify] Nuevo mensaje de contacto:", {
    name,
    email,
    preview: message.slice(0, 100),
    received: created_at,
    to: adminEmail,
  });

  // Ejemplo de integración con Resend (descomentar cuando esté configurado):
  /*
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "notificaciones@deportesinfronteras.org",
        to: adminEmail,
        subject: `Nuevo mensaje de ${name}`,
        html: `<p><b>Nombre:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Mensaje:</b><br>${message}</p>`,
      }),
    });
  }
  */

  return new Response(JSON.stringify({ notified: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
