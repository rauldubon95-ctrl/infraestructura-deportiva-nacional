import { siteContent } from "@/config/content";
import Button from "@/components/ui/Button";

export default function CommunityCTA() {
  const { communityCTA } = siteContent;

  return (
    <section
      className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white"
      aria-label="Llamada a la comunidad"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-section font-bold leading-tight mb-6 max-w-3xl mx-auto">
          {communityCTA.headline}
        </h2>
        <p className="text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
          {communityCTA.subheadline}
        </p>
        <Button as="a" href={communityCTA.ctaHref} variant="white" size="lg">
          {communityCTA.cta}
        </Button>
      </div>
    </section>
  );
}
