import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";
import ActivityCard from "@/components/ui/ActivityCard";

export default function Programs() {
  const { programs } = siteContent;

  return (
    <section
      id="programas"
      className="py-20 bg-white"
      aria-label="Nuestros programas"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={programs.eyebrow}
          headline={programs.headline}
          description={programs.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.phases.map((phase, i) => (
            <ActivityCard
              key={i}
              phase={phase.phase}
              title={phase.title}
              description={phase.description}
              icon={phase.icon}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
