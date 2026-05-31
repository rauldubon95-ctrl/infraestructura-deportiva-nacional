export type ServiceCategory =
  | 'formulacion'
  | 'monitoreo'
  | 'datos'
  | 'investigacion'
  | 'instrumentos';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  iconName: string;
  featured?: boolean;
}

export interface CategoryMeta {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  badgeText: string;
}

export const categoryMeta: Record<ServiceCategory, CategoryMeta> = {
  formulacion: {
    label: 'Formulación y Planificación',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
  },
  monitoreo: {
    label: 'Monitoreo y Evaluación',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
  },
  datos: {
    label: 'Datos y Tecnología',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-700',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
  },
  investigacion: {
    label: 'Investigación Social',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
  },
  instrumentos: {
    label: 'Instrumentos e Informes',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-700',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
  },
};

export const servicesList: ServiceItem[] = [
  // ── Formulación y Planificación ──────────────────────────────────────────
  {
    id: 'formulacion-proyectos',
    name: 'Formulación de Proyectos',
    description:
      'Diseño integral de proyectos sociales e institucionales: presupuestos, cronogramas y estrategias de financiamiento alineados con estándares de cooperación internacional.',
    category: 'formulacion',
    iconName: 'FilePlus2',
    featured: true,
  },
  {
    id: 'teoria-cambio',
    name: 'Teoría del Cambio',
    description:
      'Modelamiento de la cadena causal de un proyecto desde insumos hasta impactos de largo plazo. Mapa lógico que evidencia las hipótesis de transformación social.',
    category: 'formulacion',
    iconName: 'GitBranch',
  },
  {
    id: 'marco-logico',
    name: 'Marco Lógico',
    description:
      'Elaboración de Matrices de Marco Lógico (MML) para cooperación internacional: objetivos, indicadores verificables, medios de verificación y supuestos.',
    category: 'formulacion',
    iconName: 'LayoutGrid',
  },
  // ── Monitoreo y Evaluación ───────────────────────────────────────────────
  {
    id: 'monitoreo-evaluacion',
    name: 'Monitoreo y Evaluación',
    description:
      'Sistemas de seguimiento programático: evaluaciones de proceso, resultado e impacto para la rendición de cuentas ante financiadores y organismos cooperantes.',
    category: 'monitoreo',
    iconName: 'Activity',
    featured: true,
  },
  {
    id: 'diseno-indicadores',
    name: 'Diseño de Indicadores',
    description:
      'Construcción de indicadores SMART cuantitativos y cualitativos alineados con marcos de resultados de organismos de cooperación nacional e internacional.',
    category: 'monitoreo',
    iconName: 'Target',
  },
  {
    id: 'sistematizacion',
    name: 'Sistematización de Procesos',
    description:
      'Documentación reflexiva de experiencias institucionales para la generación de conocimiento organizacional, transferencia de buenas prácticas y mejora continua.',
    category: 'monitoreo',
    iconName: 'ClipboardList',
  },
  {
    id: 'diseno-sistemas-monitoreo',
    name: 'Diseño de Sistemas de Monitoreo',
    description:
      'Arquitectura completa de sistemas de información para seguimiento programático: flujos de datos, formularios, responsables y periodicidad de reporte.',
    category: 'monitoreo',
    iconName: 'MonitorCheck',
  },
  {
    id: 'evaluacion-institucional',
    name: 'Evaluación Institucional',
    description:
      'Diagnóstico organizacional integral: capacidades, procesos, estructura y cultura institucional con propuestas de mejora y hoja de ruta estratégica.',
    category: 'monitoreo',
    iconName: 'Building2',
  },
  // ── Datos y Tecnología ───────────────────────────────────────────────────
  {
    id: 'dashboards',
    name: 'Elaboración de Dashboards',
    description:
      'Paneles interactivos de visualización de datos para la toma de decisiones. Integración de múltiples fuentes con actualización en tiempo real.',
    category: 'datos',
    iconName: 'LayoutDashboard',
    featured: true,
  },
  {
    id: 'power-bi',
    name: 'Power BI',
    description:
      'Desarrollo de reportes analíticos y dashboards empresariales con Microsoft Power BI: modelado de datos, DAX y distribución de informes a usuarios finales.',
    category: 'datos',
    iconName: 'BarChart2',
  },
  {
    id: 'looker-studio',
    name: 'Looker Studio',
    description:
      'Creación de tableros dinámicos con Google Looker Studio conectados a Analytics, Sheets, BigQuery y múltiples fuentes de datos en tiempo real.',
    category: 'datos',
    iconName: 'PieChart',
  },
  {
    id: 'analisis-estadistico',
    name: 'Análisis Estadístico',
    description:
      'Procesamiento estadístico con SPSS, R o Python: análisis descriptivos, inferenciales, regresiones, pruebas de hipótesis y modelos multivariados.',
    category: 'datos',
    iconName: 'TrendingUp',
  },
  {
    id: 'depuracion-bases',
    name: 'Depuración de Bases de Datos',
    description:
      'Limpieza, normalización y validación de bases de datos. Detección y corrección de inconsistencias, duplicados, errores de captura y valores atípicos.',
    category: 'datos',
    iconName: 'DatabaseZap',
  },
  {
    id: 'automatizacion-datos',
    name: 'Automatización de Datos',
    description:
      'Flujos de trabajo automatizados para recopilación, transformación y distribución de datos. Reducción del error humano y optimización del ciclo analítico.',
    category: 'datos',
    iconName: 'Zap',
  },
  {
    id: 'visualizacion-datos',
    name: 'Visualización de Datos',
    description:
      'Diseño de gráficos, infografías y representaciones visuales profesionales para comunicar hallazgos de investigación y datos institucionales.',
    category: 'datos',
    iconName: 'LineChart',
  },
  {
    id: 'supabase-postgresql',
    name: 'Integración Supabase / PostgreSQL',
    description:
      'Diseño e implementación de bases de datos relacionales con Supabase y PostgreSQL: APIs, Row Level Security, funciones y triggers para aplicaciones modernas.',
    category: 'datos',
    iconName: 'Database',
  },
  {
    id: 'sistemas-reportes',
    name: 'Sistemas de Reportes',
    description:
      'Desarrollo de plataformas de reportería automatizada. Generación programática de informes en PDF, Excel y formatos personalizados para organizaciones.',
    category: 'datos',
    iconName: 'FileBarChart',
  },
  // ── Investigación Social ─────────────────────────────────────────────────
  {
    id: 'investigacion-social',
    name: 'Investigación Social',
    description:
      'Estudios cualitativos, cuantitativos y mixtos sobre fenómenos sociales: diseño metodológico, trabajo de campo, análisis de datos e informes finales.',
    category: 'investigacion',
    iconName: 'Search',
    featured: true,
  },
  {
    id: 'articulos-academicos',
    name: 'Artículos Académicos',
    description:
      'Redacción y estructuración de artículos científicos bajo estándares APA, Vancouver e IMRAD. Apoyo para envío y publicación en revistas indexadas.',
    category: 'investigacion',
    iconName: 'BookOpen',
  },
  {
    id: 'apoyo-tesis',
    name: 'Apoyo Metodológico para Tesis',
    description:
      'Asesoría en diseño metodológico, planteamiento del problema, marco teórico, análisis de datos y defensa de tesis de grado y posgrado.',
    category: 'investigacion',
    iconName: 'GraduationCap',
  },
  {
    id: 'analisis-sociologico',
    name: 'Análisis Sociológico',
    description:
      'Interpretación de fenómenos sociales desde marcos teóricos contemporáneos. Análisis de estructuras, relaciones de poder, movimientos sociales y cambio social.',
    category: 'investigacion',
    iconName: 'Users',
  },
  // ── Instrumentos e Informes ──────────────────────────────────────────────
  {
    id: 'construccion-instrumentos',
    name: 'Construcción de Instrumentos',
    description:
      'Diseño de encuestas, cuestionarios, guías de entrevista y escalas de medición con validación de contenido y confiabilidad para investigación aplicada.',
    category: 'instrumentos',
    iconName: 'PenTool',
  },
  {
    id: 'informes-tecnicos',
    name: 'Informes Técnicos',
    description:
      'Redacción de informes de avance, finales y ejecutivos para financiadores, juntas directivas y organismos reguladores. Síntesis ejecutiva y recomendaciones.',
    category: 'instrumentos',
    iconName: 'FileCheck',
  },
];

export const CATEGORIES_ORDER: ServiceCategory[] = [
  'formulacion',
  'monitoreo',
  'datos',
  'investigacion',
  'instrumentos',
];
