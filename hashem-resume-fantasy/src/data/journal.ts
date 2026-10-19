// Parked for now; retain the editor and storage implementation for later.
export const JOURNAL_ENABLED = false;

export type JournalEntry = {
  id: string;
  title: string;
  summary: string;
  body: string;
  date: string;
  status: "draft" | "published";
  updatedAt: string;
};
export type JournalState = { revision: number; entries: JournalEntry[] };
