import { z } from "zod";

// ─── Schemas Zod para validación en build ────────────────────────────────────

const StatSchema = z.object({
  value: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  color: z.enum(["green", "blue", "purple", "orange"]),
});

const MilestoneSchema = z.object({
  year: z.string(),
  title: z.string(),
  description: z.string(),
});

const TestimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  location: z.string().optional(),
});

const PartnerSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
});

const ProgramPhaseSchema = z.object({
  phase: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

const DonationTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  period: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  featured: z.boolean(),
  cta: z.string(),
});

const TransparencyReportSchema = z.object({
  year: z.string(),
  title: z.string(),
  url: z.string().optional(),
});

const ContentSchema = z.object({
  urgentBanner: z.object({
    active: z.boolean(),
    message: z.string(),
    cta: z.string().optional(),
    ctaHref: z.string().optional(),
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    backgroundImage: z.string(),
    cta: z.object({
      primary: z.string(),
      primaryHref: z.string(),
      secondary: z.string(),
      secondaryHref: z.string(),
    }),
  }),
  stats: z.array(StatSchema),
  about: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    mission: z.string(),
    vision: z.string(),
    method: z.string(),
    image: z.string().optional(),
  }),
  programs: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    phases: z.array(ProgramPhaseSchema),
  }),
  history: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    milestones: z.array(MilestoneSchema),
  }),
  transparency: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    adminPercent: z.string(),
    programsPercent: z.string(),
    reports: z.array(TransparencyReportSchema),
  }),
  donationLevels: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
    tiers: z.array(DonationTierSchema),
  }),
  communityCTA: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta: z.string(),
    ctaHref: z.string(),
  }),
  dualCTA: z.object({
    donate: z.object({ headline: z.string(), description: z.string(), cta: z.string() }),
    volunteer: z.object({ headline: z.string(), description: z.string(), cta: z.string() }),
  }),
  socialProof: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    testimonials: z.array(TestimonialSchema),
    partners: z.array(PartnerSchema),
  }),
  contact: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    description: z.string(),
  }),
});

// ─── Contenido del sitio ─────────────────────────────────────────────────────
// Los TODO: son datos reales que debe proveer el cliente (ver CLAUDE.md §7).

const rawContent = {
  urgentBanner: {
    active: true,
    message: "TODO-24: ¡Mensaje de urgencia específico de la campaña actual!",
    cta: "Donar ahora",
    ctaHref: "#donar",
  },

  hero: {
    headline: "El deporte transforma vidas\nsin importar fronteras",
    subheadline:
      "TODO-25: Subheadline definitivo que describa el impacto y la propuesta de valor de la asociación.",
    backgroundImage: "", // TODO-21: URL de imagen hero (Supabase Storage o CDN)
    cta: {
      primary: "Únete ahora",
      primaryHref: "#donar",
      secondary: "Conoce nuestra labor",
      secondaryHref: "#quienes-somos",
    },
  },

  stats: [
    {
      value: "TODO-01",
      label: "Atletas beneficiados",
      sublabel: "desde nuestra fundación",
      color: "green" as const,
    },
    {
      value: "TODO-02",
      label: "Países alcanzados",
      sublabel: "y en expansión",
      color: "blue" as const,
    },
    {
      value: "TODO-03",
      label: "Municipios atendidos",
      sublabel: "en comunidades vulnerables",
      color: "purple" as const,
    },
    {
      value: "TODO-04",
      label: "Años de trayectoria",
      sublabel: "construyendo impacto",
      color: "orange" as const,
    },
  ],

  about: {
    eyebrow: "Quiénes somos",
    headline: "Más que deporte,\nun cambio de vida",
    mission:
      "TODO-06: Texto definitivo de la misión de la Asociación Deportes Sin Fronteras.",
    vision:
      "TODO-07: Texto definitivo de la visión de la Asociación Deportes Sin Fronteras.",
    method:
      "TODO-08: Descripción del método o enfoque pedagógico/social que utiliza la asociación.",
    image: "", // TODO: imagen de la sección Quiénes Somos
  },

  programs: {
    eyebrow: "Nuestros programas",
    headline: "Un proceso integral\nen tres fases",
    description:
      "Cada programa sigue una metodología probada que lleva al atleta desde el descubrimiento hasta el liderazgo comunitario.",
    phases: [
      {
        phase: "Fase 1",
        title: "TODO-09: Nombre de la primera fase",
        description: "TODO-09: Descripción de la primera fase del programa.",
        icon: "Zap",
      },
      {
        phase: "Fase 2",
        title: "TODO-10: Nombre de la segunda fase",
        description: "TODO-10: Descripción de la segunda fase del programa.",
        icon: "Target",
      },
      {
        phase: "Fase 3",
        title: "TODO-11: Nombre de la tercera fase",
        description: "TODO-11: Descripción de la tercera fase del programa.",
        icon: "Users",
      },
    ],
  },

  history: {
    eyebrow: "Nuestra trayectoria",
    headline: "Una historia de\nimpacto sostenido",
    description:
      "Desde nuestra fundación, hemos construido un camino de logros concretos que demuestran el poder del deporte como herramienta de cambio.",
    milestones: [
      // TODO-12: Reemplazar con hitos reales (año, título, descripción)
      { year: "TODO", title: "Fundación de la asociación", description: "TODO-12: Descripción del hito fundacional." },
      { year: "TODO", title: "TODO-12: Segundo hito", description: "TODO-12: Descripción." },
      { year: "TODO", title: "TODO-12: Tercer hito", description: "TODO-12: Descripción." },
      { year: "TODO", title: "TODO-12: Hito más reciente", description: "TODO-12: Descripción." },
    ],
  },

  transparency: {
    eyebrow: "Transparencia",
    headline: "Tu confianza,\nnuestra responsabilidad",
    description:
      "Publicamos nuestros informes financieros porque la confianza de nuestros donantes es la base de todo.",
    adminPercent:    "TODO-14", // ej. "12%"
    programsPercent: "TODO-14", // ej. "88%"
    reports: [
      // TODO-13: Reemplazar con reportes reales
      { year: "TODO", title: "Informe Anual TODO", url: undefined },
      { year: "TODO", title: "Informe Anual TODO", url: undefined },
    ],
  },

  donationLevels: {
    eyebrow: "Formas de apoyar",
    headline: "Elige cómo\nquieres impactar",
    description:
      "Cada nivel de apoyo tiene un impacto directo y medible en la vida de nuestros atletas.",
    tiers: [
      {
        id: "amigo",
        name: "Amigo",
        amount: "TODO-15",
        period: "/ mes",
        description: "Apoya la formación básica de un atleta.",
        benefits: [
          "TODO-16: Beneficio 1",
          "TODO-16: Beneficio 2",
          "TODO-16: Beneficio 3",
        ],
        featured: false,
        cta: "Ser Amigo",
      },
      {
        id: "defensor",
        name: "Defensor",
        amount: "TODO-15",
        period: "/ mes",
        description: "Potencia el desarrollo integral de varios atletas.",
        benefits: [
          "TODO-16: Todo lo de Amigo",
          "TODO-16: Beneficio adicional 1",
          "TODO-16: Beneficio adicional 2",
          "TODO-16: Beneficio adicional 3",
        ],
        featured: true,
        cta: "Ser Defensor",
      },
      {
        id: "campeon",
        name: "Campeón",
        amount: "TODO-15",
        period: "/ mes",
        description: "Financia un programa completo de formación.",
        benefits: [
          "TODO-16: Todo lo de Defensor",
          "TODO-16: Beneficio exclusivo 1",
          "TODO-16: Beneficio exclusivo 2",
        ],
        featured: false,
        cta: "Ser Campeón",
      },
      {
        id: "patron",
        name: "Patrón",
        amount: "TODO-15",
        period: "/ año",
        description: "Impacto institucional máximo. Ideal para empresas.",
        benefits: [
          "TODO-16: Todo lo de Campeón",
          "TODO-16: Reconocimiento institucional",
          "TODO-16: Beneficio corporativo",
          "TODO-16: Reportes de impacto dedicados",
        ],
        featured: false,
        cta: "Ser Patrón",
      },
    ],
  },

  communityCTA: {
    headline: "Juntos somos más fuertes",
    subheadline:
      "Cada acción cuenta. Únete a nuestra comunidad de personas comprometidas con el cambio.",
    cta: "Unirme a la comunidad",
    ctaHref: "#contacto",
  },

  dualCTA: {
    donate: {
      headline: "Haz una donación",
      description:
        "Tu aporte económico llega directamente a los programas. Sin intermediarios innecesarios.",
      cta: "Donar ahora",
    },
    volunteer: {
      headline: "Sé voluntario",
      description:
        "Si tienes tiempo, habilidades o redes, podemos multiplicar el impacto juntos.",
      cta: "Quiero ser voluntario",
    },
  },

  socialProof: {
    eyebrow: "Lo que dicen de nosotros",
    headline: "Voces que\ninspiran",
    testimonials: [
      // TODO-17: Reemplazar con testimonios reales (nombre, cargo, texto, localidad)
      {
        quote: "TODO-17: Testimonio real de un atleta o beneficiario.",
        name: "TODO-17: Nombre",
        role: "TODO-17: Cargo o descripción",
        location: "TODO-17: País o ciudad",
      },
      {
        quote: "TODO-17: Segundo testimonio real.",
        name: "TODO-17: Nombre",
        role: "TODO-17: Cargo o descripción",
        location: "TODO-17: País o ciudad",
      },
      {
        quote: "TODO-17: Tercer testimonio real.",
        name: "TODO-17: Nombre",
        role: "TODO-17: Cargo o descripción",
        location: "TODO-17: País o ciudad",
      },
    ],
    partners: [
      // TODO-18: Logos y nombres de aliados reales
      { name: "TODO-18: Aliado 1", logo: undefined },
      { name: "TODO-18: Aliado 2", logo: undefined },
      { name: "TODO-18: Aliado 3", logo: undefined },
      { name: "TODO-18: Aliado 4", logo: undefined },
    ],
  },

  contact: {
    eyebrow: "Contacto",
    headline: "Estamos aquí\npara ayudarte",
    description:
      "¿Tienes preguntas sobre nuestros programas, donaciones o alianzas? Escríbenos.",
  },
};

// Validación en build — lanza error si el esquema no coincide
export const siteContent = ContentSchema.parse(rawContent);

// Tipos derivados del schema
export type SiteContent = z.infer<typeof ContentSchema>;
export type DonationTier = z.infer<typeof DonationTierSchema>;
export type ProgramPhase = z.infer<typeof ProgramPhaseSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type Stat = z.infer<typeof StatSchema>;
