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
