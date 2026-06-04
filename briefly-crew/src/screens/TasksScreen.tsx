import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { LinkifiedText } from "../components/LinkifiedText";
import { Modal } from "../components/Modal";
import { Textarea } from "../components/Textarea";
import { useCrewStore } from "../store/useCrewStore";
import { formatDate, isOverdue, isThisWeek, isToday, toDateInput } from "../utils/date";

type Filter = "mine" | "all" | "today" | "week" | "overdue" | "done";

const filters: Array<[Filter, string]> = [
  ["mine", "Мои"],
  ["all", "Все"],
  ["today", "Сегодня"],
  ["week", "Неделя"],
  ["overdue", "Просроченные"],
  ["done", "Готовые"],
];

const statuses = [
  ["new", "Новая"],
  ["in_progress", "В работе"],
  ["review", "На проверке"],
  ["done", "Готово"],
  ["blocked", "Блокер"],
];

const selectClass = "min-h-11 w-full rounded-lg border border-white/10 bg-crew-card px-3 text-white outline-none";

export function TasksScreen() {
  const { currentMember, projects, members, tasks, contentItems, createTask, updateTask, updateTaskStatus, deleteTask } = useCrewStore();
  const [filter, setFilter] = useState<Filter>("mine");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    assigneeId: currentMember?.id ?? "",
    dueDate: "",
    status: "new",
  });

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "mine") return task.assigneeId === currentMember?.id && task.status !== "done";
    if (filter === "today") return isToday(task.dueDate);
    if (filter === "week") return isThisWeek(task.dueDate);
    if (filter === "overdue") return isOverdue(task.dueDate, task.status);
    if (filter === "done") return task.status === "done";
    return true;
  }), [tasks, filter, currentMember?.id]);

  async function submit() {
    await createTask({ ...form, assigneeId: form.assigneeId || null, dueDate: form.dueDate || null });
    setForm({ projectId: "", title: "", description: "", assigneeId: currentMember?.id ?? "", dueDate: "", status: "new" });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={() => setOpen(true)}><Plus size={18} /> Добавить задачу</Button>
      <div className="-mx-3 overflow-x-auto px-3">
        <div className="flex min-w-max gap-2">
          {filters.map(([value, label]) => (
            <button
              key={value}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "bg-crew-accent text-white" : "bg-white/10 text-crew-muted"}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visibleTasks.length ? visibleTasks.map((task) => {
        const project = projects.find((item) => item.id === task.projectId);
        const assignee = members.find((member) => member.id === task.assigneeId);
        const contentItem = contentItems.find((item) => item.id === task.contentItemId);
        const overdue = isOverdue(task.dueDate, task.status);
        return (
          <Card key={task.id} className={`space-y-3 ${overdue ? "border-crew-danger/60" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{task.title}</h2>
                <p className="text-sm text-crew-muted">{project?.name || "Проект"} · {assignee ? `${assignee.avatarEmoji ?? ""} ${assignee.name}` : "Без ответственного"}</p>
              </div>
              <Badge tone={task.status === "done" ? "success" : overdue ? "danger" : task.status === "review" ? "warning" : "default"}>
                {statuses.find(([value]) => value === task.status)?.[1] ?? task.status}
              </Badge>
            </div>
            <p className={`text-sm ${overdue ? "text-crew-danger" : "text-crew-muted"}`}>Дедлайн: {formatDate(task.dueDate)}</p>
            {task.description ? <p className="text-sm text-crew-muted"><LinkifiedText text={task.description} /></p> : null}
            {contentItem?.notes || contentItem?.referenceUrl ? (
              <p className="text-sm text-crew-muted"><LinkifiedText text={[contentItem.notes, contentItem.referenceUrl].filter(Boolean).join("\n")} /></p>
            ) : null}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <select className={selectClass} value={task.status} onChange={(event) => void updateTaskStatus(task.id, event.target.value)}>
                {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <Button variant="danger" className="px-3" onClick={() => void deleteTask(task.id)} title="Удалить">
                <Trash2 size={18} />
              </Button>
            </div>
          </Card>
        );
      }) : <EmptyState title="Задач нет">Создайте задачу вручную или импортируйте контент-план.</EmptyState>}

      <Modal title="Новая задача" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <select className={selectClass} value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>
            <option value="">Выберите проект</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <Input placeholder="Название задачи" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Textarea placeholder="Описание / заметки / референс" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select className={selectClass} value={form.assigneeId} onChange={(event) => setForm({ ...form, assigneeId: event.target.value })}>
            <option value="">Без ответственного</option>
            {members.filter((member) => member.isActive).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={toDateInput(form.dueDate)} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            <select className={selectClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <Button className="w-full" disabled={!form.projectId || !form.title} onClick={() => void submit()}>Создать</Button>
        </div>
      </Modal>
    </div>
  );
}
