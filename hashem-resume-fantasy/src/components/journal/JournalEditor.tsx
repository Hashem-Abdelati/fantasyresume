import { useCallback, useEffect, useRef, useState } from "react";
import { Download, KeyRound, LockKeyhole, Plus, X } from "lucide-react";
import ModalPortal from "../ModalPortal";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import type { JournalEntry } from "../../data/journal";
import {
  JournalError,
  journalRequest,
  type OwnerJournal,
} from "./journalClient";
import "../../styles/journal.css";

type Draft = Pick<JournalEntry, "title" | "summary" | "body" | "date"> & {
  id?: string;
};
const blank = (): Draft => ({
  title: "",
  summary: "",
  body: "",
  date: new Date().toLocaleDateString("en-CA"),
});
export default function JournalEditor({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [journal, setJournal] = useState<OwnerJournal | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [dirty, setDirty] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const title = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const guard = useCallback(
    () =>
      !dirty || window.confirm("Discard the unsaved changes to this entry?"),
    [dirty],
  );
  const close = useCallback(() => {
    if (!busy && guard()) {
      setOpen(false);
      setPassword("");
      setDirty(false);
      setDraft(blank());
    }
  }, [busy, guard]);
  // Keep the focus trap mounted while typing or saving changes its close guard.
  const closeAction = useRef(close);
  useEffect(() => {
    closeAction.current = close;
  }, [close]);
  const closeDialog = useCallback(() => closeAction.current(), []);
  useDialogAccessibility(open, closeDialog);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await journalRequest({ action: "login", password });
      setJournal(await journalRequest<OwnerJournal>(undefined, true));
      setPassword("");
      requestAnimationFrame(() => title.current?.focus());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to unlock the journal.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function enter() {
    setOpen(true);
    setError("");
    setMessage("");
    setBusy(true);
    try {
      setJournal(await journalRequest<OwnerJournal>(undefined, true));
    } catch (e) {
      setJournal(null);
      if (!(e instanceof JournalError && e.status === 401))
        setError(
          e instanceof Error ? e.message : "Unable to load the journal.",
        );
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        (passwordInput.current ?? title.current)?.focus(),
      );
    }
  }
  function edit(entry?: JournalEntry) {
    if (!guard()) return;
    setDraft(
      entry
        ? {
            id: entry.id,
            title: entry.title,
            summary: entry.summary,
            body: entry.body,
            date: entry.date,
          }
        : blank(),
    );
    setDirty(false);
    setPreview(false);
    setError("");
    setMessage("");
    requestAnimationFrame(() => title.current?.focus());
  }
  async function save(status: JournalEntry["status"]) {
    if (!journal) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await journalRequest<OwnerJournal>({
        action: "save",
        revision: journal.revision,
        entry: { ...draft, status },
      });
      setJournal(result);
      setDraft((prev) => ({ ...prev, id: result.savedId }));
      setDirty(false);
      setMessage(
        status === "published"
          ? result.scope === "local"
            ? "Published in this local preview."
            : "Published to the portfolio."
          : "Private draft saved.",
      );
      onChanged();
    } catch (e) {
      if (e instanceof JournalError && e.status === 401) setJournal(null);
      setError(
        e instanceof Error
          ? e.message
          : "Could not save. Your writing is still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    setBusy(true);
    setError("");
    try {
      setJournal(await journalRequest<OwnerJournal>(undefined, true));
      setMessage("List reloaded. Your unsaved writing is still in the editor.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reload.");
    } finally {
      setBusy(false);
    }
  }
  async function lock() {
    if (!guard()) return;
    setBusy(true);
    setError("");
    try {
      await journalRequest({ action: "logout" });
      setJournal(null);
      setDirty(false);
      setDraft(blank());
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not lock the journal.");
    } finally {
      setBusy(false);
    }
  }
  function backup() {
    if (!journal) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { exportedAt: new Date().toISOString(), entries: journal.entries },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "codex-journal-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const field = (key: keyof Draft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setMessage("");
  };
  const current = journal?.entries.find((entry) => entry.id === draft.id);
  return (
    <>
      <button
        className="journal-master-key"
        onClick={enter}
        aria-label="Open master spell"
        title="Master spell"
      >
        <KeyRound size={15} />
      </button>
      {open && (
        <ModalPortal>
          <div className="journal-backdrop" onClick={close}>
            <section
              className="journal-editor"
              role="dialog"
              aria-modal="true"
              aria-labelledby="journal-heading"
              onClick={(e) => e.stopPropagation()}
            >
              <header>
                <div>
                  <p className="sheet-kicker">THE KEEPER’S DESK</p>
                  <h2 id="journal-heading">
                    {journal ? "Journal editor" : "Master spell"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  aria-label="Close journal editor"
                >
                  <X size={20} />
                </button>
              </header>
              {error && (
                <p className="journal-error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="journal-message" role="status">
                  {message}
                </p>
              )}
              {!journal ? (
                <form className="journal-unlock" onSubmit={unlock}>
                  <p>For the keeper of this codex.</p>
                  <label>
                    Master spell
                    <input
                      ref={passwordInput}
                      autoComplete="current-password"
                      type="password"
                      inputMode="numeric"
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={busy}
                    />
                  </label>
                  <button className="journal-primary" disabled={busy}>
                    {busy ? "Opening…" : "Unlock journal"}
                  </button>
                </form>
              ) : (
                <>
                  <div className="journal-tools">
                    <span>
                      {journal.scope === "local"
                        ? "Local preview · saved on this computer"
                        : "Live portfolio"}
                    </span>
                    <button onClick={backup} disabled={busy}>
                      <Download size={14} /> Backup
                    </button>
                    <button onClick={lock} disabled={busy}>
                      <LockKeyhole size={14} /> Lock
                    </button>
                  </div>
                  <div className="journal-workspace">
                    <aside>
                      <button
                        className="journal-new"
                        onClick={() => edit()}
                        disabled={busy}
                      >
                        <Plus size={16} /> New entry
                      </button>
                      {journal.entries.length === 0 && (
                        <p>Your first page is waiting.</p>
                      )}
                      <nav aria-label="Journal entries">
                        {journal.entries.map((entry) => (
                          <button
                            key={entry.id}
                            aria-current={
                              draft.id === entry.id ? "true" : undefined
                            }
                            onClick={() => edit(entry)}
                            disabled={busy}
                          >
                            <strong>{entry.title}</strong>
                            <small>
                              {entry.date} ·{" "}
                              {entry.status === "draft"
                                ? "Private draft"
                                : "Published"}
                            </small>
                          </button>
                        ))}
                      </nav>
                      <button onClick={reload} disabled={busy}>
                        Reload list
                      </button>
                    </aside>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void save("draft");
                      }}
                    >
                      <fieldset disabled={busy}>
                        <div className="journal-form-heading">
                          <h3>
                            {draft.id ? "Edit entry" : "A new journal entry"}
                          </h3>
                          <span>
                            {dirty
                              ? "Unsaved changes"
                              : current?.status === "published"
                                ? "Published"
                                : "Private draft"}
                          </span>
                        </div>
                        <label>
                          Title
                          <input
                            ref={title}
                            value={draft.title}
                            maxLength={100}
                            required
                            onChange={(e) => field("title", e.target.value)}
                          />
                        </label>
                        <label>
                          Date
                          <input
                            type="date"
                            value={draft.date}
                            required
                            onChange={(e) => field("date", e.target.value)}
                          />
                        </label>
                        <label>
                          Short description
                          <input
                            value={draft.summary}
                            maxLength={220}
                            required
                            onChange={(e) => field("summary", e.target.value)}
                          />
                        </label>
                        <div className="journal-body-field">
                          <label htmlFor="journal-body">Journal entry</label>
                          <textarea
                            id="journal-body"
                            rows={12}
                            value={draft.body}
                            maxLength={30000}
                            required
                            onChange={(e) => field("body", e.target.value)}
                            placeholder="Write the story you want to remember…"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreview(!preview)}
                          aria-expanded={preview}
                        >
                          {preview ? "Hide preview" : "Preview entry"}
                        </button>
                        {preview && (
                          <article className="journal-preview">
                            <small>{draft.date}</small>
                            <h3>{draft.title || "Untitled entry"}</h3>
                            <p>{draft.summary}</p>
                            <div>{draft.body}</div>
                          </article>
                        )}
                        <div className="journal-save-actions">
                          <button type="submit">
                            {current?.status === "published"
                              ? "Return to private draft"
                              : "Save private draft"}
                          </button>
                          <button
                            type="button"
                            className="journal-primary"
                            onClick={(e) => {
                              if (e.currentTarget.form?.reportValidity())
                                void save("published");
                            }}
                          >
                            {current?.status === "published"
                              ? "Publish changes"
                              : "Publish entry"}
                          </button>
                        </div>
                        <p className="journal-hint">
                          Drafts are only visible here. Publishing adds the
                          entry to your Inventory.
                          {journal.scope === "local"
                            ? " This preview does not update the live website."
                            : ""}
                        </p>
                      </fieldset>
                    </form>
                  </div>
                </>
              )}
            </section>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
