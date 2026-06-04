import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http";

const memberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  avatarEmoji: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function members(req: ApiRequest, res: ApiResponse, auth: AuthContext, id?: string) {
  if (req.method === "GET") {
    const items = await prisma.member.findMany({ where: { teamId: auth.teamId }, orderBy: { createdAt: "asc" } });
    sendJson(res, 200, items);
    return;
  }

  if (req.method === "POST") {
    const input = memberSchema.parse(await readBody(req));
    const item = await prisma.member.create({ data: { ...input, teamId: auth.teamId } });
    sendJson(res, 201, item);
    return;
  }

  if (req.method === "PATCH" && id) {
    const input = memberSchema.partial().parse(await readBody(req));
    const item = await prisma.member.update({ where: { id, teamId: auth.teamId }, data: input });
    sendJson(res, 200, item);
  }
}
