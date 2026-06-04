import { useEffect } from "react";
import { AppShell } from "./components/AppShell";
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { ProjectDetailScreen } from "./screens/ProjectDetailScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { ImportScreen } from "./screens/ImportScreen";
import { TasksScreen } from "./screens/TasksScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useCrewStore } from "./store/useCrewStore";

const titles = {
  home: "Главная",
  tasks: "Задачи",
  plan: "Контент-план",
  projects: "Проекты",
  team: "Команда",
  import: "Импорт плана",
  settings: "Настройки",
};

export default function App() {
  const { token, activeTab, selectedProjectId, loadWorkspace } = useCrewStore();

  useEffect(() => {
    if (token) void loadWorkspace();
  }, [token, loadWorkspace]);

  if (!token) return <LoginScreen />;

  const title = selectedProjectId && activeTab === "projects" ? "Проект" : titles[activeTab];

  return (
    <AppShell title={title}>
      {activeTab === "home" ? <HomeScreen /> : null}
      {activeTab === "tasks" ? <TasksScreen /> : null}
      {activeTab === "plan" ? <PlanScreen /> : null}
      {activeTab === "projects" && selectedProjectId ? <ProjectDetailScreen /> : null}
      {activeTab === "projects" && !selectedProjectId ? <ProjectsScreen /> : null}
      {activeTab === "team" ? <TeamScreen /> : null}
      {activeTab === "import" ? <ImportScreen /> : null}
      {activeTab === "settings" ? <SettingsScreen /> : null}
    </AppShell>
  );
}
