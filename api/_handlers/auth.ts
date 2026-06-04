import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { readBody, sendError, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http";
import { passwordMatches } from "../_lib/password";
import { signSession } from "../_lib/auth";
import { ensureDefaultTeam } from "./bootstrap";

const loginSchema = z.object({
  password: z.string().min(1),
  memberId: z.string().optional(),
});

export async function login(req: ApiRequest, res: ApiResponse) {
  const input = loginSchema.parse(await readBody(req));

  if (!passwordMatches(input.password)) {
    sendError(res, 401, "Неверный пароль");
    return;
  }

  const team = await ensureDefaultTeam();
  const members = await prisma.member.findMany({
    where: { teamId: team.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!input.memberId) {
    sendJson(res, 200, { requiresMemberSelection: true, team, members });
    return;
  }

  const member = members.find((item) => item.id === input.memberId);
  if (!member) {
    sendError(res, 400, "Участник не найден");
    return;
  }

  const token = signSession({ teamId: team.id, memberId: member.id });
  sendJson(res, 200, { token, team, member, members });
}

export async function me(_req: ApiRequest, res: ApiResponse, auth: AuthContext) {
  const [team, member, members] = await Promise.all([
    prisma.team.findUnique({ where: { id: auth.teamId } }),
    prisma.member.findFirst({ where: { id: auth.memberId, teamId: auth.teamId } }),
    prisma.member.findMany({ where: { teamId: auth.teamId }, orderBy: { createdAt: "asc" } }),
  ]);

  sendJson(res, 200, { team, member, members });
}
