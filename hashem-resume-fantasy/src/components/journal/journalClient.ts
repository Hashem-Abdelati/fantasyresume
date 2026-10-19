import type { JournalEntry, JournalState } from "../../data/journal";
export type OwnerJournal = JournalState & {
  scope: "local" | "live";
  savedId?: string;
};
export class JournalError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export async function journalRequest<T>(
  data?: unknown,
  owner = false,
): Promise<T> {
  const response = await fetch(`/api/journal${owner ? "?owner=1" : ""}`, {
    method: data ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: data
      ? { "Content-Type": "application/json", "X-Codex-Journal": "1" }
      : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new JournalError(
      response.status,
      "The journal service is unavailable. Please try again.",
    );
  }
  if (!response.ok)
    throw new JournalError(
      response.status,
      result.error || "The journal could not be loaded.",
    );
  return result as T;
}
export const publicJournal = () =>
  journalRequest<{ entries: JournalEntry[] }>();
