import type { ReactNode } from "react";
import { Button } from "./Button";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 px-3 pb-3 pt-16">
      <div className="mx-auto w-full max-w-[480px] rounded-lg border border-white/10 bg-crew-card p-4 shadow-glow">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
