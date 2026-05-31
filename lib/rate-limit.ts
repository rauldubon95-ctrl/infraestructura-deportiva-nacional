// Rate limiting por IP usando ventana deslizante en memoria.
//
// LIMITACIÓN CONOCIDA (documentada en CLAUDE.md §3):
// En despliegues serverless (Vercel), cada instancia tiene su propio Map.
// Para producción con volumen alto, reemplazar con Upstash Redis o similar.
// Para un formulario de contacto de una organización pequeña, esto es aceptable.

const store = new Map<string, number[]>();

// Limpieza periódica para evitar memory leak en long-running instances
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
let lastCleanup = Date.now();

function maybeCleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const windowStart = now - windowMs;
  Array.from(store.entries()).forEach(([key, timestamps]) => {
    const filtered = timestamps.filter((t: number) => t > windowStart);
    if (filtered.length === 0) {
      store.delete(key);
    } else {
      store.set(key, filtered);
    }
  });
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param identifier — clave (ej. hash de IP)
 * @param limit      — máximo de solicitudes en la ventana (default: 5)
 * @param windowMs   — tamaño de la ventana en ms (default: 60 s)
 */
export function rateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  maybeCleanup(windowMs);

  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(identifier) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const oldest = Math.min(...timestamps);
    return {
      success: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  timestamps.push(now);
  store.set(identifier, timestamps);

  return {
    success: true,
    remaining: limit - timestamps.length,
    resetAt: now + windowMs,
  };
}
