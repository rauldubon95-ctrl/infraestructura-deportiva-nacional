import { siteContent } from "@/config/content";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";

export default function ImpactStats() {
  const { stats } = siteContent;

  return (
    <section
      id="impacto"
      className="py-20 bg-white"
      aria-label="Cifras de impacto"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow="Nuestro impacto"
          headline="Números que\nhablan por sí solos"
          description="Cada cifra representa una vida transformada a través del deporte."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
