# CLAUDE.md — Registro Vivo del Proyecto
**Asociación Deportes Sin Fronteras** · Sitio Institucional  
Última actualización: 2026-05-31

---

## 1. Resumen del Proyecto

Sitio web institucional de una sola página para la **Asociación Deportes Sin Fronteras**,
organización deportiva/social sin fines de lucro.

| Aspecto | Detalle |
|---------|---------|
| Tipo | Landing institucional SPA (scroll) |
| Idioma | Español (`lang="es"`) |
| Color de marca | `#ea580c` (naranja) |
| Frontend | Next.js 15 · App Router · TypeScript `strict` · Tailwind CSS v3 |
| Deploy | Vercel |
| Backend / datos | Supabase (Postgres + RLS + Edge Functions) |
| Autenticación | Supabase Auth (reservado para panel admin futuro) |

**Repo también contiene:** `centro-monitoreo-deportes/` — proyecto existente de monitoreo
deportivo con mapa interactivo. **Rescatado y no modificado.**  
⚠️  Nota de seguridad pendiente en ese proyecto: `centro-monitoreo-deportes/lib/supabase.ts`
tiene la clave `anon` hardcodeada en lugar de env var. Migrar cuando sea oportuno.

---

## 2. Estado Actual

### ✅ Completado (sesión inicial 2026-05-31)
- Arquitectura y árbol de archivos completo
- `CLAUDE.md` inicializado
- `.gitignore`, `.env.example` (sin valores reales)
- `package.json`, `tsconfig.json` (TypeScript strict)
- `tailwind.config.ts` con tokens de marca
- `postcss.config.mjs`
- `next.config.ts` (poweredByHeader: false, allowlist de imágenes vacía)
- `middleware.ts` con todas las cabeceras de seguridad (CSP, HSTS, COOP, etc.)
- `config/site.config.ts` — metadatos del sitio
- `config/theme.ts` — paleta derivada de #ea580c
- `config/content.ts` — TODOS los textos tipados con Zod (placeholders TODO)
- `config/sections.config.ts` — registro de secciones activas
- `lib/validation.ts` — esquemas Zod (contacto, donación)
- `lib/sanitize.ts` — saneamiento de entrada
- `lib/rate-limit.ts` — control de tasa por IP (en memoria; ver §3 trade-offs)
- `lib/supabase/server.ts` — cliente admin server-side (service_role)
- `lib/supabase/browser.ts` — cliente público browser (anon key)
- `lib/supabase/types.ts` — tipos generados de la DB
- Todos los componentes UI (`Button`, `Card`, `StatCard`, `SectionHeader`, `DonationCard`, `ActivityCard`)
- Todos los componentes de layout (`Navbar`, `Footer`, `FloatingContact`)
- Todas las secciones (`UrgentBanner`, `Hero`, `ImpactStats`, `About`, `Programs`,
  `History`, `Transparency`, `DonationLevels`, `CommunityCTA`, `DualCTA`, `SocialProof`)
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- `app/api/contact/route.ts` — manejo server-side del formulario
- `supabase/migrations/001_initial_schema.sql` — tablas + RLS
- `supabase/functions/contact-notify/index.ts` — Edge Function notificación
- `README.md` actualizado

### 🔶 Pendiente (datos reales del cliente)
Ver §7 — Lista de TODO

### 🔲 Próximas tareas técnicas
- Instalar dependencias (`npm install` dentro de la carpeta raíz del sitio)
- Configurar variables de entorno en Vercel
- Aplicar migración SQL en Supabase
- Configurar proveedor de pagos (Stripe) cuando esté disponible
- Añadir Dependabot al repo
- Conectar analítica sin cookies (Plausible / Umami)
- CAPTCHA (Cloudflare Turnstile) en formulario de contacto cuando se active

---

## 3. Bitácora de Decisiones

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-05-31 | Next.js 15 + Tailwind v3 (no v4) | El mega-prompt requiere `tailwind.config.ts` clásico con tokens; Tailwind v4 usa `@theme` CSS. Se elige v3 para máxima claridad en tokens de diseño. Trade-off: el proyecto hermano usa v4. |
| 2026-05-31 | `service_role` en route handlers, no en cliente | La clave admin solo existe en vars de entorno server-side (sin `NEXT_PUBLIC_`). El cliente nunca la ve. |
| 2026-05-31 | Rate limiting en memoria (no Redis) | Sin dependencia extra. Trade-off conocido: no persiste entre instancias serverless. Para volumen bajo de un formulario de contacto, es aceptable. Documentar en README para upgrade futuro. |
| 2026-05-31 | RLS: deny-all por defecto, solo service_role puede leer submissions | Las submissions de formulario son datos sensibles. El anon key no puede leerlas. |
| 2026-05-31 | Secciones importan content.ts directamente | Más limpio que pasar todo como props en sections.config. El registry solo registra orden y activación. |
| 2026-05-31 | Sin proveedor de pagos activo | La regla §6.5 prohíbe formularios de tarjeta propios. El botón "Donar" está presente pero deshabilitado con TODO visible hasta tener Stripe configurado. |
| 2026-05-31 | CSP con `'unsafe-inline'` en styles | Tailwind v3 genera clases en runtime en dev; en producción todo es inline via `<style>` de Next.js. Trade-off de seguridad documentado. |
| 2026-05-31 | `poweredByHeader: false` | Elimina `X-Powered-By: Next.js` para reducir información de fingerprinting. |

---

## 4. Mapa de Archivos

```
/ (raíz del repo)
├── CLAUDE.md                   ← este archivo
├── README.md                   ← instrucciones de instalación y seguridad
├── .gitignore                  ← cubre ambos proyectos del repo
├── .env.example                ← plantilla SIN valores reales
├── package.json                ← dependencias del sitio DSF
├── tsconfig.json               ← TypeScript strict
├── tailwind.config.ts          ← tokens de diseño (#ea580c y escala)
├── postcss.config.mjs          ← tailwind + autoprefixer
├── next.config.ts              ← Next.js config (no poweredByHeader, allowlist imgs)
├── middleware.ts               ← CSP, HSTS, X-Frame-Options, etc.
│
├── app/
│   ├── globals.css             ← reset + variables CSS
│   ├── layout.tsx              ← RootLayout: Inter font, Navbar, Footer, FAB
│   ├── page.tsx                ← orquestador: itera activeSections
│   └── api/
│       └── contact/
│           └── route.ts        ← POST: valida, rate-limit, honeypot, guarda en Supabase
│
├── config/
│   ├── site.config.ts          ← nombre, tagline, URL, redes, analítica
│   ├── sections.config.ts      ← registro ordenado de secciones activas
│   ├── content.ts              ← TODOS los textos/cifras (Zod-tipados, TODO donde faltan)
│   └── theme.ts                ← paleta de colores derivada de la marca
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          ← fixed, logo, nav links, CTA donar, hamburger
│   │   ├── Footer.tsx          ← gray-900, links, redes, legal
│   │   └── FloatingContact.tsx ← FAB WhatsApp/contacto (bottom-right)
│   ├── sections/
│   │   ├── UrgentBanner.tsx    ← franja naranja urgente (dismissible)
│   │   ├── Hero.tsx            ← h-screen, overlay, headline, 2 CTAs
│   │   ├── ImpactStats.tsx     ← grid de métricas (TODO cifras reales)
│   │   ├── About.tsx           ← misión/visión/método (TODO textos)
│   │   ├── Programs.tsx        ← 3 fases como cards
│   │   ├── History.tsx         ← línea de tiempo (TODO hitos)
│   │   ├── Transparency.tsx    ← reportes financieros (TODO datos)
│   │   ├── DonationLevels.tsx  ← 4 niveles de apoyo (TODO precios/beneficios)
│   │   ├── CommunityCTA.tsx    ← CTA naranja con gradiente
│   │   ├── DualCTA.tsx         ← CTA doble: donar + voluntariado
│   │   └── SocialProof.tsx     ← testimonios + logos aliados (TODO)
│   └── ui/
│       ├── Button.tsx          ← variant: primary | outline | ghost
│       ├── Card.tsx            ← base card con hover shadow
│       ├── StatCard.tsx        ← número grande + label + icono
│       ├── SectionHeader.tsx   ← eyebrow + h2 + descripción
│       ├── DonationCard.tsx    ← tier de donación con badge "Popular"
│       └── ActivityCard.tsx    ← card de actividad/programa
│
├── lib/
│   ├── validation.ts           ← Zod: ContactSchema, DonationInterestSchema
│   ├── sanitize.ts             ← strip HTML tags, limit length
│   ├── rate-limit.ts           ← sliding window por IP (en memoria)
│   └── supabase/
│       ├── server.ts           ← createAdminClient() — solo server-side
│       ├── browser.ts          ← createBrowserClient() — anon key
│       └── types.ts            ← Database type (actualizar con supabase gen types)
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  ← contact_submissions + donation_interests + RLS
│   └── functions/
│       └── contact-notify/
│           └── index.ts            ← Edge Function: notificación por email al admin
│
└── centro-monitoreo-deportes/  ← proyecto existente RESCATADO (no modificar)
    └── ...
```

---

## 5. Convenciones

### Código
- **TypeScript `strict`**: sin `any` explícito salvo en type-erasure justificado
- **Componentes**: PascalCase, una responsabilidad por archivo
- **Funciones/vars**: camelCase
- **Constantes de config**: camelCase con tipo explícito
- **Comentarios**: solo para decisiones no obvias o workarounds de seguridad

### Diseño
- Color de acción único: `brand-600` (#ea580c) — **solo** para CTAs principales
- Fondos alternan: `white → gray-50 → white` por sección
- Iconos: `lucide-react` exclusivamente
- Imágenes: `next/image` con allowlist explícita; `alt` siempre significativo
- Transiciones: `transition-shadow duration-200` / `transition-all duration-300`
- Reducción de movimiento: `motion-safe:` prefix en animaciones

### Seguridad
- Toda cadena de usuario pasa por `sanitizeText()` antes de guardarse
- Toda entrada de API se valida con Zod server-side
- `service_role` key: solo en vars server-side (sin `NEXT_PUBLIC_`)
- No `dangerouslySetInnerHTML` sin pasar por `sanitize.ts`
- Links externos: `rel="noopener noreferrer"` siempre

---

## 6. Checklist de Seguridad

| # | Control | Estado | Notas |
|---|---------|--------|-------|
| 6.1 | `.env` no commiteado | ✅ | `.gitignore` cubre todos los `.env.*` |
| 6.1 | Solo `.env.example` en repo | ✅ | Sin valores reales |
| 6.1 | `node_modules` / `.next` en `.gitignore` | ✅ | Cubre raíz y subfolder |
| 6.2 | Sin SQL por concatenación | ✅ | Solo cliente Supabase parametrizado |
| 6.2 | RLS activa en todas las tablas | ✅ | Deny-all por defecto en migración |
| 6.3 | Rate limiting en endpoints | ✅ | `lib/rate-limit.ts` (en memoria; escalar con Upstash/Redis en producción) |
| 6.3 | Hook CAPTCHA listo | 🔶 | Comentario en formulario; activar Turnstile cuando se configure |
| 6.4 | CSP restrictiva | ✅ | `middleware.ts`; `connect-src` solo a Supabase |
| 6.4 | HSTS (max-age=2 años) | ✅ | `middleware.ts` |
| 6.4 | X-Frame-Options DENY | ✅ | `middleware.ts` |
| 6.4 | Permissions-Policy (cam/mic/geo off) | ✅ | `middleware.ts` |
| 6.4 | X-Content-Type-Options nosniff | ✅ | `middleware.ts` |
| 6.4 | Referrer-Policy strict | ✅ | `middleware.ts` |
| 6.5 | Sin datos de tarjeta en la app | ✅ | Botón TODO deshabilitado; redirect a Stripe cuando esté config. |
| 6.5 | Honeypot en formulario | ✅ | Campo `website` oculto verificado server-side |
| 6.5 | Validación server-side con Zod | ✅ | `app/api/contact/route.ts` |
| 6.5 | CSRF: route handler Next.js | ✅ | Same-origin enforced por Next.js route handlers |
| 6.6 | Sin `dangerouslySetInnerHTML` | ✅ | No usado en esta versión |
| 6.6 | Links externos con `noopener noreferrer` | ✅ | En todos los componentes |
| 6.7 | `npm audit` limpio | 🔶 | Ejecutar tras `npm install` |
| 6.7 | Lockfile commiteado | 🔶 | Ejecutar `npm install` y commitear `package-lock.json` |
| 6.7 | Analítica sin cookies | 🔶 | Plausible/Umami pendiente de configurar |

**Fuera del alcance de este código** (documentado, no ignorado):
- DDoS de capa de red → mitigar en hosting (Vercel Shield / Cloudflare)
- WAF / Bot protection → Cloudflare o Vercel Advanced
- Seguridad física del servidor → responsabilidad de Vercel/Supabase

---

## 7. Datos Pendientes (TODO reales)

El cliente debe proveer los siguientes datos antes de hacer deploy productivo:

| ID | Dato | Ubicación en código |
|----|------|---------------------|
| TODO-01 | Número de atletas beneficiados | `config/content.ts` → `stats.athletes` |
| TODO-02 | Número de países alcanzados | `config/content.ts` → `stats.countries` |
| TODO-03 | Número de municipios atendidos | `config/content.ts` → `stats.municipalities` |
| TODO-04 | Años de trayectoria | `config/content.ts` → `stats.years` |
| TODO-05 | Total recaudado/gestionado | `config/content.ts` → `stats.raised` |
| TODO-06 | Texto de misión | `config/content.ts` → `about.mission` |
| TODO-07 | Texto de visión | `config/content.ts` → `about.vision` |
| TODO-08 | Descripción del método/enfoque | `config/content.ts` → `about.method` |
| TODO-09 | Descripción Fase 1 (Programa) | `config/content.ts` → `programs.phases[0]` |
| TODO-10 | Descripción Fase 2 (Programa) | `config/content.ts` → `programs.phases[1]` |
| TODO-11 | Descripción Fase 3 (Programa) | `config/content.ts` → `programs.phases[2]` |
| TODO-12 | Hitos de la trayectoria (fechas + descripciones) | `config/content.ts` → `history.milestones` |
| TODO-13 | Reportes financieros (links/PDFs) | `config/content.ts` → `transparency.reports` |
| TODO-14 | Cifras de transparencia (% admin, % programas) | `config/content.ts` → `transparency.metrics` |
| TODO-15 | Precios/montos por nivel de donación | `config/content.ts` → `donationLevels` |
| TODO-16 | Beneficios por nivel de donación | `config/content.ts` → `donationLevels[*].benefits` |
| TODO-17 | Testimonios (nombre, cargo, texto) | `config/content.ts` → `socialProof.testimonials` |
| TODO-18 | Logos de aliados/socios | `config/content.ts` → `socialProof.partners` |
| TODO-19 | Número de WhatsApp | `config/site.config.ts` → `contact.whatsapp` |
| TODO-20 | Handles de redes sociales | `config/site.config.ts` → `social.*` |
| TODO-21 | URL de imagen del Hero | `config/content.ts` → `hero.backgroundImage` |
| TODO-22 | Logo oficial (SVG/PNG) | `public/logo.svg` (reemplazar placeholder) |
| TODO-23 | Configuración proveedor de pagos (Stripe) | `.env` → `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| TODO-24 | Mensaje urgente del banner | `config/content.ts` → `urgentBanner.message` |
| TODO-25 | Texto definitivo tagline / subheadline hero | `config/content.ts` → `hero.*` |

---

## 8. Cómo Retomar

1. Lee este archivo desde la sección "Estado Actual"
2. Revisa la checklist de seguridad (§6) para ver qué falta
3. Los TODO activos están en `config/content.ts` y `config/site.config.ts`
4. Para añadir una sección: crear `components/sections/NuevaSección.tsx` + agregar entrada en `config/sections.config.ts`
5. Para deploy: `cd <raíz>`, `npm install`, configurar vars de entorno en Vercel, aplicar migración en Supabase

---

*Este archivo es la única fuente de verdad para retomar el proyecto entre sesiones.*
