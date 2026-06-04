import { ArrowLeft, Download, Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { LinkifiedText } from "../components/LinkifiedText";
import { useCrewStore } from "../store/useCrewStore";
import { formatDate } from "../utils/date";

export function ProjectDetailScreen() {
  const { selectedProjectId, projects, contentItems, tasks, members, setSelectedProject, setActiveTab } = useCrewStore();
  const project = projects.find((item) => item.id === selectedProjectId);
  const projectItems = contentItems.filter((item) => item.projectId === selectedProjectId).slice(0, 5);
  const projectTasks = tasks.filter((task) => task.projectId === selectedProjectId).slice(0, 8);

  if (!project) return null;

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="px-0" onClick={() => setSelectedProject(null)}><ArrowLeft size={18} /> Назад</Button>
      <Card>
        <h2 className="text-2xl font-black">{project.name}</h2>
        <p className="text-crew-muted">{project.clientName || "Без клиента"}</p>
        {project.description ? <p className="mt-3 text-sm text-crew-muted"><LinkifiedText text={project.description} /></p> : null}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => setActiveTab("plan")}><Plus size={18} />Публикация</Button>
        <Button variant="secondary" onClick={() => setActiveTab("tasks")}><Plus size={18} />Задача</Button>
        <Button variant="secondary" onClick={() => setActiveTab("import")}><Download size={18} />Импорт</Button>
      </div>

      <section className="space-y-2">
        <h3 className="font-bold">Команда</h3>
        <div className="flex flex-wrap gap-2">{members.filter((member) => member.isActive).map((member) => <Badge key={member.id}>{member.avatarEmoji} {member.name}</Badge>)}</div>
      </section>

      <section className="space-y-2">
        <h3 className="font-bold">Ближайшие публикации</h3>
        {projectItems.length ? projectItems.map((item) => (
          <Card key={item.id}>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-crew-muted">{formatDate(item.publishDate)} · {item.format}</p>
          </Card>
        )) : <EmptyState title="Публикаций пока нет" />}
      </section>

      <section className="space-y-2">
        <h3 className="font-bold">Задачи проекта</h3>
        {projectTasks.length ? projectTasks.map((task) => (
          <Card key={task.id}>
            <p className="font-semibold">{task.title}</p>
            <p className="text-sm text-crew-muted">{formatDate(task.dueDate)} · {task.status}</p>
          </Card>
        )) : <EmptyState title="Задач пока нет" />}
      </section>
    </div>
  );
}
