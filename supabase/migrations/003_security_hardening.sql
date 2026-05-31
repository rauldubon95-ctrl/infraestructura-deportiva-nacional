-- ─────────────────────────────────────────────────────────────────────────────
-- 003_security_hardening.sql
-- Correcciones de auditoría de seguridad 2026-05-31
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Convertir services.category de TEXT+CHECK a ENUM ─────────────────────
-- TEXT+CHECK no tiene integridad de tipo real en PostgreSQL;
-- ENUM garantiza que solo los valores definidos puedan existir.

DO $$ BEGIN
  CREATE TYPE public.service_category AS ENUM (
    'formulacion',
    'monitoreo',
    'datos',
    'investigacion',
    'instrumentos'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Eliminar el CHECK constraint implícito y cambiar el tipo de columna.
-- USING convierte los valores TEXT existentes al ENUM.
ALTER TABLE public.services
  ALTER COLUMN category TYPE public.service_category
    USING category::public.service_category;

-- ── 2. Cerrar INSERT público en quotation_requests ───────────────────────────
-- La política "quotations_insert_public" WITH CHECK (true) permitía a
-- cualquier cliente con la anon key insertar filas directamente vía la
-- API REST de Supabase, bypasenado toda la validación del route handler
-- (Zod, honeypot, rate-limit, saneamiento).
--
-- Corrección: solo el service_role puede insertar.
-- Nuestro route handler (app/api/quotation/route.ts) usa createAdminClient()
-- con SUPABASE_SERVICE_ROLE_KEY → el flujo legítimo no se ve afectado.

DROP POLICY IF EXISTS "quotations_insert_public" ON public.quotation_requests;

CREATE POLICY "quotations_insert_service_role" ON public.quotation_requests
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ── 3. Crear tabla allowed_users (admin allowlist) si no existe ──────────────
-- Requerida por verifyAdmin() en lib/supabase/admin-auth.ts.
-- Documentada en CLAUDE.md §8; puede que ya exista si se creó manualmente.

CREATE TABLE IF NOT EXISTS public.allowed_users (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede leer/escribir la lista de admins
CREATE POLICY IF NOT EXISTS "allowed_users_service_role" ON public.allowed_users
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
