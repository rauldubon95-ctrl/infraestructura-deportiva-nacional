import { z } from "zod";

// ─── Formulario de contacto ───────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "Nombre demasiado largo")
    .trim(),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .max(320, "Correo demasiado largo")
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "Mensaje demasiado largo")
    .trim(),
  // Campo honeypot: debe estar vacío (bots lo llenan automáticamente)
  website: z.string().max(0, "").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Registro de interés en donación ────────────────────────────────────────

export const donationInterestSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .max(320)
    .toLowerCase()
    .trim(),
  tier: z.enum(["amigo", "defensor", "campeon", "patron"]),
});

export type DonationInterestInput = z.infer<typeof donationInterestSchema>;

// ─── Solicitud de cotización ─────────────────────────────────────────────────

const ALLOWED_BUDGETS = [
  "menos-500",
  "500-1000",
  "1000-3000",
  "3000-5000",
  "mas-5000",
  "por-definir",
] as const;

export const quotationSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "Nombre demasiado largo")
    .trim(),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .max(320, "Correo demasiado largo")
    .toLowerCase()
    .trim(),
  organization: z
    .string()
    .max(200, "Nombre de organización demasiado largo")
    .trim()
    .optional(),
  serviceSlug: z
    .string()
    .min(1, "Servicio requerido")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Servicio inválido"),
  serviceName: z
    .string()
    .min(1, "Nombre de servicio requerido")
    .max(120)
    .trim(),
  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(5000, "Descripción demasiado larga")
    .trim(),
  budget: z.enum(ALLOWED_BUDGETS).optional(),
  website: z.string().max(0, "").optional(), // honeypot
});

export type QuotationInput = z.infer<typeof quotationSchema>;

export const BUDGET_LABELS: Record<typeof ALLOWED_BUDGETS[number], string> = {
  "menos-500":  "Menos de $500",
  "500-1000":   "$500 – $1,000",
  "1000-3000":  "$1,000 – $3,000",
  "3000-5000":  "$3,000 – $5,000",
  "mas-5000":   "Más de $5,000",
  "por-definir": "Por definir",
};
