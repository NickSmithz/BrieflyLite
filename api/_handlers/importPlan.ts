import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { normalizeDate, readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http";

const itemSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  format: z.string().min(1),
  publishDate: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  referenceUrl: z.string().nullable().optional(),
  status: z.string().optional(),
});

const taskSchema = z.object({
  projectId: z.string().min(1),
  contentItemIndex: z.number().int().nonnegative().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export async function confirmImport(req: ApiRequest, res: ApiResponse, auth: AuthContext) {
  const body = z
    .object({
      projectId: z.string().min(1),
      rawText: z.string().optional(),
      items: z.array(itemSchema),
      tasks: z.array(taskSchema).default([]),
    })
    .parse(await readBody(req));

  const result = await prisma.$transaction(async (tx) => {
    const contentItems = [];
    for (const item of body.items) {
      contentItems.push(
        await tx.contentItem.create({
          data: {
            ...item,
            projectId: body.projectId,
            teamId: auth.teamId,
            publishDate: normalizeDate(item.publishDate),
          },
        }),
      );
    }

    const tasks = [];
    for (const task of body.tasks) {
      const contentItemId =
        task.contentItemIndex === undefined ? null : contentItems[task.contentItemIndex]?.id ?? null;
      tasks.push(
        await tx.task.create({
          data: {
            projectId: body.projectId,
            teamId: auth.teamId,
            contentItemId,
            title: task.title,
            description: task.description,
            assigneeId: task.assigneeId,
            dueDate: normalizeDate(task.dueDate),
            status: task.status ?? "new",
            priority: task.priority ?? "normal",
          },
        }),
      );
    }

    return { contentItems, tasks };
  });

  sendJson(res, 201, result);
}
