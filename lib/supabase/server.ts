import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cliente con service_role — bypasa RLS completamente.
// SOLO para uso en route handlers server-side (app/api/**).
// NUNCA importar desde componentes del cliente.
// SUPABASE_SERVICE_ROLE_KEY sin prefijo NEXT_PUBLIC_ → jamás llega al bundle del cliente.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no configurada. " +
        "Añadirla en Vercel Dashboard → Settings → Environment Variables.",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Cliente server-side con anon key + RLS activa.
// Úsalo cuando la política RLS permita la operación al rol 'anon'
// (ej: INSERT en contact_submissions con política anon_insert_contact).
export function createServerAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Devuelve el cliente más privilegiado disponible.
// Si SUPABASE_SERVICE_ROLE_KEY está configurada, usa admin (bypasa RLS).
// Si no, usa anon (requiere política RLS anon_insert_contact).
export function createBestAvailableClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  const key = serviceKey ?? anonKey!;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
