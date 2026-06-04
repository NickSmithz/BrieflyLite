import { create } from "zustand";
import * as api from "../api/client";
import type { ContentItem, ImportDraftItem, Member, Project, Tab, Task, Team } from "../types";
import { parseImportText as parseText } from "../utils/importParser";
import { generateTasksForImport } from "../utils/taskGenerator";

type CrewState = {
  token: string | null;
  team: Team | null;
  currentMember: Member | null;
  members: Member[];
  projects: Project[];
  contentItems: ContentItem[];
  tasks: Task[];
  activeTab: Tab;
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  login: (password: string, memberId?: string) => Promise<api.LoginResponse>;
  logout: () => void;
  loadWorkspace: () => Promise<void>;
  createProject: (input: { name: string; clientName?: string; description?: string; color?: string }) => Promise<void>;
  updateProject: (id: string, input: Partial<Project>) => Promise<void>;
  createMember: (input: { name: string; role: string; avatarEmoji?: string }) => Promise<void>;
  updateMember: (id: string, input: Partial<Member>) => Promise<void>;
  createContentItem: (input: Partial<ContentItem> & { projectId: string; title: string; format: string }) => Promise<void>;
  updateContentItem: (id: string, input: Partial<ContentItem>) => Promise<void>;
  createTask: (input: Partial<Task> & { projectId: string; title: string }) => Promise<void>;
  updateTask: (id: string, input: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  parseImportText: (rawText: string) => ImportDraftItem[];
  confirmImport: (projectId: string, rawText: string, items: ImportDraftItem[]) => Promise<void>;
  setActiveTab: (tab: Tab) => void;
  setSelectedProject: (projectId: string | null) => void;
  clearMessages: () => void;
};

async function run<T>(set: (state: Partial<CrewState>) => void, fn: () => Promise<T>) {
  set({ isLoading: true, error: null, successMessage: null });
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    set({ error: message });
    throw error;
  } finally {
    set({ isLoading: false });
  }
}

export const useCrewStore = create<CrewState>((set, get) => ({
  token: api.getToken(),
  team: null,
  currentMember: null,
  members: [],
  projects: [],
  contentItems: [],
  tasks: [],
  activeTab: "home",
  selectedProjectId: null,
  isLoading: false,
  error: null,
  successMessage: null,

  async login(password, memberId) {
    return run(set, async () => {
      const result = await api.login(password, memberId);
      if ("token" in result) {
        api.setToken(result.token);
        api.setStoredMemberId(result.member.id);
        set({
          token: result.token,
          team: result.team,
          currentMember: result.member,
          members: result.members,
          successMessage: "Вход выполнен",
        });
      } else {
        set({ team: result.team, members: result.members });
      }
      return result;
    });
  },

  logout() {
    api.clearToken();
    set({
      token: null,
      currentMember: null,
      team: null,
      members: [],
      projects: [],
      contentItems: [],
      tasks: [],
      activeTab: "home",
      selectedProjectId: null,
    });
  },

  async loadWorkspace() {
    return run(set, async () => {
      const [me, projects, contentItems, tasks] = await Promise.all([
        api.getMe(),
        api.getProjects(),
        api.getContentItems(),
        api.getTasks(),
      ]);
      set({
        team: me.team,
        currentMember: me.member,
        members: me.members,
        projects,
        contentItems,
        tasks,
      });
    });
  },

  async createProject(input) {
    return run(set, async () => {
      const project = await api.createProject(input);
      set({ projects: [project, ...get().projects], successMessage: "Проект создан" });
    });
  },

  async updateProject(id, input) {
    return run(set, async () => {
      const project = await api.updateProject(id, input);
      set({ projects: get().projects.map((item) => (item.id === id ? project : item)), successMessage: "Проект обновлен" });
    });
  },

  async createMember(input) {
    return run(set, async () => {
      const member = await api.createMember(input);
      set({ members: [...get().members, member], successMessage: "Участник добавлен" });
    });
  },

  async updateMember(id, input) {
    return run(set, async () => {
      const member = await api.updateMember(id, input);
      set({ members: get().members.map((item) => (item.id === id ? member : item)), successMessage: "Участник обновлен" });
    });
  },

  async createContentItem(input) {
    return run(set, async () => {
      const item = await api.createContentItem(input);
      set({ contentItems: [item, ...get().contentItems], successMessage: "Публикация создана" });
    });
  },

  async updateContentItem(id, input) {
    return run(set, async () => {
      const item = await api.updateContentItem(id, input);
      set({ contentItems: get().contentItems.map((value) => (value.id === id ? item : value)), successMessage: "Публикация обновлена" });
    });
  },

  async createTask(input) {
    return run(set, async () => {
      const task = await api.createTask(input);
      set({ tasks: [task, ...get().tasks], successMessage: "Задача создана" });
    });
  },

  async updateTask(id, input) {
    return run(set, async () => {
      const task = await api.updateTask(id, input);
      set({ tasks: get().tasks.map((item) => (item.id === id ? task : item)), successMessage: "Задача обновлена" });
    });
  },

  async updateTaskStatus(id, status) {
    return get().updateTask(id, { status });
  },

  async deleteTask(id) {
    return run(set, async () => {
      await api.deleteTask(id);
      set({ tasks: get().tasks.filter((task) => task.id !== id), successMessage: "Задача удалена" });
    });
  },

  parseImportText(rawText) {
    return parseText(rawText);
  },

  async confirmImport(projectId, rawText, items) {
    return run(set, async () => {
      if (!projectId) {
        throw new Error("Выберите проект для импорта");
      }

      const normalizedItems = Array.isArray(items) ? items : [];
      const tasks = generateTasksForImport(projectId, normalizedItems, get().members);
      const normalizedTasks = Array.isArray(tasks) ? tasks : [];
      const result = await api.confirmImport({ projectId, rawText, items: normalizedItems, tasks: normalizedTasks });
      set({
        contentItems: [...result.contentItems, ...get().contentItems],
        tasks: [...result.tasks, ...get().tasks],
        successMessage: `Создано: ${result.contentItems.length} публикаций и ${result.tasks.length} задач`,
        activeTab: "plan",
      });
    });
  },

  setActiveTab(tab) {
    set({ activeTab: tab });
  },

  setSelectedProject(projectId) {
    set({ selectedProjectId: projectId });
  },

  clearMessages() {
    set({ error: null, successMessage: null });
  },
}));
