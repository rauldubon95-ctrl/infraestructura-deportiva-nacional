import { siteConfig } from "@/config/site.config";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const navGroups = [
  {
    title: "Organización",
    links: [
      { label: "Quiénes somos",  href: "#quienes-somos" },
      { label: "Programas",      href: "#programas"     },
      { label: "Trayectoria",    href: "#trayectoria"   },
      { label: "Transparencia",  href: "#transparencia" },
    ],
  },
  {
    title: "Participar",
    links: [
      { label: "Donar",         href: "#donar"    },
      { label: "Ser voluntario", href: "#contacto" },
      { label: "Alianzas",      href: "#contacto" },
      { label: "Contacto",      href: "#contacto" },
    ],
  },
];

const socialLinks = [
  { Icon: Facebook,  href: siteConfig.social.facebook,  label: "Facebook"  },
  { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
  { Icon: Twitter,   href: siteConfig.social.twitter,   label: "Twitter / X" },
  { Icon: Youtube,   href: siteConfig.social.youtube,   label: "YouTube"   },
].filter((s) => s.href);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300" aria-label="Pie de página">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-gray-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* TODO-22: logo real */}
              <span
                className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-extrabold"
                aria-hidden="true"
              >
                DSF
              </span>
              <span className="text-white font-bold text-lg">{siteConfig.name}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {siteConfig.tagline}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6" role="list" aria-label="Redes sociales">
                {socialLinks.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav groups */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          {siteConfig.legal.registroLegal && (
            <p>Reg. Legal: {siteConfig.legal.registroLegal}</p>
          )}
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Política de privacidad
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Términos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
