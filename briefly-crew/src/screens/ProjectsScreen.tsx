import { useState } from "react";
import { Archive, Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { Textarea } from "../components/Textarea";
import { useCrewStore } from "../store/useCrewStore";
import { formatDate } from "../utils/date";

export function ProjectsScreen() {
  const { projects, tasks, contentItems, createProject, updateProject, setSelectedProject } = useCrewStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", clientName: "", description: "", color: "#6D4CFF" });

  async function submit() {
    await createProject(form);
    setForm({ name: "", clientName: "", description: "", color: "#6D4CFF" });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={() => setOpen(true)}><Plus size={18} /> Создать проект</Button>
      {projects.length ? projects.map((project) => {
        const projectTasks = tasks.filter((task) => task.projectId === project.id);
        const nextItem = contentItems.find((item) => item.projectId === project.id && item.publishDate);
        return (
          <Card key={project.id} className="space-y-3">
            <button className="w-full text-left" onClick={() => setSelectedProject(project.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{project.name}</h2>
                  <p className="text-sm text-crew-muted">{project.clientName || "Без клиента"}</p>
                </div>
                <Badge tone="success">Активен</Badge>
              </div>
              <p className="mt-2 text-sm text-crew-muted">{projectTasks.length} задач · ближайшая: {formatDate(nextItem?.publishDate)}</p>
            </button>
            <Button variant="ghost" className="px-0 text-crew-muted" onClick={() => void updateProject(project.id, { archived: true })}>
              <Archive size={16} /> Архивировать
            </Button>
          </Card>
        );
      }) : <EmptyState title="Проектов пока нет">Создайте первый проект для контент-плана.</EmptyState>}

      <Modal title="Новый проект" open={open} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <Input placeholder="Название" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Клиент" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
          <Textarea placeholder="Описание" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <Input placeholder="Цвет" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          <Button className="w-full" disabled={!form.name} onClick={() => void submit()}>Создать</Button>
        </div>
      </Modal>
    </div>
  );
}
