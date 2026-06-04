import { useEffect, useMemo, useState } from "react";
import type { ApiError } from "../api/client";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { useCrewStore } from "../store/useCrewStore";
import type { ImportPreviewItem, ImportPreviewTask } from "../types";
import { toDateInput } from "../utils/date";

const selectClass =
  "min-h-11 w-full rounded-lg border border-white/10 bg-crew-card px-3 text-base text-white outline-none";

const example = `1. понедельник reels
Тема: ретинол
Заметки: снять видео, референс https://example.com

2. вторник пост
Тема: до/после
Заметки: карусель, нужен дизайн`;

const formatOptions = ["post", "reels", "stories", "carousel"];
const contentStatusOptions = ["idea", "in_work", "review", "ready", "published"];
const taskStatusOptions = ["new", "in_progress", "review", "done", "blocked"];
const priorityOptions = ["low", "normal", "high", "urgent"];

export function ImportScreen() {
  const {
    projects,
    members,
    isLoading,
    error,
    importStep,
    importRawText,
    importProjectId,
    importPreviewItems,
    importPreviewTasks,
    setImportProject,
    setImportRawText,
    parseImportText,
    updateImportPreviewItem,
    deleteImportPreviewItem,
    addImportPreviewItem,
    updateImportPreviewTask,
    deleteImportPreviewTask,
    addImportPreviewTask,
    goToImportStep,
    confirmImport,
  } = useCrewStore();
  const [importError, setImportError] = useState<string | null>(null);

  const itemTitleByClientId = useMemo(
    () => new Map(importPreviewItems.map((item) => [item.clientId, item.title])),
    [importPreviewItems],
  );

  const tasksByItem = useMemo(
    () =>
      importPreviewItems.map((item) => ({
        item,
        tasks: importPreviewTasks.filter((task) => task.contentItemClientId === item.clientId),
      })),
    [importPreviewItems, importPreviewTasks],
  );

  const orphanTasks = useMemo(
    () => importPreviewTasks.filter((task) => !task.contentItemClientId),
    [importPreviewTasks],
  );

  function parse() {
    setImportError(null);
    parseImportText();
  }

  async function submit() {
    setImportError(null);

    try {
      await confirmImport();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.code === "VALIDATION_ERROR") {
        console.error("Import validation details", apiError.details);
        setImportError("Не удалось создать публикации: проверьте выбранный проект и данные импорта");
        return;
      }

      setImportError(error instanceof Error ? error.message : "Не удалось создать публикации");
    }
  }

  function addTask(contentItemClientId?: string | null) {
    addImportPreviewTask({
      contentItemClientId: contentItemClientId ?? importPreviewItems[0]?.clientId ?? null,
      title: "Новая задача",
      status: "new",
      priority: "normal",
    });
  }

  function addItem() {
    addImportPreviewItem({
      title: "Новая публикация",
      format: "post",
      status: "idea",
    });
  }

  const shownError = importError || error;

  useEffect(() => {
    if (!importRawText) setImportRawText(example);
  }, [importRawText, setImportRawText]);

  return (
    <div className="space-y-3">
      {importStep === "text" ? (
        <Card className="space-y-3">
          <select
            className={selectClass}
            value={importProjectId ?? ""}
            onChange={(event) => {
              setImportProject(event.target.value || null);
              setImportError(null);
            }}
          >
            <option value="">Выберите проект</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Textarea
            rows={9}
            placeholder="Вставьте контент-план"
            value={importRawText}
            onChange={(event) => setImportRawText(event.target.value)}
            className="text-base"
          />
          <Button className="w-full" disabled={!importRawText.trim()} onClick={parse}>
            Разобрать
          </Button>
          {shownError ? <p className="text-sm text-red-300">{shownError}</p> : null}
        </Card>
      ) : null}

      {importStep === "items" ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-white">Предпросмотр публикаций</h2>
            <p className="text-sm text-crew-muted">Проверьте публикации перед созданием</p>
          </div>

          {importPreviewItems.length ? (
            importPreviewItems.map((item, index) => (
              <PreviewItemCard
                key={item.clientId}
                index={index}
                item={item}
                onChange={(patch) => updateImportPreviewItem(item.clientId, patch)}
                onDelete={() => deleteImportPreviewItem(item.clientId)}
              />
            ))
          ) : (
            <EmptyState title="Публикаций нет">Добавьте публикацию вручную или вернитесь к тексту.</EmptyState>
          )}

          <Button variant="secondary" className="w-full" onClick={addItem}>
            Добавить публикацию
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => goToImportStep("text")}>
              Назад
            </Button>
            <Button onClick={() => goToImportStep("tasks")}>Далее: задачи</Button>
          </div>
          {shownError ? <p className="text-sm text-red-300">{shownError}</p> : null}
        </div>
      ) : null}

      {importStep === "tasks" ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-white">Предпросмотр задач</h2>
            <p className="text-sm text-crew-muted">Удалите лишние задачи или отредактируйте их до создания</p>
          </div>

          {tasksByItem.map(({ item, tasks }) => (
            <div key={item.clientId} className="space-y-2">
              <p className="text-sm font-semibold text-white">Публикация: {item.title}</p>
              {tasks.length ? (
                tasks.map((task) => (
                  <PreviewTaskCard
                    key={task.clientId}
                    task={task}
                    items={importPreviewItems}
                    members={members}
                    linkedTitle={itemTitleByClientId.get(task.contentItemClientId ?? "") ?? null}
                    onChange={(patch) => updateImportPreviewTask(task.clientId, patch)}
                    onDelete={() => deleteImportPreviewTask(task.clientId)}
                  />
                ))
              ) : (
                <p className="rounded-lg border border-white/10 px-3 py-2 text-sm text-crew-muted">Задач для публикации нет</p>
              )}
              <Button variant="secondary" className="w-full" onClick={() => addTask(item.clientId)}>
                Добавить задачу к публикации
              </Button>
            </div>
          ))}

          {orphanTasks.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Задачи без публикации</p>
              {orphanTasks.map((task) => (
                <PreviewTaskCard
                  key={task.clientId}
                  task={task}
                  items={importPreviewItems}
                  members={members}
                  linkedTitle={null}
                  onChange={(patch) => updateImportPreviewTask(task.clientId, patch)}
                  onDelete={() => deleteImportPreviewTask(task.clientId)}
                />
              ))}
            </div>
          ) : null}

          <Button variant="secondary" className="w-full" onClick={() => addTask(null)}>
            Добавить задачу
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => goToImportStep("items")}>
              Назад к публикациям
            </Button>
            <Button disabled={isLoading} onClick={() => void submit()}>
              Создать публикации и задачи
            </Button>
          </div>
          {shownError ? <p className="text-sm text-red-300">{shownError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function PreviewItemCard({
  index,
  item,
  onChange,
  onDelete,
}: {
  index: number;
  item: ImportPreviewItem;
  onChange: (patch: Partial<ImportPreviewItem>) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">Публикация {index + 1}</p>
        <Button variant="danger" className="min-h-9 px-3 py-1" onClick={onDelete}>
          Удалить
        </Button>
      </div>
      <Input
        value={item.title}
        onChange={(event) => onChange({ title: event.target.value, topic: event.target.value })}
        className="text-base"
      />
      <div className="grid grid-cols-2 gap-2">
        <select className={selectClass} value={item.format} onChange={(event) => onChange({ format: event.target.value })}>
          {formatOptions.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={toDateInput(item.publishDate)}
          onChange={(event) => onChange({ publishDate: event.target.value || null })}
          className="text-base"
        />
      </div>
      <Textarea value={item.notes ?? ""} onChange={(event) => onChange({ notes: event.target.value })} className="text-base" />
      <Input
        placeholder="Reference URL"
        value={item.referenceUrl ?? ""}
        onChange={(event) => onChange({ referenceUrl: event.target.value })}
        className="text-base"
      />
      <select className={selectClass} value={item.status ?? "idea"} onChange={(event) => onChange({ status: event.target.value })}>
        {contentStatusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </Card>
  );
}

function PreviewTaskCard({
  task,
  items,
  members,
  linkedTitle,
  onChange,
  onDelete,
}: {
  task: ImportPreviewTask;
  items: ImportPreviewItem[];
  members: Array<{ id: string; name: string; isActive: boolean }>;
  linkedTitle: string | null;
  onChange: (patch: Partial<ImportPreviewTask>) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 break-words text-sm text-crew-muted">
          Связь: {linkedTitle ?? "без публикации"}
        </p>
        <Button variant="danger" className="min-h-9 px-3 py-1" onClick={onDelete}>
          Удалить
        </Button>
      </div>
      <Input value={task.title} onChange={(event) => onChange({ title: event.target.value })} className="text-base" />
      <Textarea
        value={task.description ?? ""}
        onChange={(event) => onChange({ description: event.target.value || null })}
        className="text-base"
      />
      <select
        className={selectClass}
        value={task.contentItemClientId ?? ""}
        onChange={(event) => onChange({ contentItemClientId: event.target.value || null })}
      >
        <option value="">Без публикации</option>
        {items.map((item) => (
          <option key={item.clientId} value={item.clientId}>
            {item.title}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={task.assigneeId ?? ""}
        onChange={(event) => onChange({ assigneeId: event.target.value || null })}
      >
        <option value="">Без исполнителя</option>
        {members.filter((member) => member.isActive).map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <Input
        type="date"
        value={toDateInput(task.dueDate)}
        onChange={(event) => onChange({ dueDate: event.target.value || null })}
        className="text-base"
      />
      <div className="grid grid-cols-2 gap-2">
        <select className={selectClass} value={task.status ?? "new"} onChange={(event) => onChange({ status: event.target.value })}>
          {taskStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={task.priority ?? "normal"}
          onChange={(event) => onChange({ priority: event.target.value })}
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
