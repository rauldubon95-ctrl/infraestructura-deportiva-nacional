"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export default function FloatingContact() {
  // TODO-19: reemplazar con número real de WhatsApp en site.config.ts
  const hasWhatsApp = siteConfig.contact.whatsappLink !== "https://wa.me/50200000000";

  if (!hasWhatsApp) return null;

  return (
    <a
      href={siteConfig.contact.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className={
        "fixed bottom-6 right-6 z-50 " +
        "flex items-center justify-center w-14 h-14 rounded-full " +
        "bg-green-500 hover:bg-green-600 text-white shadow-lg " +
        "transition-all duration-200 hover:scale-110 hover:shadow-xl " +
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-400 " +
        "motion-safe:animate-bounce-once"
      }
    >
      <MessageCircle className="w-7 h-7" aria-hidden="true" />
    </a>
  );
}
