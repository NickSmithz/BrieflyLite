import { urlPattern } from "../utils/links";

export function LinkifiedText({ text }: { text?: string | null }) {
  if (!text) return null;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, index) =>
        urlPattern.test(part) ? (
          <a
            className="break-all text-crew-accentSoft underline"
            href={part}
            rel="noreferrer"
            target="_blank"
            key={`${part}-${index}`}
          >
            {part}
          </a>
        ) : (
          <span className="whitespace-pre-wrap break-words" key={`${part}-${index}`}>
            {part}
          </span>
        ),
      )}
    </>
  );
}
