import { ClipboardList, FolderKanban, Home, ListTodo, Users } from "lucide-react";
import type { Tab } from "../types";

const items: Array<{ tab: Tab; label: string; icon: typeof Home }> = [
  { tab: "home", label: "Главная", icon: Home },
  { tab: "tasks", label: "Задачи", icon: ListTodo },
  { tab: "plan", label: "План", icon: ClipboardList },
  { tab: "projects", label: "Проекты", icon: FolderKanban },
  { tab: "team", label: "Команда", icon: Users },
];

export function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-crew-bg/95 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-[480px] grid-cols-5 gap-1">
        {items.map(({ tab, label, icon: Icon }) => {
          const active = activeTab === tab;
          return (
            <button
              className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-semibold ${
                active ? "bg-crew-accent text-white" : "text-crew-muted"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              title={label}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
