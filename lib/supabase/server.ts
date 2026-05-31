import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cliente con service_role — bypasa RLS.
// SOLO para uso en route handlers server-side (app/api/**).
// NUNCA importar desde componentes del cliente.
// La clave SUPABASE_SERVICE_ROLE_KEY no tiene prefijo NEXT_PUBLIC_ → jamás llega al bundle del cliente.

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY). " +
        "Verifica tu .env o las variables de Vercel.",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
