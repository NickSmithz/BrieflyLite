export type ApiRequest = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  on?: (event: string, cb: (chunk?: Buffer) => void) => void;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

export type AuthContext = {
  teamId: string;
  memberId: string;
};

export function sendJson(res: ApiResponse, status: number, body: unknown) {
  res.status(status).json(body);
}

export function sendError(res: ApiResponse, status: number, error: string) {
  sendJson(res, status, { error });
}

export async function readBody<T = unknown>(req: ApiRequest): Promise<T> {
  if (req.body && typeof req.body === "object") return req.body as T;
  if (typeof req.body === "string") return JSON.parse(req.body) as T;

  return new Promise((resolve, reject) => {
    let raw = "";
    req.on?.("data", (chunk) => {
      raw += chunk?.toString() ?? "";
    });
    req.on?.("end", () => {
      if (!raw) {
        resolve({} as T);
        return;
      }
      try {
        resolve(JSON.parse(raw) as T);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function getPath(req: ApiRequest): string {
  const rawPath = req.query?.path;
  if (Array.isArray(rawPath)) return `/${rawPath.join("/")}`;
  if (rawPath) return `/${rawPath}`;

  const url = new URL(req.url ?? "/", "http://localhost");
  return url.pathname.replace(/^\/api/, "") || "/";
}

export function getSearch(req: ApiRequest) {
  return new URL(req.url ?? "/", "http://localhost").searchParams;
}

export function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

export function normalizeDate(value: unknown) {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
