import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Milestone } from "@/config/content";

function TimelineItem({ milestone, isLast }: { milestone: Milestone; isLast: boolean }) {
  return (
    <div className="relative flex gap-6">
      {/* Línea vertical */}
      {!isLast && (
        <div
          className="absolute left-5 top-10 bottom-0 w-0.5 bg-brand-200"
          aria-hidden="true"
        />
      )}

      {/* Punto */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold z-10">
        <span className="sr-only">Año</span>
        <span aria-hidden="true">{milestone.year.slice(-2)}</span>
      </div>

      {/* Contenido */}
      <div className="pb-8">
        <span className="inline-block bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
          {milestone.year}
        </span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
        <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
      </div>
    </div>
  );
}

export default function History() {
  const { history } = siteContent;

  return (
    <section
      id="trayectoria"
      className="py-20 bg-gray-50"
      aria-label="Nuestra trayectoria"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={history.eyebrow}
          headline={history.headline}
          description={history.description}
        />

        <div className="max-w-3xl mx-auto">
          {history.milestones.map((milestone, i) => (
            <TimelineItem
              key={i}
              milestone={milestone}
              isLast={i === history.milestones.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
