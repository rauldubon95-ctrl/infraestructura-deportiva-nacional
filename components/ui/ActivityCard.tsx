import Card from "./Card";

interface ActivityCardProps {
  phase: string;
  title: string;
  description: string;
  icon: string;
  index?: number;
}

// Mapa de iconos de Lucide como SVG inline para evitar import dinámico.
// Expandir si se necesitan más iconos.
const iconPaths: Record<string, string> = {
  Zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Target:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  Users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
};

const accentColors: Array<"orange" | "blue" | "purple"> = ["orange", "blue", "purple"];

export default function ActivityCard({
  phase,
  title,
  description,
  icon,
  index = 0,
}: ActivityCardProps) {
  const accent = accentColors[index % accentColors.length];
  const path = iconPaths[icon] ?? iconPaths["Target"];

  const iconBg = {
    orange: "bg-brand-100",
    blue:   "bg-blue-100",
    purple: "bg-purple-100",
  }[accent];

  const iconColor = {
    orange: "text-brand-600",
    blue:   "text-blue-600",
    purple: "text-purple-600",
  }[accent];

  return (
    <Card hover accent={accent} bordered>
      <div className={`inline-flex p-3 rounded-lg mb-4 ${iconBg}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 ${iconColor}`}
          aria-hidden="true"
        >
          <path d={path} />
        </svg>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {phase}
      </p>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Card>
  );
}
