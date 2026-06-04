import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { getSearch, normalizeDate, readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http.js";

const taskSchema = z.object({
  projectId: z.string().min(1),
  contentItemId: z.string().nullable().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

function toCreate(input: z.infer<typeof taskSchema>, teamId: string) {
  return {
    ...input,
    teamId,
    dueDate: normalizeDate(input.dueDate),
  };
}

export async function tasks(req: ApiRequest, res: ApiResponse, auth: AuthContext, id?: string) {
  if (req.method === "GET") {
    const search = getSearch(req);
    const items = await prisma.task.findMany({
      where: {
        teamId: auth.teamId,
        projectId: search.get("projectId") || undefined,
        assigneeId: search.get("assigneeId") || undefined,
        status: search.get("status") || undefined,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
    sendJson(res, 200, items);
    return;
  }

  if (req.method === "POST" && id === "bulk") {
    const body = z.object({ tasks: z.array(taskSchema) }).parse(await readBody(req));
    const items = await prisma.task.createManyAndReturn({
      data: body.tasks.map((item) => toCreate(item, auth.teamId)),
    });
    sendJson(res, 201, items);
    return;
  }

  if (req.method === "POST") {
    const input = taskSchema.parse(await readBody(req));
    const item = await prisma.task.create({ data: toCreate(input, auth.teamId) });
    sendJson(res, 201, item);
    return;
  }

  if (req.method === "PATCH" && id) {
    const input = taskSchema.partial().parse(await readBody(req));
    const item = await prisma.task.update({
      where: { id, teamId: auth.teamId },
      data: { ...input, dueDate: input.dueDate === undefined ? undefined : normalizeDate(input.dueDate) },
    });
    sendJson(res, 200, item);
    return;
  }

  if (req.method === "DELETE" && id) {
    await prisma.task.delete({ where: { id, teamId: auth.teamId } });
    sendJson(res, 200, { ok: true });
  }
}
