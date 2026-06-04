import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { useCrewStore } from "../store/useCrewStore";
import { getToken } from "../api/client";

export function SettingsScreen() {
  const { team, currentMember, logout } = useCrewStore();
  const tokenExists = Boolean(getToken());

  return (
    <div className="space-y-3">
      <Card>
        <p className="text-sm text-crew-muted">Текущий участник</p>
        <h2 className="mt-1 text-xl font-bold">{currentMember?.avatarEmoji} {currentMember?.name}</h2>
        <p className="text-sm text-crew-muted">{currentMember?.role}</p>
      </Card>
      <Card>
        <p className="text-sm text-crew-muted">Команда</p>
        <h2 className="mt-1 text-xl font-bold">{team?.name}</h2>
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span>API connected</span>
          <Badge tone="success">Да</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Token exists</span>
          <Badge tone={tokenExists ? "success" : "danger"}>{tokenExists ? "Да" : "Нет"}</Badge>
        </div>
      </Card>
      <Button variant="secondary" className="w-full" onClick={logout}>Выйти</Button>
      <Button variant="danger" className="w-full" onClick={logout}>Очистить локальную сессию</Button>
    </div>
  );
}
