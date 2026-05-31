import { Resend } from "resend";

// Instancia lazy: se crea solo al primer uso (no en tiempo de build).
let _resend: Resend | null = null;
export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// En desarrollo/prueba usa onboarding@resend.dev (no requiere dominio verificado).
// En producción cambia a: "Deportes Sin Fronteras <no-reply@tudominio.com>"
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Deportes Sin Fronteras <onboarding@resend.dev>";
