"use client";

import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { siteContent } from "@/config/content";

export default function UrgentBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { urgentBanner } = siteContent;

  if (!urgentBanner.active || dismissed) return null;

  return (
    <div
      className="bg-brand-600 text-white py-3 px-4"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-medium text-sm truncate">{urgentBanner.message}</span>
          {urgentBanner.cta && urgentBanner.ctaHref && (
            <a
              href={urgentBanner.ctaHref}
              className="shrink-0 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-2 hover:no-underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {urgentBanner.cta}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </a>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Cerrar aviso"
          className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
