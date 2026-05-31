-- ─────────────────────────────────────────────────────────────────────────────
-- 002_services_quotations.sql
-- Tablas: services · quotation_requests
-- Bucket de Storage: quotation-attachments
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Tabla services ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL   CHECK (char_length(name) BETWEEN 3 AND 120),
  description TEXT        NOT NULL   CHECK (char_length(description) BETWEEN 10 AND 600),
  category    TEXT        NOT NULL   CHECK (category IN (
                            'formulacion','monitoreo','datos','investigacion','instrumentos'
                          )),
  icon_name   TEXT        NOT NULL   DEFAULT 'FileText',
  featured    BOOLEAN     NOT NULL   DEFAULT false,
  active      BOOLEAN     NOT NULL   DEFAULT true,
  sort_order  INTEGER     NOT NULL   DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_category   ON public.services (category);
CREATE INDEX IF NOT EXISTS idx_services_active      ON public.services (active);
CREATE INDEX IF NOT EXISTS idx_services_sort_order  ON public.services (sort_order);

-- ── 2. Tabla quotation_requests ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_requests (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  email         TEXT        NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  organization  TEXT                 CHECK (char_length(organization) <= 200),
  service_slug  TEXT        NOT NULL,
  service_name  TEXT        NOT NULL,
  description   TEXT        NOT NULL CHECK (char_length(description) BETWEEN 20 AND 5000),
  budget        TEXT                 CHECK (char_length(budget) <= 100),
  file_path     TEXT,
  file_name     TEXT,
  ip_hash       TEXT,
  reviewed      BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_email      ON public.quotation_requests (email);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON public.quotation_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_service    ON public.quotation_requests (service_slug);
CREATE INDEX IF NOT EXISTS idx_quotations_reviewed   ON public.quotation_requests (reviewed);

-- ── 3. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE public.services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_requests  ENABLE ROW LEVEL SECURITY;

-- services: lectura pública de servicios activos
CREATE POLICY "services_select_active" ON public.services
  FOR SELECT USING (active = true);

-- services: solo service_role puede escribir
CREATE POLICY "services_all_service_role" ON public.services
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- quotation_requests: cualquiera puede INSERT
CREATE POLICY "quotations_insert_public" ON public.quotation_requests
  FOR INSERT WITH CHECK (true);

-- quotation_requests: solo service_role puede leer / actualizar
CREATE POLICY "quotations_select_service_role" ON public.quotation_requests
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "quotations_update_service_role" ON public.quotation_requests
  FOR UPDATE USING (auth.role() = 'service_role');

-- ── 4. Semilla de servicios (23 servicios) ────────────────────────────────────
INSERT INTO public.services (slug, name, description, category, icon_name, featured, sort_order) VALUES
  -- Formulación y Planificación
  ('formulacion-proyectos',   'Formulación de Proyectos',         'Diseño integral de proyectos sociales e institucionales: presupuestos, cronogramas y estrategias de financiamiento alineados con estándares de cooperación internacional.',       'formulacion',   'FilePlus2',      true,  10),
  ('teoria-cambio',           'Teoría del Cambio',                'Modelamiento de la cadena causal de un proyecto desde insumos hasta impactos de largo plazo. Mapa lógico que evidencia las hipótesis de transformación social.',                      'formulacion',   'GitBranch',      false, 20),
  ('marco-logico',            'Marco Lógico',                     'Elaboración de Matrices de Marco Lógico (MML) para cooperación internacional: objetivos, indicadores verificables, medios de verificación y supuestos.',                             'formulacion',   'LayoutGrid',     false, 30),
  -- Monitoreo y Evaluación
  ('monitoreo-evaluacion',    'Monitoreo y Evaluación',           'Sistemas de seguimiento programático: evaluaciones de proceso, resultado e impacto para la rendición de cuentas ante financiadores y organismos cooperantes.',                       'monitoreo',     'Activity',       true,  40),
  ('diseno-indicadores',      'Diseño de Indicadores',            'Construcción de indicadores SMART cuantitativos y cualitativos alineados con marcos de resultados de organismos de cooperación nacional e internacional.',                          'monitoreo',     'Target',         false, 50),
  ('sistematizacion',         'Sistematización de Procesos',      'Documentación reflexiva de experiencias institucionales para la generación de conocimiento organizacional, transferencia de buenas prácticas y mejora continua.',                    'monitoreo',     'ClipboardList',  false, 60),
  ('diseno-sistemas-monitoreo','Diseño de Sistemas de Monitoreo', 'Arquitectura completa de sistemas de información para seguimiento programático: flujos de datos, formularios, responsables y periodicidad de reporte.',                             'monitoreo',     'MonitorCheck',   false, 70),
  ('evaluacion-institucional','Evaluación Institucional',         'Diagnóstico organizacional integral: capacidades, procesos, estructura y cultura institucional con propuestas de mejora y hoja de ruta estratégica.',                               'monitoreo',     'Building2',      false, 80),
  -- Datos y Tecnología
  ('dashboards',              'Elaboración de Dashboards',        'Paneles interactivos de visualización de datos para la toma de decisiones. Integración de múltiples fuentes con actualización en tiempo real.',                                     'datos',         'LayoutDashboard',true,  90),
  ('power-bi',                'Power BI',                         'Desarrollo de reportes analíticos y dashboards empresariales con Microsoft Power BI: modelado de datos, DAX y distribución de informes a usuarios finales.',                         'datos',         'BarChart2',      false, 100),
  ('looker-studio',           'Looker Studio',                    'Creación de tableros dinámicos con Google Looker Studio conectados a Analytics, Sheets, BigQuery y múltiples fuentes de datos en tiempo real.',                                      'datos',         'PieChart',       false, 110),
  ('analisis-estadistico',    'Análisis Estadístico',             'Procesamiento estadístico con SPSS, R o Python: análisis descriptivos, inferenciales, regresiones, pruebas de hipótesis y modelos multivariados.',                                  'datos',         'TrendingUp',     false, 120),
  ('depuracion-bases',        'Depuración de Bases de Datos',     'Limpieza, normalización y validación de bases de datos. Detección y corrección de inconsistencias, duplicados, errores de captura y valores atípicos.',                            'datos',         'DatabaseZap',    false, 130),
  ('automatizacion-datos',    'Automatización de Datos',          'Flujos de trabajo automatizados para recopilación, transformación y distribución de datos. Reducción del error humano y optimización del ciclo analítico.',                        'datos',         'Zap',            false, 140),
  ('visualizacion-datos',     'Visualización de Datos',           'Diseño de gráficos, infografías y representaciones visuales profesionales para comunicar hallazgos de investigación y datos institucionales con claridad.',                         'datos',         'LineChart',      false, 150),
  ('supabase-postgresql',     'Integración Supabase / PostgreSQL','Diseño e implementación de bases de datos relacionales con Supabase y PostgreSQL: APIs, Row Level Security, funciones y triggers para aplicaciones modernas.',                     'datos',         'Database',       false, 160),
  ('sistemas-reportes',       'Sistemas de Reportes',             'Desarrollo de plataformas de reportería automatizada para organizaciones. Generación programática de informes en PDF, Excel y formatos personalizados.',                           'datos',         'FileBarChart',   false, 170),
  -- Investigación Social
  ('investigacion-social',    'Investigación Social',             'Estudios cualitativos, cuantitativos y mixtos sobre fenómenos sociales: diseño metodológico, trabajo de campo, análisis de datos e informes finales.',                             'investigacion', 'SearchCheck',    true,  180),
  ('articulos-academicos',    'Artículos Académicos',             'Redacción y estructuración de artículos científicos bajo estándares APA, Vancouver e IMRAD. Apoyo para envío y publicación en revistas indexadas.',                                'investigacion', 'BookOpen',       false, 190),
  ('apoyo-tesis',             'Apoyo Metodológico para Tesis',    'Asesoría en diseño metodológico, planteamiento del problema, marco teórico, análisis de datos y defensa de tesis de grado y posgrado.',                                           'investigacion', 'GraduationCap',  false, 200),
  ('analisis-sociologico',    'Análisis Sociológico',             'Interpretación de fenómenos sociales desde marcos teóricos contemporáneos. Análisis de estructuras, relaciones de poder, movimientos sociales y cambio social.',                   'investigacion', 'Users',          false, 210),
  -- Instrumentos e Informes
  ('construccion-instrumentos','Construcción de Instrumentos',    'Diseño de encuestas, cuestionarios, guías de entrevista y escalas de medición con validación de contenido y confiabilidad para investigación aplicada.',                          'instrumentos',  'PenTool',        false, 220),
  ('informes-tecnicos',       'Informes Técnicos',                'Redacción de informes de avance, finales y ejecutivos para financiadores, juntas directivas y organismos reguladores. Síntesis ejecutiva y recomendaciones.',                      'instrumentos',  'FileCheck',      false, 230)
ON CONFLICT (slug) DO NOTHING;
