import { ArrowDown } from "lucide-react";
import { siteContent } from "@/config/content";
import Button from "@/components/ui/Button";

export default function Hero() {
  const { hero } = siteContent;

  return (
    <section
      id="inicio"
      className="relative flex items-center justify-center h-screen min-h-[600px] overflow-hidden"
      aria-label="Sección principal"
    >
      {/* Fondo: imagen real cuando esté disponible (TODO-21), gradiente de marca por defecto */}
      {hero.backgroundImage ? (
        // next/image requiere dimensiones o fill; usar div wrapper
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${hero.backgroundImage})` }}
          role="img"
          aria-label="Imagen de fondo — atletas en acción"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-brand-950 to-gray-900"
          aria-hidden="true"
        />
      )}

      {/* Overlay oscuro para contraste de texto */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="motion-safe:animate-fade-in max-w-4xl mx-auto">
          <span className="inline-block bg-brand-600 text-white text-sm font-semibold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Asociación Deportes Sin Fronteras
          </span>

          <h1 className="text-hero font-bold leading-tight whitespace-pre-line mb-6 drop-shadow-lg">
            {hero.headline}
          </h1>

          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            {hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="a" href={hero.cta.primaryHref} size="lg">
              {hero.cta.primary}
            </Button>
            <Button
              as="a"
              href={hero.cta.secondaryHref}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {hero.cta.secondary}
            </Button>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <a
        href="#impacto"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        aria-label="Desplazarse hacia abajo"
      >
        <ArrowDown
          className="w-6 h-6 motion-safe:animate-bounce"
          aria-hidden="true"
        />
      </a>
    </section>
  );
}
