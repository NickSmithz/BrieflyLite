import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="text-center">
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-2 text-sm text-crew-muted">{children}</div> : null}
    </Card>
  );
}
