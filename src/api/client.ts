import type { ContentItem, ImportDraftItem, ImportDraftTask, Member, Project, Task, Team } from "../types";

const TOKEN_KEY = "briefly-crew-token";
const MEMBER_KEY = "briefly-crew-member-id";

export type LoginResponse =
  | { requiresMemberSelection: true; team: Team; members: Member[] }
  | { token: string; team: Team; member: Member; members: Member[] };

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredMemberId() {
  return localStorage.getItem(MEMBER_KEY);
}

export function setStoredMemberId(memberId: string) {
  localStorage.setItem(MEMBER_KEY, memberId);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
}

function query(params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  return { raw: text };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      data?.raw ||
      `Backend request failed with ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const login = (password: string, memberId?: string) =>
  apiFetch<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify({ password, memberId }) });

export const getMe = () => apiFetch<{ team: Team; member: Member; members: Member[] }>("/auth/me");

export const getProjects = () => apiFetch<Project[]>("/projects");
export const createProject = (input: Partial<Project> & { name: string }) =>
  apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(input) });
export const updateProject = (id: string, input: Partial<Project>) =>
  apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) });

export const getMembers = () => apiFetch<Member[]>("/members");
export const createMember = (input: Pick<Member, "name" | "role"> & Partial<Member>) =>
  apiFetch<Member>("/members", { method: "POST", body: JSON.stringify(input) });
export const updateMember = (id: string, input: Partial<Member>) =>
  apiFetch<Member>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(input) });

export const getContentItems = (params?: { projectId?: string; status?: string; format?: string }) =>
  apiFetch<ContentItem[]>(`/content-items${query(params)}`);
export const createContentItem = (input: Partial<ContentItem> & { projectId: string; title: string; format: string }) =>
  apiFetch<ContentItem>("/content-items", { method: "POST", body: JSON.stringify(input) });
export const createContentItemsBulk = (
  items: Array<Partial<ContentItem> & { projectId: string; title: string; format: string }>,
) => apiFetch<ContentItem[]>("/content-items/bulk", { method: "POST", body: JSON.stringify({ items }) });
export const updateContentItem = (id: string, input: Partial<ContentItem>) =>
  apiFetch<ContentItem>(`/content-items/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteContentItem = (id: string) =>
  apiFetch<{ ok: true }>(`/content-items/${id}`, { method: "DELETE" });

export const getTasks = (params?: { projectId?: string; assigneeId?: string; status?: string }) =>
  apiFetch<Task[]>(`/tasks${query(params)}`);
export const createTask = (input: Partial<Task> & { projectId: string; title: string }) =>
  apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(input) });
export const createTasksBulk = (tasks: Array<Partial<Task> & { projectId: string; title: string }>) =>
  apiFetch<Task[]>("/tasks/bulk", { method: "POST", body: JSON.stringify({ tasks }) });
export const updateTask = (id: string, input: Partial<Task>) =>
  apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const deleteTask = (id: string) => apiFetch<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" });

export const confirmImport = (input: {
  projectId: string;
  rawText: string;
  items: ImportDraftItem[];
  tasks: ImportDraftTask[];
}) => apiFetch<{ contentItems: ContentItem[]; tasks: Task[] }>("/import/confirm", {
  method: "POST",
  body: JSON.stringify(input),
});
