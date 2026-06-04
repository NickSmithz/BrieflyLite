import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { LinkifiedText } from "../components/LinkifiedText";
import { Modal } from "../components/Modal";
import { Textarea } from "../components/Textarea";
import { useCrewStore } from "../store/useCrewStore";
import { formatDate, toDateInput } from "../utils/date";

const statuses = [
  ["idea", "Идея"],
  ["in_work", "В работе"],
  ["review", "На проверке"],
  ["ready", "Готово"],
  ["published", "Опубликовано"],
];

const selectClass = "min-h-11 w-full rounded-lg border border-white/10 bg-crew-card px-3 text-white outline-none";

export function PlanScreen() {
  const { projects, contentItems, tasks, createContentItem, updateContentItem, setActiveTab } = useCrewStore();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ projectId: "", status: "", format: "" });
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    format: "post",
    publishDate: "",
    notes: "",
    referenceUrl: "",
    status: "idea",
  });

  const filtered = useMemo(() => contentItems.filter((item) => {
    if (filters.projectId && item.projectId !== filters.projectId) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.format && item.format !== filters.format) return false;
    return true;
  }), [contentItems, filters]);

  async function submit() {
    await createContentItem({ ...form, publishDate: form.publishDate || null });
    setOpen(false);
    setForm({ projectId: "", title: "", format: "post", publishDate: "", notes: "", referenceUrl: "", status: "idea" });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Добавить</Button>
        <Button variant="secondary" onClick={() => setActiveTab("import")}>Импорт плана</Button>
      </div>

      <div className="grid gap-2">
        <select className={selectClass} value={filters.projectId} onChange={(event) => setFilters({ ...filters, projectId: event.target.value })}>
          <option value="">Все проекты</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select className={selectClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">Все статусы</option>
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <Input placeholder="Формат" value={filters.format} onChange={(event) => setFilters({ ...filters, format: event.target.value })} />
        </div>
      </div>

      {filtered.length ? filtered.map((item) => {
        const project = projects.find((value) => value.id === item.projectId);
        const linkedTasks = tasks.filter((task) => task.contentItemId === item.id);
        return (
          <Card key={item.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-crew-muted">{formatDate(item.publishDate)} · {project?.name || "Проект"} · {item.format}</p>
                <h2 className="text-lg font-bold">{item.title}</h2>
              </div>
              <Badge tone="accent">{statuses.find(([value]) => value === item.status)?.[1] ?? item.status}</Badge>
            </div>
            {item.notes ? <p className="text-sm text-crew-muted"><LinkifiedText text={item.notes} /></p> : null}
            {item.referenceUrl ? <p className="text-sm"><LinkifiedText text={item.referenceUrl} /></p> : null}
            <div className="flex items-center gap-2">
              <select className={selectClass} value={item.status} onChange={(event) => void updateContentItem(item.id, { status: event.target.value })}>
                {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Badge>{linkedTasks.length} задач</Badge>
            </div>
          </Card>
        );
      }) : <EmptyState title="План пуст">Добавьте публикацию или импортируйте текстовый контент-план.</EmptyState>}

      <Modal title="Новая публикация" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <select className={selectClass} value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>
            <option value="">Выберите проект</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <Input placeholder="Тема" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Формат" value={form.format} onChange={(event) => setForm({ ...form, format: event.target.value })} />
            <Input type="date" value={toDateInput(form.publishDate)} onChange={(event) => setForm({ ...form, publishDate: event.target.value })} />
          </div>
          <Textarea placeholder="Заметки" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <Input placeholder="Референс URL" value={form.referenceUrl} onChange={(event) => setForm({ ...form, referenceUrl: event.target.value })} />
          <Button className="w-full" disabled={!form.projectId || !form.title} onClick={() => void submit()}>Создать</Button>
        </div>
      </Modal>
    </div>
  );
}
