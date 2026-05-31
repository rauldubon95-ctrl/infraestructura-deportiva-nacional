import { Heart, HandHeart } from "lucide-react";
import { siteContent } from "@/config/content";
import Button from "@/components/ui/Button";

export default function DualCTA() {
  const { dualCTA } = siteContent;

  return (
    <section
      className="py-20 bg-white"
      aria-label="Donar o ser voluntario"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Donar */}
          <div className="bg-brand-600 rounded-2xl p-10 text-white flex flex-col items-start gap-6">
            <Heart className="w-12 h-12 text-white/80" aria-hidden="true" />
            <div>
              <h3 className="text-2xl font-bold mb-3">{dualCTA.donate.headline}</h3>
              <p className="text-white/80 leading-relaxed">
                {dualCTA.donate.description}
              </p>
            </div>
            <Button
              as="a"
              href="#donar"
              variant="white"
              className="mt-auto"
            >
              {dualCTA.donate.cta}
            </Button>
          </div>

          {/* Voluntariado */}
          <div className="bg-gray-900 rounded-2xl p-10 text-white flex flex-col items-start gap-6">
            <HandHeart className="w-12 h-12 text-gray-400" aria-hidden="true" />
            <div>
              <h3 className="text-2xl font-bold mb-3">{dualCTA.volunteer.headline}</h3>
              <p className="text-gray-400 leading-relaxed">
                {dualCTA.volunteer.description}
              </p>
            </div>
            <Button
              as="a"
              href="#contacto"
              variant="outline"
              className="mt-auto border-white text-white hover:bg-white/10"
            >
              {dualCTA.volunteer.cta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
