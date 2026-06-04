import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { normalizeDate, readBody, sendJson, type ApiRequest, type ApiResponse, type AuthContext } from "../_lib/http.js";

const itemSchema = z.object({
  clientId: z.string().optional(),
  title: z.string().min(1),
  format: z.string().optional(),
  publishDate: z.string().nullable().optional(),
  topic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  referenceUrl: z.string().nullable().optional(),
  status: z.string().optional(),
});

const taskSchema = z.object({
  clientId: z.string().optional(),
  contentItemClientId: z.string().nullable().optional(),
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
  let rawBody: unknown;
  try {
    rawBody = await readBody(req);
  } catch (error) {
    sendJson(res, 400, {
      error: "Invalid import payload",
      code: "VALIDATION_ERROR",
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  const bodyResult = confirmImportSchema.safeParse(rawBody);

  if (!bodyResult.success) {
    sendJson(res, 400, {
      error: "Invalid import payload",
      code: "VALIDATION_ERROR",
      details: bodyResult.error.errors,
    });
    return;
  }

  const body = bodyResult.data;
  try {
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
      const contentItemIdByClientId = new Map<string, string>();
      for (const item of body.items) {
        const contentItem = await tx.contentItem.create({
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
        });
        contentItems.push(contentItem);
        if (item.clientId) contentItemIdByClientId.set(item.clientId, contentItem.id);
      }

      const tasks = [];
      for (const task of body.tasks) {
        const contentItemIndex = task.contentItemClientIndex ?? task.contentItemIndex;
        const contentItemId =
          (task.contentItemClientId ? contentItemIdByClientId.get(task.contentItemClientId) : null) ??
          (contentItemIndex === undefined ? null : contentItems[contentItemIndex]?.id ?? null);
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
  } catch (error) {
    console.error("Import confirm failed", error);
    sendJson(res, 500, {
      error: "Import confirm failed",
      code: "IMPORT_CONFIRM_FAILED",
    });
  }
}
