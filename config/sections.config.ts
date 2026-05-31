import type { ComponentType } from "react";

// Secciones
import UrgentBanner   from "@/components/sections/UrgentBanner";
import Hero           from "@/components/sections/Hero";
import ImpactStats    from "@/components/sections/ImpactStats";
import About          from "@/components/sections/About";
import Programs       from "@/components/sections/Programs";
import History        from "@/components/sections/History";
import Transparency   from "@/components/sections/Transparency";
import DonationLevels from "@/components/sections/DonationLevels";
import CommunityCTA   from "@/components/sections/CommunityCTA";
import DualCTA        from "@/components/sections/DualCTA";
import SocialProof    from "@/components/sections/SocialProof";
import Contact        from "@/components/sections/Contact";

// Erasure de tipo en el registro — cada componente está tipado individualmente.
// El registry solo necesita saber que son componentes React sin props requeridas.
export interface SectionEntry {
  key: string;
  Component: ComponentType<Record<string, unknown>>;
  active: boolean;
}

// Registro ordenado de secciones.
// Para AGREGAR una sección: crear componente + añadir entrada aquí.
// Para OCULTAR una sección: cambiar active a false (no eliminar).
export const sections: SectionEntry[] = [
  { key: "urgent-banner",   Component: UrgentBanner,   active: true  },
  { key: "hero",            Component: Hero,            active: true  },
  { key: "impact-stats",    Component: ImpactStats,     active: true  },
  { key: "about",           Component: About,           active: true  },
  { key: "programs",        Component: Programs,        active: true  },
  { key: "history",         Component: History,         active: true  },
  { key: "transparency",    Component: Transparency,    active: true  },
  { key: "donation-levels", Component: DonationLevels,  active: true  },
  { key: "community-cta",   Component: CommunityCTA,    active: true  },
  { key: "dual-cta",        Component: DualCTA,         active: true  },
  { key: "social-proof",    Component: SocialProof,     active: true  },
  { key: "contact",         Component: Contact,         active: true  },
];

export const activeSections = sections.filter((s) => s.active);
