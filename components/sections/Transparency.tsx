import { FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";

export default function Transparency() {
  const { transparency } = siteContent;

  return (
    <section
      id="transparencia"
      className="py-20 bg-white"
      aria-label="Transparencia financiera"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={transparency.eyebrow}
          headline={transparency.headline}
          description={transparency.description}
        />

        {/* Métricas de distribución */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <div className="bg-green-50 rounded-xl p-8 text-center">
            <p className="text-5xl font-extrabold text-green-600 mb-2">
              {transparency.programsPercent}
            </p>
            <p className="font-semibold text-green-800">Va a programas directos</p>
            <p className="text-sm text-green-700 mt-1">
              TODO-14: Porcentaje real de inversión en programas
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <p className="text-5xl font-extrabold text-gray-600 mb-2">
              {transparency.adminPercent}
            </p>
            <p className="font-semibold text-gray-700">Administración y operación</p>
            <p className="text-sm text-gray-500 mt-1">
              TODO-14: Porcentaje real de costos administrativos
            </p>
          </div>
        </div>

        {/* Reportes */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" aria-hidden="true" />
            Informes anuales publicados
          </h3>
          <div className="space-y-3">
            {transparency.reports.map((report, i) => (
              <Card key={i} bordered>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText
                      className="w-5 h-5 text-brand-600 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-500">{report.year}</p>
                    </div>
                  </div>
                  {report.url ? (
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded transition-colors"
                    >
                      Descargar
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">
                      TODO-13: enlace al PDF
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
