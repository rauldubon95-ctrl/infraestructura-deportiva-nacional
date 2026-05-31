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

/** Saneamiento para nombres de organización (igual a sanitizeName pero 200 chars). */
export function sanitizeOrg(input: string): string {
  return sanitizeName(input);
}

/**
 * Valida y sanitiza nombres de archivo para evitar path traversal y extensiones peligrosas.
 * Devuelve null si el archivo no es aceptable.
 */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".xlsx", ".xls", ".jpg", ".jpeg", ".png"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateUploadedFile(
  file: File,
): { ok: true; ext: string } | { ok: false; reason: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: "El archivo supera el límite de 10 MB." };
  }

  const originalName = file.name.toLowerCase();
  const dotIndex = originalName.lastIndexOf(".");
  if (dotIndex === -1) {
    return { ok: false, reason: "El archivo no tiene extensión." };
  }

  const ext = originalName.slice(dotIndex);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, reason: "Tipo de archivo no permitido." };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, reason: "Tipo MIME no permitido." };
  }

  // Asegurar que no hay caracteres de path traversal en el nombre
  if (/[/\\]/.test(file.name) || file.name.includes("..")) {
    return { ok: false, reason: "Nombre de archivo inválido." };
  }

  return { ok: true, ext };
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
