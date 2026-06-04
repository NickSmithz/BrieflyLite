import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none placeholder:text-crew-muted focus:border-crew-accent ${className}`}
      {...props}
    />
  );
}
