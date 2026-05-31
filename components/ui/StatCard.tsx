import type { Stat } from "@/config/content";

interface StatCardProps {
  stat: Stat;
}

const colorMap = {
  green:  { bg: "bg-green-50",  text: "text-green-700",  value: "text-green-600"  },
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   value: "text-blue-600"   },
  purple: { bg: "bg-purple-50", text: "text-purple-700", value: "text-purple-600" },
  orange: { bg: "bg-brand-50",  text: "text-brand-700",  value: "text-brand-600"  },
};

export default function StatCard({ stat }: StatCardProps) {
  const colors = colorMap[stat.color];

  return (
    <div
      className={`${colors.bg} rounded-xl p-8 text-center shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <p className={`text-4xl font-bold tracking-tight ${colors.value} mb-2`}>
        {stat.value}
      </p>
      <p className={`font-semibold text-lg ${colors.text}`}>{stat.label}</p>
      {stat.sublabel && (
        <p className="text-sm text-gray-500 mt-1">{stat.sublabel}</p>
      )}
    </div>
  );
}
