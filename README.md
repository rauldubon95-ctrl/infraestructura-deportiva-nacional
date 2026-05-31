# infraestructura-deportiva-nacional

Repositorio monorepo con dos proyectos deportivos:

1. **`/` (raíz)** — Sitio institucional **Asociación Deportes Sin Fronteras**
2. **`/centro-monitoreo-deportes/`** — Dashboard de monitoreo con mapa interactivo

---

# Asociación Deportes Sin Fronteras — Sitio Web Institucional

Sitio web de una sola página para la **Asociación Deportes Sin Fronteras**,
organización deportiva y social sin fines de lucro.

> **Para retomar el desarrollo:** Lee [`CLAUDE.md`](./CLAUDE.md) — contiene el estado
> actual, decisiones técnicas y la lista completa de `TODO:` pendientes.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 · App Router · TypeScript `strict` · Tailwind CSS v3 |
| Deploy | Vercel |
| Base de datos | Supabase (Postgres + RLS) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Validación | Zod |
| Iconos | lucide-react |

---

## Instalación

```bash
# 1. Instalar dependencias (desde la raíz del repo)
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# → Editar .env.local con los valores reales

# 3. Arrancar en desarrollo
npm run dev
```

---

## Variables de entorno

| Variable | Descripción | Público |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon (con RLS activa) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave admin — **NUNCA exponer al cliente** | ❌ |
| `ADMIN_EMAIL` | Email para notificaciones de contacto | ❌ |

> ⚠️ **Jamás commitear `.env.local` ni ningún archivo `.env.*` con valores reales.**
> Solo `.env.example` va al repositorio.

---

## Base de datos (Supabase)

Aplicar la migración inicial:

```bash
# Con Supabase CLI
supabase db push

# O manualmente en Dashboard > SQL Editor
# Pegar el contenido de supabase/migrations/001_initial_schema.sql
```

---

## Agregar una nueva sección

1. Crear `components/sections/NuevaSección.tsx`
2. Añadir contenido en `config/content.ts` si es necesario
3. Registrar en `config/sections.config.ts`:

```ts
{ key: "nueva-seccion", Component: NuevaSección, active: true }
```

Sin modificar `app/page.tsx` ni ningún otro archivo.

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint (0 warnings)
npm run format       # Prettier
npm run type-check   # TypeScript sin emit
npm run audit        # npm audit (nivel moderate)
```

---

## Modelo de seguridad

Este proyecto implementa defensa en profundidad. Los controles activos están
documentados en `CLAUDE.md §6`.

**Dentro del alcance de este código:**
- CSP restrictiva, HSTS, X-Frame-Options, Permissions-Policy
- Validación server-side con Zod
- Saneamiento de entrada (strip HTML, null bytes, event handlers)
- Rate limiting por IP (en memoria; escalar con Upstash para producción)
- Honeypot anti-spam en formularios
- RLS activa en todas las tablas de Supabase
- Sin datos de tarjeta en la app (redirect a Stripe cuando esté configurado)

**Fuera del alcance (mitigar en hosting):**
- DDoS de capa de red → Cloudflare / Vercel Shield
- Web Application Firewall → Cloudflare WAF

---

## Dependencias y seguridad

Activar **Dependabot** en GitHub:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
```

---

*Documentación técnica completa: [`CLAUDE.md`](./CLAUDE.md)*
