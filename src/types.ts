export type Team = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  teamId: string;
  name: string;
  role: string;
  avatarEmoji?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  teamId: string;
  name: string;
  clientName?: string | null;
  description?: string | null;
  color?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContentStatus = "idea" | "in_work" | "review" | "ready" | "published";
export type TaskStatus = "new" | "in_progress" | "review" | "done" | "blocked";

export type ContentItem = {
  id: string;
  teamId: string;
  projectId: string;
  title: string;
  format: string;
  publishDate?: string | null;
  topic?: string | null;
  notes?: string | null;
  referenceUrl?: string | null;
  status: ContentStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  teamId: string;
  projectId: string;
  contentItemId?: string | null;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  status: TaskStatus | string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

export type Tab = "home" | "tasks" | "plan" | "projects" | "team" | "import" | "settings";

export type ImportDraftItem = {
  title: string;
  format: string;
  publishDate?: string | null;
  topic?: string | null;
  notes?: string | null;
  referenceUrl?: string | null;
  status?: string;
};

export type ImportPreviewItem = ImportDraftItem & {
  clientId: string;
};

export type ImportDraftTask = {
  contentItemIndex: number;
  projectId?: string;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  status?: string;
  priority?: string;
};

export type ImportPreviewTask = {
  clientId: string;
  contentItemClientId?: string | null;
  contentItemClientIndex?: number;
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  status?: string;
  priority?: string;
};
