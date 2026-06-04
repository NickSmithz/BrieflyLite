import { useState } from "react";
import type { Member } from "../types";
import { useCrewStore } from "../store/useCrewStore";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function LoginScreen() {
  const { login, isLoading, error } = useCrewStore();
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  async function submit(memberId?: string) {
    const result = await login(password, memberId);
    if ("requiresMemberSelection" in result) setMembers(result.members);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-crew-accentSoft">Briefly Crew</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">Операционка для контент-команды</h1>
        <p className="mt-3 text-crew-muted">Проекты, контент-план, задачи и дедлайны в одном мобильном интерфейсе.</p>
      </div>

      <Card>
        {!members.length ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label className="block text-sm font-semibold">Пароль команды</label>
            <Input
              autoFocus
              placeholder="Введите пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button className="w-full" disabled={isLoading || !password}>
              Войти
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="font-semibold">Выберите себя</p>
            <div className="grid gap-2">
              {members.map((member) => (
                <Button key={member.id} variant="secondary" className="justify-start text-left" onClick={() => void submit(member.id)}>
                  {member.avatarEmoji} {member.name} · {member.role}
                </Button>
              ))}
            </div>
          </div>
        )}
        {error ? <p className="mt-3 text-sm text-crew-danger">{error}</p> : null}
      </Card>
    </main>
  );
}
