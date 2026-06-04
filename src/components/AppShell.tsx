import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useCrewStore } from "../store/useCrewStore";
import { BottomNav } from "./BottomNav";
import { Button } from "./Button";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { activeTab, setActiveTab, currentMember, error, successMessage, clearMessages } = useCrewStore();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] px-3 pb-28 pt-[calc(env(safe-area-inset-top)+14px)]">
      <header className="sticky top-0 z-30 -mx-3 mb-4 border-b border-white/10 bg-crew-bg/90 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-crew-accentSoft">Briefly Crew</p>
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          </div>
          <Button variant="secondary" className="px-3" title="Настройки" onClick={() => setActiveTab("settings")}>
            <Settings size={18} />
          </Button>
        </div>
        {currentMember ? <p className="mt-1 text-sm text-crew-muted">{currentMember.avatarEmoji} {currentMember.name}</p> : null}
      </header>

      {(error || successMessage) && (
        <button
          className={`mb-3 w-full rounded-lg px-3 py-2 text-left text-sm ${error ? "bg-crew-danger/15 text-crew-danger" : "bg-crew-success/15 text-crew-success"}`}
          onClick={clearMessages}
        >
          {error || successMessage}
        </button>
      )}

      {children}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
