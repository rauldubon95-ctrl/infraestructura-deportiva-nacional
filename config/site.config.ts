export const siteConfig = {
  name: "Asociación Deportes Sin Fronteras",
  shortName: "DSF",
  tagline: "El deporte como herramienta de transformación social", // TODO-25: confirmar tagline definitivo
  description:
    "Organización deportiva y social sin fines de lucro comprometida con el desarrollo humano a través del deporte.", // TODO-25: descripción SEO definitiva
  url: "https://deportesinfronteras.org", // TODO: URL real del dominio

  contact: {
    email: "info@deportesinfronteras.org",   // TODO: correo oficial
    whatsapp: "+502 0000-0000",               // TODO-19: número real de WhatsApp
    whatsappLink: "https://wa.me/50200000000", // TODO-19: enlace real
  },

  social: {
    facebook:  "https://facebook.com/deportesinfronteras",   // TODO-20: handle real
    instagram: "https://instagram.com/deportesinfronteras",  // TODO-20: handle real
    twitter:   "",                                            // TODO-20: si aplica
    youtube:   "",                                            // TODO-20: si aplica
    tiktok:    "",                                            // TODO-20: si aplica
  },

  // Analítica sin cookies — configurar cuando esté disponible
  analytics: {
    plausibleDomain: "",  // TODO: dominio en Plausible/Umami
  },

  // Información legal y de transparencia
  legal: {
    registroLegal: "",   // TODO: número de registro legal de la asociación
    nit: "",             // TODO: NIT / RUC si aplica
  },
} as const;

export type SiteConfig = typeof siteConfig;
