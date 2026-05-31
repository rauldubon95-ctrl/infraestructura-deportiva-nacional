import { Check } from "lucide-react";
import type { DonationTier } from "@/config/content";
import Button from "./Button";

interface DonationCardProps {
  tier: DonationTier;
  // Deshabilitado hasta configurar proveedor de pagos (TODO-23)
  disabled?: boolean;
}

export default function DonationCard({ tier, disabled = true }: DonationCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-xl p-8 transition-all duration-200 ${
        tier.featured
          ? "bg-brand-600 text-white shadow-xl scale-105 border-2 border-brand-500"
          : "bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      {tier.featured && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-brand-700 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">
          Más popular
        </span>
      )}

      <div className="mb-6">
        <h3
          className={`text-xl font-bold mb-1 ${
            tier.featured ? "text-white" : "text-gray-900"
          }`}
        >
          {tier.name}
        </h3>
        <div className="flex items-baseline gap-1 my-3">
          <span
            className={`text-4xl font-extrabold ${
              tier.featured ? "text-white" : "text-brand-600"
            }`}
          >
            {tier.amount}
          </span>
          <span
            className={`text-sm ${tier.featured ? "text-white/70" : "text-gray-500"}`}
          >
            {tier.period}
          </span>
        </div>
        <p
          className={`text-sm ${tier.featured ? "text-white/80" : "text-gray-600"}`}
        >
          {tier.description}
        </p>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {tier.benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                tier.featured ? "text-white" : "text-brand-600"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm ${tier.featured ? "text-white/90" : "text-gray-700"}`}
            >
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      {/* Deshabilitado hasta configurar Stripe (TODO-23) */}
      <Button
        variant={tier.featured ? "white" : "primary"}
        fullWidth
        disabled={disabled}
        title={disabled ? "Donaciones disponibles próximamente — TODO-23" : undefined}
        aria-label={`${tier.cta} — nivel ${tier.name}`}
      >
        {tier.cta}
      </Button>

      {disabled && (
        <p
          className={`text-xs text-center mt-2 ${
            tier.featured ? "text-white/60" : "text-gray-400"
          }`}
        >
          Próximamente disponible
        </p>
      )}
    </div>
  );
}
