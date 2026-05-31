-- ============================================================
-- 001_initial_schema.sql
-- Asociación Deportes Sin Fronteras — Esquema inicial
-- Aplicar: supabase db push ó Dashboard > SQL Editor
-- ============================================================

-- ── Tablas ──────────────────────────────────────────────────

-- Mensajes del formulario de contacto
create table if not exists public.contact_submissions (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null
               constraint name_length check (length(name) between 2 and 200),
  email      text        not null
               constraint email_format check (
                 email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
               ),
  message    text        not null
               constraint message_length check (length(message) between 10 and 5000),
  ip_hash    text,       -- hash SHA-256 truncado de la IP (ofuscación de PII)
  created_at timestamptz not null default now()
);

-- Registro de interés en donación (no datos de tarjeta)
create table if not exists public.donation_interests (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null
               constraint di_email_format check (
                 email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
               ),
  tier       text        not null
               constraint di_tier_valid check (
                 tier in ('amigo', 'defensor', 'campeon', 'patron')
               ),
  created_at timestamptz not null default now()
);

-- ── Habilitar RLS (deny-all por defecto) ────────────────────

alter table public.contact_submissions  enable row level security;
alter table public.donation_interests   enable row level security;

-- ── Políticas RLS ───────────────────────────────────────────
-- Las submissions son datos sensibles; solo la clave service_role (server-side)
-- puede leerlas e insertarlas. El cliente anon no tiene acceso.
-- Esto se aplica porque el route handler usa createAdminClient() con service_role.

-- IMPORTANTE: Si se desea permitir inserts desde el cliente anon en el futuro,
-- agregar política INSERT with check (true) y usar createBrowserClient() en el form.
-- Por ahora, todo pasa por el route handler server-side.

-- Política de lectura: solo service_role
create policy "service_only_select_contact"
  on public.contact_submissions
  for select
  using (auth.role() = 'service_role');

create policy "service_only_insert_contact"
  on public.contact_submissions
  for insert
  with check (auth.role() = 'service_role');

create policy "service_only_select_donations"
  on public.donation_interests
  for select
  using (auth.role() = 'service_role');

create policy "service_only_insert_donations"
  on public.donation_interests
  for insert
  with check (auth.role() = 'service_role');

-- ── Índices ─────────────────────────────────────────────────

create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);

create index if not exists idx_contact_submissions_email
  on public.contact_submissions (email);

create index if not exists idx_donation_interests_email
  on public.donation_interests (email);

create index if not exists idx_donation_interests_tier
  on public.donation_interests (tier);

-- ── Comentarios de tabla ─────────────────────────────────────

comment on table public.contact_submissions is
  'Mensajes recibidos a través del formulario de contacto del sitio web.';

comment on table public.donation_interests is
  'Registros de interés en donación. No contiene datos de tarjeta.';
