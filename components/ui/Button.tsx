import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button"; href?: never };

type ButtonAsAnchor = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600 shadow-sm",
  outline:
    "border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-600",
  ghost:
    "text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-600",
  white:
    "bg-white text-brand-700 hover:bg-brand-50 focus-visible:ring-white shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed " +
  "motion-safe:active:scale-95";

export default function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", fullWidth = false, as, children, ...rest } = props;

  const className = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    (rest as { className?: string }).className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (as === "a") {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} className={className} {...anchorRest}>
        {children}
      </a>
    );
  }

  const { ...btnRest } = rest as ButtonAsButton;
  return (
    <button className={className} {...btnRest}>
      {children}
    </button>
  );
}
