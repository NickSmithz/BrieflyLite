import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

export function Badge({ children, tone = "default" }: Props) {
  const tones = {
    default: "bg-white/10 text-crew-muted",
    success: "bg-crew-success/15 text-crew-success",
    warning: "bg-crew-warning/15 text-crew-warning",
    danger: "bg-crew-danger/15 text-crew-danger",
    accent: "bg-crew-accent/20 text-crew-accentSoft",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
