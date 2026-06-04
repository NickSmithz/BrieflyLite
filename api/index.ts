import { requireAuth } from "./_lib/auth.js";
import { getPath, sendError, sendJson, splitPath, type ApiRequest, type ApiResponse } from "./_lib/http.js";
import { me } from "./_handlers/auth.js";
import { ensureDefaultTeam } from "./_handlers/bootstrap.js";
import { passwordMatches } from "./_lib/password.js";
import { readBody } from "./_lib/http.js";
import { projects } from "./_handlers/projects.js";
import { members } from "./_handlers/members.js";
import { contentItems } from "./_handlers/contentItems.js";
import { tasks } from "./_handlers/tasks.js";
import { confirmImport } from "./_handlers/importPlan.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.setHeader?.("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader?.("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    const pathname = getPath(req);
    const [root, id] = splitPath(pathname);

    if (root === "health") {
      sendJson(res, 200, { ok: true, time: new Date().toISOString() });
      return;
    }

    if (root === "debug-env" && req.method === "GET") {
      sendJson(res, 200, {
        ok: true,
        env: {
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          hasDirectUrl: Boolean(process.env.DIRECT_URL),
          hasTeamPassword: Boolean(process.env.TEAM_PASSWORD || process.env.TEAM_PASSWORD_HASH),
          hasJwtSecret: Boolean(process.env.JWT_SECRET),
          nodeEnv: process.env.NODE_ENV ?? "unknown",
        },
      });
      return;
    }

    if (pathname === "/auth/login" && req.method === "POST") {
      const { handleLogin } = await import("./_handlers/auth.js");
      await handleLogin(req, res);
      return;
    }

    if (root === "bootstrap" && req.method === "POST") {
      const body = await readBody<{ password?: string; bootstrapSecret?: string }>(req);
      const secret = process.env.BOOTSTRAP_SECRET;
      if (!passwordMatches(body.password ?? "") && (!secret || body.bootstrapSecret !== secret)) {
        sendError(res, 401, "Неверный пароль");
        return;
      }
      const team = await ensureDefaultTeam();
      sendJson(res, 200, { team, members: team.members });
      return;
    }

    const auth = await requireAuth(req);

    if (root === "auth" && id === "me" && req.method === "GET") {
      await me(req, res, auth);
      return;
    }

    if (root === "projects") {
      await projects(req, res, auth, id);
      return;
    }

    if (root === "members") {
      await members(req, res, auth, id);
      return;
    }

    if (root === "content-items") {
      await contentItems(req, res, auth, id);
      return;
    }

    if (root === "tasks") {
      await tasks(req, res, auth, id);
      return;
    }

    if (root === "import" && id === "confirm" && req.method === "POST") {
      await confirmImport(req, res, auth);
      return;
    }

    sendError(res, 404, "Not found");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    sendError(res, message === "Unauthorized" ? 401 : 500, message);
  }
}
