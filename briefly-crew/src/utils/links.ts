export const urlPattern = /(https?:\/\/[^\s]+)/g;

export function findFirstUrl(text?: string | null) {
  if (!text) return null;
  return text.match(urlPattern)?.[0] ?? null;
}
