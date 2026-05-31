"use client";

import {
  Activity, BarChart2, BookOpen, Building2, ClipboardList, Database,
  DatabaseZap, FileBarChart, FileCheck, FilePlus2, GitBranch,
  GraduationCap, LayoutDashboard, LayoutGrid, LineChart, MonitorCheck,
  PenTool, PieChart, Search, Target, TrendingUp, Users, Zap, FileText,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { FC } from "react";
import { categoryMeta, type ServiceItem } from "@/config/services.config";

const ICON_MAP: Record<string, FC<LucideProps>> = {
  Activity, BarChart2, BookOpen, Building2, ClipboardList, Database,
  DatabaseZap, FileBarChart, FileCheck, FilePlus2, GitBranch,
  GraduationCap, LayoutDashboard, LayoutGrid, LineChart, MonitorCheck,
  PenTool, PieChart, Search, Target, TrendingUp, Users, Zap, FileText,
};

interface ServiceCardProps {
  service: ServiceItem;
  onQuote: (service: ServiceItem) => void;
}

export default function ServiceCard({ service, onQuote }: ServiceCardProps) {
  const meta = categoryMeta[service.category];
  const Icon = ICON_MAP[service.iconName] ?? FileText;

  return (
    <article
      className={`
        group relative flex flex-col bg-white rounded-xl border border-gray-100
        shadow-sm hover:shadow-lg transition-all duration-300
        hover:-translate-y-1 overflow-hidden
        ${service.featured ? "ring-1 ring-brand-500/20" : ""}
      `}
    >
      {/* Franja de color por categoría */}
      <div className={`h-1 w-full ${meta.borderClass} bg-current`} aria-hidden="true" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Icono + badge */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center
              ${meta.bgClass} ${meta.textClass}
            `}
            aria-hidden="true"
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>

          <span
            className={`
              text-[10px] font-semibold uppercase tracking-wider px-2 py-1
              rounded-full ${meta.badgeBg} ${meta.badgeText} whitespace-nowrap
            `}
          >
            {meta.label}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-brand-600 transition-colors">
          {service.name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">
          {service.description}
        </p>

        {/* CTA */}
        <button
          onClick={() => onQuote(service)}
          className="
            mt-auto w-full py-2.5 px-4 rounded-lg text-sm font-medium
            border-2 border-brand-600 text-brand-600
            hover:bg-brand-600 hover:text-white
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2
            transition-all duration-200
          "
          aria-label={`Solicitar cotización para ${service.name}`}
        >
          Solicitar cotización
        </button>
      </div>
    </article>
  );
}
