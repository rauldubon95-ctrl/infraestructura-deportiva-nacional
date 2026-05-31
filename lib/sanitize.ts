// Saneamiento de cadenas de texto provenientes de entrada externa.
// No reemplaza la validación con Zod — es una capa adicional de defensa.

const MAX_LENGTH = 10_000;

/**
 * Elimina etiquetas HTML, atributos de evento y protocolos peligrosos.
 * Usar antes de persistir cualquier cadena de usuario en la DB.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/javascript:/gi, "")       // strip JS protocol
    .replace(/data:/gi, "")             // strip data URIs
    .replace(/on\w+\s*=/gi, "")         // strip event handlers (onclick=, etc.)
    .replace(/\x00/g, "")              // strip null bytes
    .trim()
    .slice(0, MAX_LENGTH);
}

/**
 * Normaliza espacios en blanco y elimina caracteres de control.
 */
export function sanitizeName(input: string): string {
  return sanitizeText(input)
    .replace(/\s+/g, " ")
    .slice(0, 200);
}

/**
 * Hash simple de IP para logs/rate-limit sin almacenar la IP completa.
 * No es criptográficamente seguro para secretos, solo para ofuscación de PII.
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
