import { useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { useCrewStore } from "../store/useCrewStore";
import type { ImportDraftItem } from "../types";
import { toDateInput } from "../utils/date";

const selectClass = "min-h-11 w-full rounded-lg border border-white/10 bg-crew-card px-3 text-white outline-none";

const example = `1. понедельник reels
Тема: ретинол
Заметки: снять видео, референс https://example.com

2. вторник пост
Тема: до/после
Заметки: карусель, нужен дизайн`;

export function ImportScreen() {
  const { projects, parseImportText, confirmImport, isLoading } = useCrewStore();
  const [projectId, setProjectId] = useState("");
  const [rawText, setRawText] = useState(example);
  const [items, setItems] = useState<ImportDraftItem[]>([]);

  function patchItem(index: number, input: Partial<ImportDraftItem>) {
    setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...input } : item));
  }

  async function submit() {
    await confirmImport(projectId, rawText, items);
    setItems([]);
    setRawText("");
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <select className={selectClass} value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          <option value="">Выберите проект</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <Textarea rows={9} placeholder="Вставьте контент-план" value={rawText} onChange={(event) => setRawText(event.target.value)} />
        <Button className="w-full" disabled={!rawText.trim()} onClick={() => setItems(parseImportText(rawText))}>Разобрать</Button>
      </Card>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={index} className="space-y-2">
              <p className="font-bold">Публикация {index + 1}</p>
              <Input value={item.title} onChange={(event) => patchItem(index, { title: event.target.value, topic: event.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input value={item.format} onChange={(event) => patchItem(index, { format: event.target.value })} />
                <Input type="date" value={toDateInput(item.publishDate)} onChange={(event) => patchItem(index, { publishDate: event.target.value || null })} />
              </div>
              <Textarea value={item.notes ?? ""} onChange={(event) => patchItem(index, { notes: event.target.value })} />
              <Input placeholder="Reference URL" value={item.referenceUrl ?? ""} onChange={(event) => patchItem(index, { referenceUrl: event.target.value })} />
            </Card>
          ))}
          <Button className="w-full" disabled={!projectId || isLoading} onClick={() => void submit()}>
            Создать публикации и задачи
          </Button>
        </div>
      ) : <EmptyState title="Preview появится после разбора">Проверьте строки перед созданием задач.</EmptyState>}
    </div>
  );
}
