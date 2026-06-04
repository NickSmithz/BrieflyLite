import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { getSearch, normalizeDate, readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http.js";

const contentItemSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  format: z.string().min(1),
  publishDate: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  referenceUrl: z.string().nullable().optional(),
  status: z.string().optional(),
});

function toCreate(input: z.infer<typeof contentItemSchema>, teamId: string) {
  return {
    ...input,
    teamId,
    publishDate: normalizeDate(input.publishDate),
  };
}

export async function contentItems(req: ApiRequest, res: ApiResponse, auth: AuthContext, id?: string) {
  if (req.method === "GET") {
    const search = getSearch(req);
    const items = await prisma.contentItem.findMany({
      where: {
        teamId: auth.teamId,
        projectId: search.get("projectId") || undefined,
        status: search.get("status") || undefined,
        format: search.get("format") || undefined,
      },
      orderBy: [{ publishDate: "asc" }, { createdAt: "desc" }],
    });
    sendJson(res, 200, items);
    return;
  }

  if (req.method === "POST" && id === "bulk") {
    const body = z.object({ items: z.array(contentItemSchema) }).parse(await readBody(req));
    const items = await prisma.contentItem.createManyAndReturn({
      data: body.items.map((item) => toCreate(item, auth.teamId)),
    });
    sendJson(res, 201, items);
    return;
  }

  if (req.method === "POST") {
    const input = contentItemSchema.parse(await readBody(req));
    const item = await prisma.contentItem.create({ data: toCreate(input, auth.teamId) });
    sendJson(res, 201, item);
    return;
  }

  if (req.method === "PATCH" && id) {
    const input = contentItemSchema.partial().parse(await readBody(req));
    const item = await prisma.contentItem.update({
      where: { id, teamId: auth.teamId },
      data: { ...input, publishDate: input.publishDate === undefined ? undefined : normalizeDate(input.publishDate) },
    });
    sendJson(res, 200, item);
    return;
  }

  if (req.method === "DELETE" && id) {
    await prisma.contentItem.delete({ where: { id, teamId: auth.teamId } });
    sendJson(res, 200, { ok: true });
  }
}
