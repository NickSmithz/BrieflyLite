import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http.js";
import { passwordMatches } from "../_lib/password.js";
import { signSession } from "../_lib/auth.js";
import { ensureDefaultTeam } from "./bootstrap.js";

const loginSchema = z.object({
  password: z.string().min(1),
  memberId: z.string().optional(),
});

export async function handleLogin(req: ApiRequest, res: ApiResponse) {
  const input = loginSchema.parse(await readBody(req));

  if (!process.env.TEAM_PASSWORD && !process.env.TEAM_PASSWORD_HASH) {
    sendJson(res, 500, {
      error: "TEAM_PASSWORD is not configured",
      code: "TEAM_PASSWORD_MISSING",
    });
    return;
  }

  if (!passwordMatches(input.password)) {
    sendJson(res, 401, {
      error: "Неверный пароль команды",
      code: "INVALID_TEAM_PASSWORD",
    });
    return;
  }

  if (!process.env.JWT_SECRET) {
    sendJson(res, 500, {
      error: "JWT_SECRET is not configured",
      code: "JWT_SECRET_MISSING",
    });
    return;
  }

  try {
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
      sendJson(res, 400, {
        error: "Участник не найден",
        code: "MEMBER_NOT_FOUND",
      });
      return;
    }

    const token = signSession({ teamId: team.id, memberId: member.id });
    sendJson(res, 200, { token, team, member, members });
  } catch (error) {
    console.error("Auth login database error", error);
    sendJson(res, 500, {
      error: "Auth database operation failed",
      code: "AUTH_DB_ERROR",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export const login = handleLogin;

export async function me(_req: ApiRequest, res: ApiResponse, auth: AuthContext) {
  const [team, member, members] = await Promise.all([
    prisma.team.findUnique({ where: { id: auth.teamId } }),
    prisma.member.findFirst({ where: { id: auth.memberId, teamId: auth.teamId } }),
    prisma.member.findMany({ where: { teamId: auth.teamId }, orderBy: { createdAt: "asc" } }),
  ]);

  sendJson(res, 200, { team, member, members });
}
