import {
  createHmac,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { JournalEntry } from "../src/data/journal.js";
import type { JournalStore } from "./journal-store.js";

type Settings = {
  store: JournalStore | null;
  passwordHash?: string;
  secret?: string;
  production: boolean;
};
class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const cookieName = "codex_journal";
const equal = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function journalHandler(settings: Settings) {
  const { store, passwordHash, secret, production } = settings;
  const configured = Boolean(
    store && passwordHash && secret && secret.length >= 32,
  );
  const sign = (value: string) =>
    createHmac("sha256", secret!).update(value).digest("base64url");
  function session(req: IncomingMessage) {
    if (!configured) return false;
    const token = req.headers.cookie
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    if (!token) return false;
    const [value, signature] = token.split(".");
    if (!value || !signature || !equal(signature, sign(value))) return false;
    try {
      const data = JSON.parse(Buffer.from(value, "base64url").toString());
      return Number.isFinite(data.exp) && data.exp > Date.now();
    } catch {
      return false;
    }
  }
  function setCookie(res: ServerResponse, token: string, age: number) {
    res.setHeader(
      "Set-Cookie",
      `${cookieName}=${token}; Path=/api/journal; HttpOnly; SameSite=Strict; Max-Age=${age}${production ? "; Secure" : ""}`,
    );
  }
  async function body(req: IncomingMessage) {
    if (!req.headers["content-type"]?.startsWith("application/json"))
      throw new RequestError(415, "Use a JSON request.");
    const parsed = (req as IncomingMessage & { body?: unknown }).body;
    let input: unknown = parsed;
    if (parsed === undefined) {
      const chunks: Buffer[] = [];
      let length = 0;
      for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        length += buffer.length;
        if (length > 128000)
          throw new RequestError(413, "This entry is too long.");
        chunks.push(buffer);
      }
      input = Buffer.concat(chunks).toString("utf8");
    }
    if (typeof input === "string") {
      if (Buffer.byteLength(input) > 128000)
        throw new RequestError(413, "This entry is too long.");
      try {
        input = JSON.parse(input);
      } catch {
        throw new RequestError(400, "Invalid request.");
      }
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new RequestError(400, "Invalid request.");
    if (Buffer.byteLength(JSON.stringify(input)) > 128000)
      throw new RequestError(413, "This entry is too long.");
    return input as Record<string, unknown>;
  }
  function text(data: Record<string, unknown>, key: string, max: number) {
    const value = data[key];
    if (typeof value !== "string" || !value.trim() || value.length > max)
      throw new RequestError(
        400,
        `Check the ${key} field (maximum ${max} characters).`,
      );
    return value.trim();
  }
  return async (req: IncomingMessage, res: ServerResponse) => {
    const send = (status: number, value: unknown) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(value));
    };
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const url = new URL(
        req.url ?? "/api/journal",
        `http://${req.headers.host ?? "localhost"}`,
      );
      if (req.method === "GET") {
        if (url.searchParams.get("owner") === "1") {
          if (!configured)
            throw new RequestError(
              503,
              "The owner editor needs its server storage and master spell configured.",
            );
          if (!session(req))
            throw new RequestError(
              401,
              "Enter the master spell to unlock the journal.",
            );
          return send(200, {
            ...(await store!.read()),
            scope: production ? "live" : "local",
          });
        }
        const state = store ? await store.read() : { revision: 0, entries: [] };
        return send(200, {
          entries: state.entries.filter(
            (entry) => entry.status === "published",
          ),
        });
      }
      if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        throw new RequestError(405, "Method not allowed.");
      }
      // JSON plus an explicit same-origin header prevents cross-site form writes.
      if (req.headers["x-codex-journal"] !== "1")
        throw new RequestError(403, "Invalid editor request.");
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host)
        throw new RequestError(403, "Open the editor on this site.");
      if (req.headers["sec-fetch-site"] === "cross-site")
        throw new RequestError(403, "Open the editor on this site.");
      if (!configured)
        throw new RequestError(
          503,
          "The owner editor needs its server storage and master spell configured.",
        );
      const data = await body(req);
      if (data.action === "login") {
        // A shared global budget also bounds guessing across changing IPs.
        const count = await store!.attempt("login");
        if (count > 8) {
          res.setHeader("Retry-After", "900");
          throw new RequestError(
            429,
            "Too many attempts. Try again in 15 minutes.",
          );
        }
        const password = text(data, "password", 128);
        const [salt, expected] = passwordHash!.split(":");
        const actual = scryptSync(password, salt, 32).toString("hex");
        if (!expected || !equal(actual, expected))
          throw new RequestError(401, "That spell did not open the journal.");
        const value = Buffer.from(
          JSON.stringify({ exp: Date.now() + 3600000, nonce: randomUUID() }),
        ).toString("base64url");
        setCookie(res, `${value}.${sign(value)}`, 3600);
        return send(200, { ok: true });
      }
      if (data.action === "logout") {
        setCookie(res, "", 0);
        return send(200, { ok: true });
      }
      if (!session(req))
        throw new RequestError(
          401,
          "Your session has ended. Unlock the journal again; your unsaved writing is still here.",
        );
      if (data.action !== "save")
        throw new RequestError(400, "Unknown editor action.");
      if (!Number.isInteger(data.revision) || Number(data.revision) < 0)
        throw new RequestError(400, "Reload the journal before saving.");
      const state = await store!.read();
      if (state.revision !== data.revision)
        throw new RequestError(
          409,
          "The journal changed in another window. Reload the list, then save your writing again.",
        );
      const entry = data.entry as Record<string, unknown> | undefined;
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        throw new RequestError(400, "An entry is required.");
      const existing = state.entries.find((item) => item.id === entry.id);
      if (entry.id && !existing)
        throw new RequestError(404, "That entry no longer exists.");
      if (!existing && state.entries.length >= 500)
        throw new RequestError(
          400,
          "The journal is full. Export a backup before adding more entries.",
        );
      const date = text(entry, "date", 10);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      )
        throw new RequestError(400, "Choose a valid date.");
      if (entry.status !== "draft" && entry.status !== "published")
        throw new RequestError(400, "Choose draft or published.");
      const record: JournalEntry = {
        id: existing?.id ?? randomUUID(),
        title: text(entry, "title", 100),
        summary: text(entry, "summary", 220),
        body: text(entry, "body", 30000),
        date,
        status: entry.status,
        updatedAt: new Date().toISOString(),
      };
      const next = {
        revision: state.revision + 1,
        entries: existing
          ? state.entries.map((item) => (item.id === record.id ? record : item))
          : [record, ...state.entries],
      };
      if (!(await store!.save(next, state.revision)))
        throw new RequestError(
          409,
          "The journal changed in another window. Reload the list, then save your writing again.",
        );
      return send(200, {
        ...next,
        savedId: record.id,
        scope: production ? "live" : "local",
      });
    } catch (error) {
      if (error instanceof RequestError)
        return send(error.status, { error: error.message });
      return send(503, {
        error:
          "The journal could not be saved or loaded. Your writing is still in the editor; please try again.",
      });
    }
  };
}
