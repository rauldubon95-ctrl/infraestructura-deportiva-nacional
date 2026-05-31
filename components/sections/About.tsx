import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";

export default function About() {
  const { about } = siteContent;

  return (
    <section
      id="quienes-somos"
      className="py-20 bg-gray-50"
      aria-label="Quiénes somos"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={about.eyebrow}
          headline={about.headline}
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Misión */}
          <div className="bg-white rounded-xl p-8 shadow-sm border-t-4 border-brand-600">
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Misión
            </span>
            <p className="text-gray-700 leading-relaxed">{about.mission}</p>
          </div>

          {/* Visión */}
          <div className="bg-white rounded-xl p-8 shadow-sm border-t-4 border-blue-500">
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Visión
            </span>
            <p className="text-gray-700 leading-relaxed">{about.vision}</p>
          </div>

          {/* Método */}
          <div className="bg-white rounded-xl p-8 shadow-sm border-t-4 border-purple-500">
            <span className="inline-block bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Método
            </span>
            <p className="text-gray-700 leading-relaxed">{about.method}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
