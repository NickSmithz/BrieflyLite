import type { ImportDraftItem } from "../types";
import { findFirstUrl } from "./links";
import { nextWeekdayISO } from "./date";

const weekdayMap: Record<string, number> = {
  воскресенье: 0,
  понедельник: 1,
  вторник: 2,
  среда: 3,
  четверг: 4,
  пятница: 5,
  суббота: 6,
};

function detectFormat(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("reels") || lower.includes("рилс")) return "reels";
  if (lower.includes("stories") || lower.includes("сторис")) return "stories";
  if (lower.includes("карусель")) return "карусель";
  if (lower.includes("post") || lower.includes("пост")) return "post";
  return "post";
}

function detectDate(text: string) {
  const lower = text.toLowerCase();
  const weekday = Object.keys(weekdayMap).find((day) => lower.includes(day));
  if (weekday) return nextWeekdayISO(weekdayMap[weekday]);

  const match = lower.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
  if (!match) return null;

  const year = match[3] ? Number(match[3].length === 2 ? `20${match[3]}` : match[3]) : new Date().getFullYear();
  return new Date(year, Number(match[2]) - 1, Number(match[1])).toISOString();
}

function cleanLine(line: string) {
  return line.replace(/^\d+[.)]\s*/, "").trim();
}

export function parseImportText(rawText: string): ImportDraftItem[] {
  const blocks = rawText
    .split(/\n(?=\s*\d+[.)]\s*)|\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => cleanLine(line)).filter(Boolean);
    const joined = lines.join("\n");
    const topicLine = lines.find((line) => /^тема:/i.test(line));
    const notesLines = lines.filter((line) => !/^тема:/i.test(line));
    const topic = topicLine?.replace(/^тема:\s*/i, "").trim() || cleanLine(lines[0] ?? `Публикация ${index + 1}`);
    const notes = notesLines
      .map((line) => line.replace(/^заметки:\s*/i, "").trim())
      .filter((line) => line && line !== topic)
      .join("\n");

    return {
      title: topic,
      topic,
      format: detectFormat(joined),
      publishDate: detectDate(joined),
      notes,
      referenceUrl: findFirstUrl(joined),
      status: "idea",
    };
  });
}
