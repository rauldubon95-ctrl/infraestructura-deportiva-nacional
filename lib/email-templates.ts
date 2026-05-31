/** Genera el HTML del email de respuesta enviado al interesado. */
export function buildReplyHtml(params: {
  recipientName: string;
  replyBody: string;
  context: string; // descripción breve del asunto original
}): string {
  const { recipientName, replyBody, context } = params;
  const bodyLines = replyBody.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bodyHtml = bodyLines.split("\n").map((l) => `<p style="margin:0 0 12px 0">${l || "&nbsp;"}</p>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Respuesta de Deportes Sin Fronteras</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">

        <!-- Header naranja -->
        <tr>
          <td style="background:#ea580c;padding:28px 32px">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff">Deportes Sin Fronteras</p>
            <p style="margin:4px 0 0;font-size:13px;color:#fed7aa">Respuesta a tu solicitud</p>
          </td>
        </tr>

        <!-- Cuerpo -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 20px;font-size:15px;color:#111827">Hola <strong>${recipientName}</strong>,</p>
            ${bodyHtml}

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
            <p style="margin:0;font-size:12px;color:#9ca3af">Este mensaje es en respuesta a tu ${context}. Si tienes dudas adicionales, puedes responder directamente a este correo.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;background:#f9fafb;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">
              Asociación Deportes Sin Fronteras · Este mensaje fue generado desde el panel administrativo
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
