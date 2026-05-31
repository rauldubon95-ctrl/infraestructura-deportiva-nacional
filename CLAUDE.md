# CLAUDE.md — Registro Vivo del Proyecto
**Asociación Deportes Sin Fronteras** · Sitio Institucional  
Última actualización: 2026-05-31 (sesión auth rewrite)

---

## 1. Resumen del Proyecto

Sitio web institucional de una sola página para la **Asociación Deportes Sin Fronteras**,
organización deportiva/social sin fines de lucro.

| Aspecto | Detalle |
|---------|----------|
| Tipo | Landing institucional SPA (scroll) |
| Idioma | Español (`lang="es"`) |
| Color de marca | `#ea580c` (naranja) |
| Frontend | Next.js 15 · App Router · TypeScript `strict` · Tailwind CSS v3 |
| Deploy | Vercel (proyecto `prj_OkffioASh5es7J1dJozi4iSiKF0q`, team `team_81Sfz6htjfh0Chb0Bk4iMvbU`) |
| URL producción | `https://infraestructura-deportiva-nacional.vercel.app` |
| Backend / datos | Supabase proyecto `iaolmlfrzjaafmklkoju` (us-west-2, ACTIVE_HEALTHY) |
| Autenticación admin | Cookie httpOnly firmada con HMAC-SHA256 (ver §9) |

**Repo también contiene:** `centro-monitoreo-deportes/` — proyecto existente de monitoreo
deportivo con mapa interactivo. No modificar.

---

## 2. Estado Actual

### ✅ Completado (sesión 2026-05-31 — auth rewrite)
- Sistema de login admin reescrito completamente: ya NO depende de Supabase Auth ni del cliente browser
- Nuevo `lib/admin-session.ts`: token HMAC-SHA256 vía Web Crypto API (compatible Edge + Node)
- Nuevo `app/api/admin/auth/route.ts`: POST (login → cookie) / DELETE (logout → borra cookie)
- `middleware.ts` actualizado: protege `/admin/*` a nivel de servidor redirigiendo a `/admin/login` si no hay cookie
- `app/admin/login/page.tsx`: solo campo contraseña, sin correo, sin Supabase
- `app/admin/layout.tsx`: simplificado, sin Supabase, logout vía DELETE
- Las 4 rutas API admin (`quotations`, `messages`, `reply`, `services`) usan `verifyAdminCookie` en vez de Bearer JWT
- Las 3 páginas admin (`cotizaciones`, `mensajes`, `servicios`) usan `fetch` directo sin tokens
- `ADMIN_PASSWORD` removido de `vercel.json` — se configura como secreto en Vercel Dashboard

### ⚠️ PENDIENTE CRÍTICO — variables de entorno en Vercel Dashboard

El sitio (no el admin) usa `createBrowserClient()` para formularios de contacto. Si aparece el error
`"Faltan variables de entorno públicas de Supabase"` en producción, significa que las variables
`NEXT_PUBLIC_*` que están en `vercel.json` no se están aplicando en ese deployment.

**Solución:** ir a Vercel Dashboard → proyecto → Settings → Environment Variables y verificar/agregar:

| Variable | Valor | Tipo |
|----------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iaolmlfrzjaafmklkoju.supabase.co` | Plain text |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (ver §9 — es la clave pública anon, no un secreto) | Plain text |
| `ADMIN_PASSWORD` | la contraseña que elijas para el panel admin | **Secret** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role | **Secret** |

Después de agregar o modificar variables → **Redeploy** desde Deployments para que el build las tome.

### ✅ Completado (sesiones anteriores)
- Arquitectura y árbol de archivos completo
- Supabase `iaolmlfrzjaafmklkoju` restaurado, migración `001_initial_schema_dsf` aplicada
- Tablas: `contact_submissions`, `donation_interests`, `quotation_requests`, `services` con RLS
- Panel admin completo: cotizaciones, mensajes, servicios, respuesta por email (Resend)
- `vercel.json` con framework config y vars `NEXT_PUBLIC_*`
- `middleware.ts` con CSP, HSTS, X-Frame-Options, Permissions-Policy, COOP, CRP
- 0 vulnerabilidades npm (`overrides.postcss ^8.5.10`)
- `centro-monitoreo-deportes/lib/supabase.ts`: clave hardcodeada eliminada → env vars

### 🔶 Pendiente (datos reales del cliente)
Ver §7 — Lista de TODO

---

## 3. Bitácora de Decisiones

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-05-31 | Next.js 15 + Tailwind v3 | `tailwind.config.ts` clásico con tokens de marca. Trade-off: proyecto hermano usa v4. |
| 2026-05-31 | `service_role` solo en server-side | La clave admin nunca llega al cliente. |
| 2026-05-31 | Rate limiting en memoria | Sin dependencia extra. Trade-off conocido: no persiste entre instancias. |
| 2026-05-31 | RLS deny-all por defecto | Las submissions son datos sensibles; anon key no puede leerlas. |
| 2026-05-31 | CSP con `'unsafe-inline'` en styles | Tailwind v3 genera estilos inline. Trade-off documentado. |
| 2026-05-31 | Auth admin: cookie httpOnly HMAC | Elimina dependencia de `createBrowserClient()` que fallaba si `NEXT_PUBLIC_SUPABASE_ANON_KEY` no estaba bakeada en el bundle. Cookie httpOnly no es accesible por JS; HMAC-SHA256 con Web Crypto API funciona en Edge y Node. `ADMIN_PASSWORD` vive solo en Vercel como secreto. |

---

## 4. Mapa de Archivos

```
/ (raíz del repo)
├── CLAUDE.md
├── README.md
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── middleware.ts               ← CSP + protección /admin/* por cookie
├── vercel.json                 ← SIN ADMIN_PASSWORD (se pone en Dashboard)
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       ├── contact/route.ts
│       └── admin/
│           ├── auth/route.ts   ← POST login / DELETE logout (cookie)
│           ├── quotations/route.ts
│           ├── messages/route.ts
│           ├── reply/route.ts
│           └── services/route.ts
│
├── app/admin/
│   ├── layout.tsx              ← Sin Supabase, logout via DELETE /api/admin/auth
│   ├── login/page.tsx          ← Solo campo contraseña
│   ├── cotizaciones/page.tsx
│   ├── mensajes/page.tsx
│   └── servicios/page.tsx
│
├── lib/
│   ├── admin-session.ts        ← HMAC-SHA256, verifyAdminCookie, makeAdminCookie
│   ├── validation.ts
│   ├── sanitize.ts
│   ├── rate-limit.ts
│   ├── resend.ts
│   ├── email-templates.ts
│   └── supabase/
│       ├── server.ts           ← createAdminClient() — solo server-side
│       ├── browser.ts          ← createBrowserClient() — usado por formularios públicos
│       ├── admin-auth.ts       ← (legado, ya no usado en admin)
│       └── types.ts
│
├── config/
│   ├── site.config.ts
│   ├── sections.config.ts
│   ├── content.ts
│   ├── services.config.ts
│   └── theme.ts
│
├── components/
│   ├── layout/  (Navbar, Footer, FloatingContact)
│   ├── sections/ (Hero, About, Programs, etc.)
│   └── ui/ (Button, Card, StatCard, etc.)
│
├── supabase/migrations/
│   └── 001_initial_schema.sql
│
└── centro-monitoreo-deportes/  ← no modificar
```

---

## 5. Convenciones

### Código
- **TypeScript `strict`**: sin `any` explícito
- **Componentes**: PascalCase, una responsabilidad por archivo
- **Comentarios**: solo para decisiones no obvias o workarounds de seguridad

### Diseño
- Color de acción único: `brand-600` (#ea580c)
- Fondos alternan: `white → gray-50 → white`
- Iconos: `lucide-react` exclusivamente
- Imágenes: `next/image` con allowlist explícita

### Seguridad
- Toda cadena de usuario pasa por `sanitizeText()` antes de guardarse
- Toda entrada de API se valida con Zod server-side
- `service_role` key: solo en vars server-side (sin `NEXT_PUBLIC_`)
- `ADMIN_PASSWORD`: solo en Vercel Dashboard como secreto, nunca en el repo
- No `dangerouslySetInnerHTML` sin pasar por `sanitize.ts`
- Links externos: `rel="noopener noreferrer"`

---

## 6. Checklist de Seguridad

| # | Control | Estado | Notas |
|---|---------|--------|-------|
| 6.1 | `.env` no commiteado | ✅ | |
| 6.1 | `ADMIN_PASSWORD` no en repo | ✅ | Solo en Vercel Dashboard como secreto |
| 6.2 | Sin SQL por concatenación | ✅ | Solo cliente Supabase parametrizado |
| 6.2 | RLS activa | ✅ | Deny-all por defecto |
| 6.3 | Rate limiting | ✅ | En memoria; escalar con Redis en producción |
| 6.4 | CSP restrictiva | ✅ | `middleware.ts` |
| 6.4 | HSTS / X-Frame / Permissions-Policy | ✅ | `middleware.ts` |
| 6.5 | Cookie httpOnly + sameSite=strict | ✅ | `lib/admin-session.ts` |
| 6.5 | HMAC-SHA256 no reversible | ✅ | Token de 64 chars hex |
| 6.5 | Brute-force delay en login | ✅ | 400ms de espera en contraseña incorrecta |
| 6.5 | Honeypot en formulario público | ✅ | Campo `website` oculto |
| 6.6 | Sin `dangerouslySetInnerHTML` | ✅ | |
| 6.7 | `npm audit` limpio | ✅ | 0 vulnerabilidades |

---

## 7. Datos Pendientes (TODO reales del cliente)

| ID | Dato | Ubicación |
|----|------|-----------|
| TODO-01 a 05 | Estadísticas (atletas, países, municipios, años, recaudado) | `config/content.ts` → `stats.*` |
| TODO-06 a 08 | Misión, visión, método | `config/content.ts` → `about.*` |
| TODO-09 a 11 | Descripciones de fases del programa | `config/content.ts` → `programs.phases` |
| TODO-12 | Hitos de trayectoria | `config/content.ts` → `history.milestones` |
| TODO-13 a 14 | Reportes financieros y cifras de transparencia | `config/content.ts` → `transparency.*` |
| TODO-15 a 16 | Montos y beneficios por nivel de donación | `config/content.ts` → `donationLevels` |
| TODO-17 a 18 | Testimonios y logos de aliados | `config/content.ts` → `socialProof.*` |
| TODO-19 a 22 | WhatsApp, redes sociales, imagen hero, logo | `config/site.config.ts` y `public/logo.svg` |
| TODO-23 | Stripe para pagos | `.env` → `STRIPE_SECRET_KEY` |

---

## 8. Variables de Entorno Requeridas

### En Vercel Dashboard → Settings → Environment Variables

| Variable | Tipo | Dónde obtenerla |
|----------|------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain text | `https://iaolmlfrzjaafmklkoju.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain text | Supabase Dashboard → Project Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase Dashboard → Project Settings → API → service_role |
| `ADMIN_PASSWORD` | **Secret** | La contraseña que elijas para `/admin/login` |
| `RESEND_API_KEY` | **Secret** | resend.com → API Keys |
| `FROM_EMAIL` | Plain text | Email verificado en Resend (ej. `noreply@tudominio.com`) |

> **Importante**: después de agregar o cambiar variables → ir a Deployments → Redeploy para que el build las incluya.

---

## 9. Sistema de Autenticación Admin (detalle técnico)

### Cómo funciona
1. Usuario envía contraseña a `POST /api/admin/auth`
2. Se compara con `process.env.ADMIN_PASSWORD` (tiempo constante implícito + delay de 400ms)
3. Si es correcta: se genera token = HMAC-SHA256(`ADMIN_PASSWORD`, mensaje `"dsf_admin_session_v1"`) → hex de 64 chars
4. Se pone cookie `dsf_admin` con ese token: `httpOnly`, `secure`, `sameSite=strict`, `maxAge=7 días`
5. El middleware verifica solo que la cookie exista (presencia) antes de servir páginas admin
6. Cada ruta API llama `verifyAdminCookie(request.cookies)` que recalcula el HMAC y compara
7. `DELETE /api/admin/auth` borra la cookie (logout)

### Archivos clave
- `lib/admin-session.ts` — lógica del token
- `app/api/admin/auth/route.ts` — login / logout
- `middleware.ts` — guarda de rutas (presencia de cookie)

---

## 10. Cómo Retomar

1. Lee este archivo desde §2 (Estado Actual)
2. Si el admin sigue fallando: verificar variables de entorno en §8 y hacer Redeploy
3. Los TODO de contenido están en `config/content.ts` y `config/site.config.ts`
4. Para añadir sección: crear `components/sections/NuevaSección.tsx` + entrada en `config/sections.config.ts`
5. Supabase proyecto activo: `iaolmlfrzjaafmklkoju`

---

*Este archivo es la única fuente de verdad para retomar el proyecto entre sesiones.*
