import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  bordered?: boolean;
  accent?: "orange" | "green" | "blue" | "purple";
}

const accentClasses = {
  orange: "border-l-4 border-brand-600",
  green:  "border-l-4 border-green-500",
  blue:   "border-l-4 border-blue-500",
  purple: "border-l-4 border-purple-500",
};

export default function Card({
  children,
  hover = false,
  bordered = false,
  accent,
  className = "",
  ...props
}: CardProps) {
  const classes = [
    "bg-white rounded-xl p-6",
    bordered ? "border border-gray-200" : "",
    hover
      ? "shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      : "shadow-sm",
    accent ? accentClasses[accent] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
