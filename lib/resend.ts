import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// En desarrollo/prueba usa onboarding@resend.dev (no requiere dominio verificado).
// En producción cambia a: "Deportes Sin Fronteras <no-reply@tudominio.com>"
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Deportes Sin Fronteras <onboarding@resend.dev>";
