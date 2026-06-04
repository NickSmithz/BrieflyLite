import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { normalizeDate, readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http.js";

const itemSchema = z.object({
  title: z.string().min(1),
  format: z.string().optional(),
  publishDate: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  referenceUrl: z.string().nullable().optional(),
  status: z.string().optional(),
});

const taskSchema = z.object({
  contentItemIndex: z.number().int().nonnegative().optional(),
  contentItemClientIndex: z.number().int().nonnegative().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
});

const confirmImportSchema = z.object({
  projectId: z.string().min(1),
  rawText: z.string().optional(),
  items: z.array(itemSchema),
  tasks: z.array(taskSchema).default([]),
});

export async function confirmImport(req: ApiRequest, res: ApiResponse, auth: AuthContext) {
  const bodyResult = confirmImportSchema.safeParse(await readBody(req));

  if (!bodyResult.success) {
    sendJson(res, 400, {
      error: "Invalid import payload",
      code: "VALIDATION_ERROR",
      details: bodyResult.error.errors,
    });
    return;
  }

  const body = bodyResult.data;
  const project = await prisma.project.findFirst({
    where: {
      id: body.projectId,
      teamId: auth.teamId,
    },
  });

  if (!project) {
    sendJson(res, 404, {
      error: "Project not found",
      code: "PROJECT_NOT_FOUND",
    });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    const contentItems = [];
    for (const item of body.items) {
      contentItems.push(
        await tx.contentItem.create({
          data: {
            teamId: auth.teamId,
            projectId: body.projectId,
            title: item.title,
            format: item.format || "post",
            publishDate: normalizeDate(item.publishDate),
            topic: item.topic || null,
            notes: item.notes || null,
            referenceUrl: item.referenceUrl || null,
            status: item.status || "idea",
          },
        }),
      );
    }

    const tasks = [];
    for (const task of body.tasks) {
      const contentItemIndex = task.contentItemClientIndex ?? task.contentItemIndex;
      const contentItemId = contentItemIndex === undefined ? null : contentItems[contentItemIndex]?.id ?? null;
      tasks.push(
        await tx.task.create({
          data: {
            teamId: auth.teamId,
            projectId: body.projectId,
            contentItemId,
            title: task.title,
            description: task.description || null,
            assigneeId: task.assigneeId || null,
            dueDate: normalizeDate(task.dueDate),
            status: task.status || "new",
            priority: task.priority || "normal",
          },
        }),
      );
    }

    return { contentItems, tasks };
  });

  sendJson(res, 201, result);
}
