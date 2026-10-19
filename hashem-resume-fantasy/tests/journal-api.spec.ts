/* Server tests do not need browser fixtures. */
/* eslint-disable no-empty-pattern */
import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scryptSync } from "node:crypto";
import { journalHandler } from "../server/journal-handler";
import { fileStore, redisStore } from "../server/journal-store";

const password = "test-only-spell";
const settings = {
  passwordHash: `test-salt:${scryptSync(password, "test-salt", 32).toString("hex")}`,
  secret: "a-test-session-secret-at-least-32-characters",
  production: false,
};
const entry = {
  title: "A new journey",
  summary: "A small discovery",
  body: "Only the keeper sees this draft.\n\n<script>alert(1)</script>",
  date: "2026-09-23",
  status: "draft",
};

test("server protects drafts, persists updates, rejects stale writes and enforces owner sessions", async ({}, info) => {
  test.skip(
    info.project.name !== "chromium",
    "Server-only coverage runs once.",
  );
  const dir = await mkdtemp(join(tmpdir(), "codex-journal-api-"));
  const path = join(dir, "entries.json");
  const server = createServer(
    journalHandler({ ...settings, store: fileStore(path) }),
  );
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  let cookie = "";
  const call = (
    data?: unknown,
    owner = false,
    headers: Record<string, string> = {},
  ) =>
    fetch(`${origin}/api/journal${owner ? "?owner=1" : ""}`, {
      method: data ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Codex-Journal": "1",
        Cookie: cookie,
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  try {
    expect((await call(undefined, true)).status).toBe(401);
    expect((await call({ action: "save", revision: 0, entry })).status).toBe(
      401,
    );
    const wrong = await call({ action: "login", password: "wrong" });
    expect(wrong.status).toBe(401);
    expect(wrong.headers.get("set-cookie")).toBeNull();
    expect(
      (
        await call({ action: "login", password }, false, {
          Origin: "https://elsewhere.example",
        })
      ).status,
    ).toBe(403);
    const login = await call({ action: "login", password });
    expect(login.status).toBe(200);
    expect(login.headers.get("set-cookie")).toContain(
      "HttpOnly; SameSite=Strict",
    );
    cookie = login.headers.get("set-cookie")!.split(";")[0];
    expect(
      (
        await call({ action: "save", revision: 0, entry }, false, {
          "X-Codex-Journal": "",
        })
      ).status,
    ).toBe(403);
    const saved = await (
      await call({ action: "save", revision: 0, entry })
    ).json();
    expect(saved.revision).toBe(1);
    expect((await (await call()).json()).entries).toEqual([]);
    expect((await (await call(undefined, true)).json()).entries[0].body).toBe(
      entry.body,
    );
    expect((await fileStore(path).read()).entries[0].title).toBe(entry.title);
    const published = { ...saved.entries[0], status: "published" };
    expect(
      (await call({ action: "save", revision: 1, entry: published })).status,
    ).toBe(200);
    const publicRead = await fetch(`${origin}/api/journal`);
    expect(publicRead.headers.get("cache-control")).toBe("no-store");
    expect((await publicRead.json()).entries[0].title).toBe(entry.title);
    expect(
      (
        await call({
          action: "save",
          revision: 1,
          entry: { ...published, title: "Stale overwrite" },
        })
      ).status,
    ).toBe(409);
    expect((await fileStore(path).read()).entries[0].title).toBe(entry.title);
    expect(
      (
        await call({
          action: "save",
          revision: 2,
          entry: { ...published, date: "2026-02-30" },
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await call({
          action: "save",
          revision: 2,
          entry: { ...published, status: "draft" },
        })
      ).status,
    ).toBe(200);
    expect((await (await call()).json()).entries).toEqual([]);
    const logout = await call({ action: "logout" });
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");
    cookie += "tampered";
    expect((await call(undefined, true)).status).toBe(401);
    cookie = "";
    for (let i = 0; i < 6; i++)
      await call({ action: "login", password: "wrong" });
    expect((await call({ action: "login", password })).status).toBe(429);
    await writeFile(path, "corrupt");
    expect((await call()).status).toBe(503);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(dir, { recursive: true, force: true });
  }
});

test("production fails closed without storage and uses secure cookies when configured", async ({}, info) => {
  test.skip(
    info.project.name !== "chromium",
    "Server-only coverage runs once.",
  );
  const dir = await mkdtemp(join(tmpdir(), "codex-journal-prod-"));
  const servers = [
    createServer(
      journalHandler({ ...settings, production: true, store: null }),
    ),
    createServer(
      journalHandler({
        ...settings,
        production: true,
        store: fileStore(join(dir, "data.json")),
      }),
    ),
  ];
  try {
    for (const server of servers)
      await new Promise<void>((resolve) =>
        server.listen(0, "127.0.0.1", resolve),
      );
    const urls = servers.map(
      (server) =>
        `http://127.0.0.1:${(server.address() as { port: number }).port}/api/journal`,
    );
    expect((await fetch(urls[0] + "?owner=1")).status).toBe(503);
    const response = await fetch(urls[1], {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Codex-Journal": "1" },
      body: JSON.stringify({ action: "login", password }),
    });
    expect(response.headers.get("set-cookie")).toContain("; Secure");
  } finally {
    for (const server of servers)
      await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(dir, { recursive: true, force: true });
  }
});

test("Redis REST adapter authenticates and sends atomic compare-and-set and expiring rate limits", async ({}, info) => {
  test.skip(
    info.project.name !== "chromium",
    "Server-only coverage runs once.",
  );
  const calls: unknown[][] = [];
  const server = createServer(async (req, res) => {
    expect(req.headers.authorization).toBe("Bearer test-redis-token");
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const args = JSON.parse(raw);
    calls.push(args);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ result: args[0] === "GET" ? null : 1 }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const store = redisStore(
      `http://127.0.0.1:${(server.address() as { port: number }).port}`,
      "test-redis-token",
    );
    expect(await store.read()).toEqual({ revision: 0, entries: [] });
    expect(await store.save({ revision: 1, entries: [] }, 0)).toBe(true);
    expect(await store.attempt("login")).toBe(1);
    expect(calls[1][0]).toBe("EVAL");
    expect(calls[1][1]).toContain("r~=tonumber(ARGV[1])");
    expect(calls[1].slice(2, 5)).toEqual([1, "codex:journal:v1", 0]);
    expect(calls[2][1]).toContain("redis.call('EXPIRE',KEYS[1],900)");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
