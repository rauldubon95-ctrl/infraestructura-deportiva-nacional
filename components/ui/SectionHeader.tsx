interface SectionHeaderProps {
  eyebrow?: string;
  headline: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export default function SectionHeader({
  eyebrow,
  headline,
  description,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const mx = align === "center" ? "mx-auto" : "";

  return (
    <div className={`${textAlign} mb-12`}>
      {eyebrow && (
        <span
          className={`inline-block text-sm font-semibold uppercase tracking-widest mb-3 px-4 py-1 rounded-full ${
            light
              ? "bg-white/20 text-white"
              : "bg-brand-100 text-brand-700"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-section font-bold leading-tight whitespace-pre-line ${mx} max-w-3xl ${
          light ? "text-white" : "text-gray-900"
        }`}
      >
        {headline}
      </h2>
      {description && (
        <p
          className={`mt-4 text-lg leading-relaxed max-w-2xl ${mx} ${
            light ? "text-white/80" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
