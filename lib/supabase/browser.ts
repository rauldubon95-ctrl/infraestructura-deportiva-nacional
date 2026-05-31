"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cliente público (anon key) para uso en componentes del cliente.
// Solo puede acceder a datos según las políticas RLS activas.
// No tiene acceso a contact_submissions (solo service_role puede leerlas).

let client: ReturnType<typeof createClient<Database>> | null = null;

export function createBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan variables de entorno públicas de Supabase (NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }

  client = createClient<Database>(url, anonKey);
  return client;
}
