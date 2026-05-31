"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import Button from "@/components/ui/Button";

const navLinks = [
  { label: "Quiénes somos",  href: "#quienes-somos" },
  { label: "Programas",      href: "#programas"     },
  { label: "Trayectoria",    href: "#trayectoria"   },
  { label: "Transparencia",  href: "#transparencia" },
  { label: "Contacto",       href: "#contacto"      },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <nav
        className="container mx-auto px-4 h-16 flex items-center justify-between"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <a
          href="#inicio"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
          aria-label={`${siteConfig.name} — ir al inicio`}
        >
          {/* TODO-22: reemplazar con <Image> del logo SVG real */}
          <span
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-extrabold select-none"
            aria-hidden="true"
          >
            DSF
          </span>
          <span className="font-bold text-gray-900 hidden sm:block text-sm leading-tight">
            {siteConfig.name}
          </span>
        </a>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded px-1"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Button
            as="a"
            href="#donar"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Donar
          </Button>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          role="dialog"
          aria-modal="false"
          aria-label="Menú de navegación"
        >
          <ul className="container mx-auto px-4 py-4 flex flex-col gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="block py-3 px-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <Button as="a" href="#donar" fullWidth onClick={closeMenu}>
                Donar ahora
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
