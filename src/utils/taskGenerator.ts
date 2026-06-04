import type { ImportPreviewItem, ImportPreviewTask, Member } from "../types";
import { addDays } from "./date";

function createClientId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function roleMember(members: Member[], words: string[]) {
  return members.find((member) => {
    const role = member.role.toLowerCase();
    const name = member.name.toLowerCase();
    return member.isActive && words.some((word) => role.includes(word) || name.includes(word));
  });
}

function pickAssignee(title: string, members: Member[]) {
  const lower = title.toLowerCase();
  const pm = roleMember(members, ["project manager", "manager", "менедж", "николай"]);
  if (lower.includes("дизайн")) return roleMember(members, ["designer", "дизайн"])?.id ?? null;
  if (lower.includes("reels") || lower.includes("снять") || lower.includes("смонтировать")) {
    return roleMember(members, ["reels", "рилс"])?.id ?? null;
  }
  if (lower.includes("stories")) return roleMember(members, ["stories", "сторис"])?.id ?? null;
  if (lower.includes("сценар") || lower.includes("текст")) {
    return roleMember(members, ["copy", "project manager", "manager"])?.id ?? pm?.id ?? null;
  }
  if (lower.includes("провер") || lower.includes("опубликов")) return pm?.id ?? null;
  return null;
}

function titlesForFormat(format: string) {
  const lower = format.toLowerCase();
  if (lower.includes("reels") || lower.includes("рилс")) {
    return [
      "Написать сценарий",
      "Подготовить референс",
      "Снять видео",
      "Смонтировать reels",
      "Проверить",
      "Опубликовать",
    ];
  }
  if (lower.includes("stories") || lower.includes("сторис")) {
    return ["Подготовить stories", "Проверить", "Опубликовать"];
  }
  return ["Написать текст", "Подготовить дизайн", "Проверить", "Опубликовать"];
}

function dueDateFor(title: string, publishDate?: string | null) {
  if (!publishDate) return null;
  const lower = title.toLowerCase();
  if (lower.includes("сценар") || lower.includes("текст")) return addDays(publishDate, -3);
  if (
    lower.includes("дизайн") ||
    lower.includes("снять") ||
    lower.includes("смонтировать") ||
    lower.includes("stories")
  ) {
    return addDays(publishDate, -2);
  }
  if (lower.includes("провер")) return addDays(publishDate, -1);
  if (lower.includes("опубликов")) return publishDate;
  return null;
}

export function generateTasksForImport(items: ImportPreviewItem[], members: Member[]): ImportPreviewTask[] {
  return items.flatMap((item, contentItemClientIndex) =>
    titlesForFormat(item.format).map((title) => ({
      clientId: createClientId("task"),
      contentItemClientId: item.clientId,
      contentItemClientIndex,
      title: `${title}: ${item.title}`,
      description: item.notes || item.referenceUrl || null,
      assigneeId: pickAssignee(title, members),
      dueDate: dueDateFor(title, item.publishDate),
      status: "new",
      priority: "normal",
    })),
  );
}
