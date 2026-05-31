// Paleta derivada de #ea580c (brand-600)
// Referencia de uso: solo brand-600 como acento de acción dominante.
// Verde/azul/púrpura SOLO para cards de métricas. Máx. 2 acentos por sección.

export const theme = {
  colors: {
    brand: {
      primary: "#ea580c",  // brand-600 — CTA, botones de acción
      light:   "#fed7aa",  // brand-200 — fondos sutiles de acento
      dark:    "#9a3412",  // brand-800 — texto sobre fondos claros de acento
    },
    metrics: {
      green:  { bg: "#dcfce7", text: "#166534", accent: "#16a34a" },
      blue:   { bg: "#dbeafe", text: "#1e40af", accent: "#2563eb" },
      purple: { bg: "#f3e8ff", text: "#6b21a8", accent: "#9333ea" },
      orange: { bg: "#ffedd5", text: "#9a3412", accent: "#ea580c" },
    },
    neutral: {
      50:  "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  sections: {
    // Patrón de fondos alternados por sección
    backgrounds: ["bg-white", "bg-gray-50", "bg-white", "bg-gray-50"],
  },
  spacing: {
    sectionY: "py-20",
    sectionYSm: "py-12",
    container: "container mx-auto px-4",
    gap: "gap-8",
  },
  radius: {
    card: "rounded-xl",
    button: "rounded-lg",
    tag: "rounded-full",
  },
} as const;
