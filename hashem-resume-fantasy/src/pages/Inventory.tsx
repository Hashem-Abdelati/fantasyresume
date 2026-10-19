import ModalPortal from "../components/ModalPortal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, BookOpen, Mountain, Film, BriefcaseBusiness } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility";
import { inventoryItems, type InventoryItem } from "../data/inventory";
import JournalEditor from "../components/journal/JournalEditor";
import { publicJournal } from "../components/journal/journalClient";
import { JOURNAL_ENABLED, type JournalEntry } from "../data/journal";
type Slot = InventoryItem | null;

const STORAGE_KEY = "inventory_slots_v1";

function IconFor({ icon }: { icon: InventoryItem["icon"] }) {
  if (icon === "book") return <BookOpen size={18} />;
  if (icon === "mountain") return <Mountain size={18} />;
  if (icon === "briefcase") return <BriefcaseBusiness size={18} />;
  return <Film size={18} />;
}

function moveOrSwap(arr: Slot[], from: number, to: number) {
  const next = [...arr];
  const source = next[from];
  const target = next[to];

  if (!source) return arr;

  // swap behavior (works whether target is empty or occupied)
  next[to] = source;
  next[from] = target ?? null;
  return next;
}

function slotsToIds(slots: Slot[]) {
  return slots.map((s) => s?.id ?? null);
}

function buildSlotsFromIds(ids: (string | null)[], allItems: InventoryItem[]) {
  const totalSlots = Math.max(12, allItems.length);
  const map = new Map(allItems.map((i) => [i.id, i]));
  const used = new Set<string>();
  const slots: Slot[] = ids.slice(0, totalSlots).map((id) => {
    if (!id) return null;
    const found = map.get(id);
    if (!found || used.has(id)) return null;
    used.add(id);
    return found;
  });

  // fill missing slots
  while (slots.length < totalSlots) slots.push(null);

  // add any item not already present into first empty slots
  for (const item of allItems) {
    if (used.has(item.id)) continue;
    const idx = slots.findIndex((s) => s === null);
    if (idx !== -1) slots[idx] = item;
  }

  return slots;
}

export default function Inventory() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [journalError, setJournalError] = useState(false);
  const requestVersion = useRef(0);
  const reloadJournal = useCallback(() => {
    if (!JOURNAL_ENABLED) return;
    const version = ++requestVersion.current;
    void publicJournal()
      .then((data) => {
        if (version !== requestVersion.current) return;
        setEntries(data.entries);
        setJournalError(false);
      })
      .catch(() => {
        if (version === requestVersion.current) setJournalError(true);
      });
  }, []);
  useEffect(() => {
    reloadJournal();
  }, [reloadJournal]);
  const items = useMemo<InventoryItem[]>(
    () => [
      ...inventoryItems,
      ...entries.map((entry) => ({
        id: `journal-${entry.id}`,
        name: entry.title,
        summary: entry.summary,
        icon: "book" as const,
        rarity: "rare" as const,
        content: (
          <div className="inv-diary">
            <p className="journal-entry-date">{entry.date}</p>
            <div className="journal-entry-body">{entry.body}</div>
          </div>
        ),
      })),
    ],
    [entries],
  );
  const [params, setParams] = useSearchParams();
  const activeId = params.get("artifact");
  const setActiveId = useCallback(
    (id: string | null) => {
      setParams(id ? { artifact: id } : {}, { replace: true });
    },
    [setParams],
  );
  const close = useCallback(() => setActiveId(null), [setActiveId]);
  useDialogAccessibility(
    Boolean(activeId && items.some((i) => i.id === activeId)),
    close,
  );
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const [slotIds, setSlotIds] = useState<(string | null)[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(parsed))
        return parsed.map((id) => (typeof id === "string" ? id : null));
    } catch {
      /* A fresh order is safe when storage is unavailable. */
    }
    return inventoryItems.map((item) => item.id);
  });
  const slots = buildSlotsFromIds(slotIds, items);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slotIds));
    } catch {
      /* Optional personal layout. */
    }
  }, [slotIds]);
  const active = slots.find((s) => s?.id === activeId) ?? null;

  const onDropAt = (to: number) => {
    if (dragFrom === null || dragFrom === to) return;
    setSlotIds(slotsToIds(moveOrSwap(slots, dragFrom, to)));
    setDragFrom(null);
  };

  return (
    <section className="inventory-screen">
      <div className="inventory-rings" />

      <header className="inventory-header">
        <p className="sheet-kicker">INVENTORY</p>
        <h2 className="inventory-title">Personal Artifacts</h2>
        <p className="inventory-sub">
          Select an artifact to read its story. Drag to rearrange, or use Alt +
          arrow keys.
        </p>
      </header>

      <div className="inventory-grid">
        {slots.map((slot, index) => {
          if (!slot) {
            return (
              <div
                key={`empty-${index}`}
                className={`inv-slot empty ${dragFrom !== null ? "drop-ready" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropAt(index)}
                aria-label={`Empty slot ${index + 1}`}
              >
                <span>Empty Slot</span>
              </div>
            );
          }

          return (
            <button
              key={slot.id}
              className={`inv-slot rarity-${slot.rarity} ${dragFrom === index ? "dragging" : ""}`}
              draggable
              onKeyDown={(event) => {
                if (
                  !event.altKey ||
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const target = Math.max(
                  0,
                  Math.min(
                    slots.length - 1,
                    index +
                      (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1),
                  ),
                );
                setSlotIds(slotsToIds(moveOrSwap(slots, index, target)));
              }}
              onDragStart={() => setDragFrom(index)}
              onDragEnd={() => setDragFrom(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropAt(index)}
              onClick={() => setActiveId(slot.id)}
              aria-label={`Open ${slot.name}`}
            >
              <div className="inv-slot-top">
                <span className="inv-icon">
                  <IconFor icon={slot.icon} />
                </span>
                <span className="inv-rarity">{slot.rarity}</span>
              </div>

              <h3 className="inv-name">{slot.name}</h3>
              <p className="inv-summary">{slot.summary}</p>
            </button>
          );
        })}
      </div>

      {journalError && (
        <p className="journal-load-error">
          Journal entries could not load.{" "}
          <button onClick={reloadJournal}>Try again</button>
        </p>
      )}
      {JOURNAL_ENABLED && <JournalEditor onChanged={reloadJournal} />}

      {active && (
        <ModalPortal>
          <div className="inv-modal-backdrop" onClick={() => setActiveId(null)}>
            <div
              className="inv-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={active.name}
            >
              <div className="inv-modal-head">
                <div>
                  <p className="sheet-kicker">DIARY ENTRY</p>
                  <h3>{active.name}</h3>
                </div>
                <button
                  className="inv-close"
                  onClick={() => setActiveId(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="inv-modal-body">{active.content}</div>
            </div>
          </div>
        </ModalPortal>
      )}
    </section>
  );
}
