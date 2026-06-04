import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { useCrewStore } from "../store/useCrewStore";
import type { Member } from "../types";

export function TeamScreen() {
  const { members, createMember, updateMember } = useCrewStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ name: "", role: "", avatarEmoji: "" });

  function startEdit(member: Member) {
    setEditing(member);
    setForm({ name: member.name, role: member.role, avatarEmoji: member.avatarEmoji ?? "" });
    setOpen(true);
  }

  async function submit() {
    if (editing) {
      await updateMember(editing.id, form);
    } else {
      await createMember(form);
    }
    setEditing(null);
    setForm({ name: "", role: "", avatarEmoji: "" });
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={() => setOpen(true)}><Plus size={18} /> Добавить участника</Button>
      {members.map((member) => (
        <Card key={member.id} className={member.isActive ? "" : "opacity-55"}>
          <button className="w-full text-left" onClick={() => startEdit(member)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{member.avatarEmoji} {member.name}</h2>
                <p className="text-sm text-crew-muted">{member.role}</p>
              </div>
              <Badge tone={member.isActive ? "success" : "default"}>{member.isActive ? "Активен" : "Отключен"}</Badge>
            </div>
          </button>
          {member.isActive ? (
            <Button variant="ghost" className="mt-3 px-0 text-crew-danger" onClick={() => void updateMember(member.id, { isActive: false })}>
              Отключить
            </Button>
          ) : null}
        </Card>
      ))}

      <Modal title={editing ? "Участник" : "Новый участник"} open={open} onClose={() => { setOpen(false); setEditing(null); }}>
        <div className="space-y-3">
          <Input placeholder="Имя" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Роль" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
          <Input placeholder="Emoji" value={form.avatarEmoji} onChange={(event) => setForm({ ...form, avatarEmoji: event.target.value })} />
          <Button className="w-full" disabled={!form.name || !form.role} onClick={() => void submit()}>
            {editing ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
