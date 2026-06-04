import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http";

const projectSchema = z.object({
  name: z.string().min(1),
  clientName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  archived: z.boolean().optional(),
});

export async function projects(req: ApiRequest, res: ApiResponse, auth: AuthContext, id?: string) {
  if (req.method === "GET") {
    const items = await prisma.project.findMany({
      where: { teamId: auth.teamId, archived: false },
      orderBy: { createdAt: "desc" },
    });
    sendJson(res, 200, items);
    return;
  }

  if (req.method === "POST") {
    const input = projectSchema.parse(await readBody(req));
    const item = await prisma.project.create({ data: { ...input, teamId: auth.teamId } });
    sendJson(res, 201, item);
    return;
  }

  if (req.method === "PATCH" && id) {
    const input = projectSchema.partial().parse(await readBody(req));
    const item = await prisma.project.update({ where: { id, teamId: auth.teamId }, data: input });
    sendJson(res, 200, item);
    return;
  }

  if (req.method === "DELETE" && id) {
    const item = await prisma.project.update({ where: { id, teamId: auth.teamId }, data: { archived: true } });
    sendJson(res, 200, item);
  }
}
