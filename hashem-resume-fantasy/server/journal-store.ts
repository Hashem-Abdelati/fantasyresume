import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import type { JournalState } from "../src/data/journal.js";
export interface JournalStore {
  read(): Promise<JournalState>;
  save(state: JournalState, expected: number): Promise<boolean>;
  attempt(key: string): Promise<number>;
}
const empty = (): JournalState => ({ revision: 0, entries: [] });
export function fileStore(path: string): JournalStore {
  let queue: Promise<unknown> = Promise.resolve();
  const attempts = new Map<string, { count: number; until: number }>();
  const read = async () => {
    try {
      return JSON.parse(await readFile(path, "utf8")) as JournalState;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty();
      throw error;
    }
  };
  return {
    read,
    save(state, expected) {
      const job = queue.then(async () => {
        if ((await read()).revision !== expected) return false;
        await mkdir(dirname(path), { recursive: true });
        const temp = `${path}.${randomUUID()}.tmp`;
        await writeFile(temp, JSON.stringify(state, null, 2), { mode: 0o600 });
        await rename(temp, path);
        return true;
      });
      queue = job.catch(() => {});
      return job;
    },
    async attempt(key) {
      const now = Date.now();
      for (const [id, value] of attempts)
        if (value.until < now) attempts.delete(id);
      const value = attempts.get(key) ?? { count: 0, until: now + 900000 };
      value.count++;
      attempts.set(key, value);
      return value.count;
    },
  };
}
export function redisStore(url: string, token: string): JournalStore {
  async function command<T>(...args: (string | number)[]): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Journal storage unavailable");
    const data = (await response.json()) as { result: T; error?: string };
    if (data.error) throw new Error("Journal storage unavailable");
    return data.result;
  }
  const key = "codex:journal:v1";
  return {
    async read() {
      const value = await command<string | null>("GET", key);
      return value ? JSON.parse(value) : empty();
    },
    async save(state, expected) {
      return (
        (await command<number>(
          "EVAL",
          "local s=redis.call('GET',KEYS[1]); local r=0; if s then r=cjson.decode(s).revision end; if r~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1",
          1,
          key,
          expected,
          JSON.stringify(state),
        )) === 1
      );
    },
    async attempt(id) {
      return command<number>(
        "EVAL",
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],900) end; return n",
        1,
        `codex:journal:attempt:${id}`,
      );
    },
  };
}
