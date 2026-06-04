import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-white outline-none placeholder:text-crew-muted focus:border-crew-accent ${className}`}
      {...props}
    />
  );
}
