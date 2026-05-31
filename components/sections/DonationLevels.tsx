import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";
import DonationCard from "@/components/ui/DonationCard";

export default function DonationLevels() {
  const { donationLevels } = siteContent;

  return (
    <section
      id="donar"
      className="py-20 bg-gray-50"
      aria-label="Niveles de donación"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={donationLevels.eyebrow}
          headline={donationLevels.headline}
          description={donationLevels.description}
        />

        {/* Aviso mientras no hay proveedor de pagos configurado */}
        <div
          className="max-w-2xl mx-auto mb-10 bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 text-sm text-yellow-800"
          role="status"
        >
          <strong>TODO-23:</strong> El sistema de donaciones está pendiente de configuración
          con un proveedor de pagos (Stripe). Los botones están deshabilitados temporalmente.
          Cuando se configure, eliminar este aviso y habilitar los botones.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {donationLevels.tiers.map((tier) => (
            <DonationCard key={tier.id} tier={tier} disabled />
          ))}
        </div>
      </div>
    </section>
  );
}
