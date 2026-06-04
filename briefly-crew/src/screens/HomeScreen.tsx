import { CalendarDays, Download, ListTodo, Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { useCrewStore } from "../store/useCrewStore";
import { formatDate, isOverdue, isToday } from "../utils/date";

export function HomeScreen() {
  const { currentMember, tasks, contentItems, setActiveTab } = useCrewStore();
  const myTasks = tasks.filter((task) => task.assigneeId === currentMember?.id && task.status !== "done");
  const today = myTasks.filter((task) => isToday(task.dueDate));
  const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status));
  const review = tasks.filter((task) => task.status === "review");
  const done = tasks.filter((task) => task.status === "done");
  const upcoming = contentItems.filter((item) => item.publishDate).slice(0, 4);

  return (
    <div className="space-y-4">
      <Card className="bg-crew-accent">
        <p className="text-sm text-white/80">Привет, {currentMember?.name}</p>
        <h2 className="mt-1 text-2xl font-black">Что двигаем сегодня?</h2>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-2xl font-black">{today.length}</p><p className="text-sm text-crew-muted">мои сегодня</p></Card>
        <Card><p className="text-2xl font-black text-crew-danger">{overdue.length}</p><p className="text-sm text-crew-muted">просрочены</p></Card>
        <Card><p className="text-2xl font-black text-crew-warning">{review.length}</p><p className="text-sm text-crew-muted">на проверке</p></Card>
        <Card><p className="text-2xl font-black text-crew-success">{done.length}</p><p className="text-sm text-crew-muted">готово</p></Card>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={() => setActiveTab("tasks")}><Plus className="mx-auto" size={18} />Задача</Button>
        <Button variant="secondary" onClick={() => setActiveTab("import")}><Download className="mx-auto" size={18} />Импорт</Button>
        <Button variant="secondary" onClick={() => setActiveTab("tasks")}><ListTodo className="mx-auto" size={18} />Мои</Button>
      </div>

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} />
          <h2 className="font-bold">Ближайшие публикации</h2>
        </div>
        {upcoming.length ? upcoming.map((item) => (
          <Card key={item.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-crew-muted">{formatDate(item.publishDate)} · {item.format}</p>
            </div>
            <Badge tone="accent">{item.status}</Badge>
          </Card>
        )) : <EmptyState title="План пока пуст">Импортируйте контент-план или добавьте публикацию вручную.</EmptyState>}
      </section>
    </div>
  );
}
