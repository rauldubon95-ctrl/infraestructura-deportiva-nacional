"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import ServiceCard from "@/components/ui/ServiceCard";
import QuotationModal from "@/components/ui/QuotationModal";
import {
  servicesList,
  categoryMeta,
  CATEGORIES_ORDER,
  type ServiceItem,
  type ServiceCategory,
} from "@/config/services.config";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filtered =
    activeCategory === "all"
      ? servicesList
      : servicesList.filter((s) => s.category === activeCategory);

  const total = servicesList.length;

  return (
    <>
      <section
        id="servicios"
        className="py-20 lg:py-28 bg-gray-50"
        aria-labelledby="services-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Encabezado ──────────────────────────────────────────────── */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
              Consultoría Profesional
            </span>
            <h2
              id="services-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight"
            >
              Servicios Especializados
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Capacidad técnica avanzada en formulación, datos, investigación y evaluación.{" "}
              <span className="font-semibold text-gray-700">{total} servicios disponibles</span>{" "}
              para organizaciones e instituciones.
            </p>
          </div>

          {/* ── Filtros de categoría ────────────────────────────────────── */}
          <div
            className="flex flex-wrap justify-center gap-2 mb-10"
            role="group"
            aria-label="Filtrar servicios por categoría"
          >
            <FilterButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              label={`Todos (${total})`}
            />
            {CATEGORIES_ORDER.map((cat) => {
              const count = servicesList.filter((s) => s.category === cat).length;
              return (
                <FilterButton
                  key={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  label={`${categoryMeta[cat].label} (${count})`}
                  categoryKey={cat}
                />
              );
            })}
          </div>

          {/* ── Grid de tarjetas ────────────────────────────────────────── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-live="polite"
            aria-label={`Mostrando ${filtered.length} servicios`}
          >
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onQuote={setSelectedService}
              />
            ))}
          </div>

          {/* ── CTA inferior ────────────────────────────────────────────── */}
          <div className="mt-14 text-center">
            <p className="text-gray-500 text-sm mb-4">
              ¿No encuentras exactamente lo que necesitas?
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("contacto");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Consultar servicio personalizado
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Modal de cotización (portal fuera del flujo) ──────────────── */}
      <QuotationModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}

// ── Componente interno de filtro ─────────────────────────────────────────────
function FilterButton({
  active,
  onClick,
  label,
  categoryKey,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  categoryKey?: ServiceCategory;
}) {
  const meta = categoryKey ? categoryMeta[categoryKey] : null;

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`
        px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2
        ${
          active
            ? meta
              ? `${meta.bgClass} ${meta.textClass} ring-1 ${meta.borderClass} ring-current`
              : "bg-brand-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {label}
    </button>
  );
}
