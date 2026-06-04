const dayMs = 24 * 60 * 60 * 1000;

export function toDateInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDate(value?: string | null) {
  if (!value) return "Без даты";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(new Date(value));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(value?: string | null) {
  return Boolean(value && toDateInput(value) === todayISO());
}

export function isThisWeek(value?: string | null) {
  if (!value) return false;
  const now = new Date();
  const date = new Date(value);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 7 * dayMs);
  return date >= start && date <= end;
}

export function isOverdue(value?: string | null, status?: string) {
  if (!value || status === "done") return false;
  return new Date(toDateInput(value)).getTime() < new Date(todayISO()).getTime();
}

export function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function nextWeekdayISO(dayIndex: number) {
  const now = new Date();
  const current = now.getDay();
  const diff = (dayIndex - current + 7) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  return target.toISOString();
}
