import { Quote } from "lucide-react";
import { siteContent } from "@/config/content";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";

export default function SocialProof() {
  const { socialProof } = siteContent;

  return (
    <section
      className="py-20 bg-gray-50"
      aria-label="Testimonios y aliados"
    >
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={socialProof.eyebrow}
          headline={socialProof.headline}
        />

        {/* Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {socialProof.testimonials.map((t, i) => (
            <Card key={i} bordered hover>
              <Quote
                className="w-8 h-8 text-brand-300 mb-4"
                aria-hidden="true"
              />
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="border-t border-gray-100 pt-4">
                <cite className="not-italic">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                  {t.location && (
                    <p className="text-xs text-gray-400 mt-0.5">{t.location}</p>
                  )}
                </cite>
              </footer>
            </Card>
          ))}
        </div>

        {/* Logos aliados */}
        {socialProof.partners.length > 0 && (
          <div>
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-gray-400 mb-8">
              Nuestros aliados
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {socialProof.partners.map((partner, i) =>
                partner.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={partner.logo}
                    alt={partner.name}
                    className="h-10 object-contain grayscale hover:grayscale-0 transition-all duration-200 opacity-60 hover:opacity-100"
                  />
                ) : (
                  // Placeholder visual mientras no hay logo real (TODO-18)
                  <div
                    key={i}
                    className="h-10 px-6 flex items-center bg-gray-200 rounded text-gray-400 text-sm font-medium"
                    aria-label={partner.name}
                  >
                    {partner.name}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
