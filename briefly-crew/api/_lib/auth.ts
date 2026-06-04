import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { ApiRequest, AuthContext } from "./http";

const secret = () => process.env.JWT_SECRET || "change-me";

export function signSession(payload: AuthContext) {
  return jwt.sign(payload, secret(), { expiresIn: "30d" });
}

export async function requireAuth(req: ApiRequest): Promise<AuthContext> {
  const header = req.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  const token = value?.startsWith("Bearer ") ? value.slice(7) : "";

  if (!token) throw new Error("Unauthorized");

  const payload = jwt.verify(token, secret()) as AuthContext;
  if (!payload.teamId || !payload.memberId) throw new Error("Unauthorized");

  const member = await prisma.member.findFirst({
    where: { id: payload.memberId, teamId: payload.teamId, isActive: true },
  });

  if (!member) throw new Error("Unauthorized");
  return { teamId: payload.teamId, memberId: payload.memberId };
}
