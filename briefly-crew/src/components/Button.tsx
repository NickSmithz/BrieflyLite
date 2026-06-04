import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ children, className = "", variant = "primary", ...props }: Props) {
  const variants = {
    primary: "bg-crew-accent text-white shadow-glow",
    secondary: "bg-white/10 text-white border border-white/10",
    danger: "bg-crew-danger text-white",
    ghost: "bg-transparent text-crew-muted",
  };

  return (
    <button
      className={`min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
