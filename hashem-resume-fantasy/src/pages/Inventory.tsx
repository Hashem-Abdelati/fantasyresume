import { useEffect, useMemo, useState } from "react";
import { X, BookOpen, Mountain, Film } from "lucide-react";

type InventoryItem = {
  id: string;
  name: string;
  icon: "book" | "mountain" | "film";
  rarity: "legendary" | "epic" | "rare";
  summary: string;
  content: React.ReactNode;
};

type Slot = InventoryItem | null;

const TOTAL_SLOTS = 12;
const STORAGE_KEY = "inventory_slots_v1";

function IconFor({ icon }: { icon: InventoryItem["icon"] }) {
  if (icon === "book") return <BookOpen size={18} />;
  if (icon === "mountain") return <Mountain size={18} />;
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
  const map = new Map(allItems.map((i) => [i.id, i]));
  const used = new Set<string>();
  const slots: Slot[] = ids.slice(0, TOTAL_SLOTS).map((id) => {
    if (!id) return null;
    const found = map.get(id);
    if (!found || used.has(id)) return null;
    used.add(id);
    return found;
  });

  // fill missing slots
  while (slots.length < TOTAL_SLOTS) slots.push(null);

  // add any item not already present into first empty slots
  for (const item of allItems) {
    if (used.has(item.id)) continue;
    const idx = slots.findIndex((s) => s === null);
    if (idx !== -1) slots[idx] = item;
  }

  return slots;
}

export default function Inventory() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const items: InventoryItem[] = useMemo(
    () => [
      {
        id: "my-life",
        name: "More About Me",
        icon: "book",
        rarity: "legendary",
        summary: "Diary entry • roots • personality",
        content: (
          <div className="inv-diary">
            <p>
              Hi there! I’m Hashem. I was born on the 16th of January 2004, and I’m going to tell
              you a bit about myself.
            </p>
            <p>
              First things first, speed facts: I’m a twin (me, my twin, and my little sister circa
              2012), I’m from Amman, Jordan, and I really love fantasy and creative work.
            </p>
            <p>
              Outside of work, I keep hobbies that keep me sane and grounded. Continue exploring
              the inventory to learn more.
            </p>

            <div className="inv-subtitle">Family Snapshot</div>
                <figure className="artifact-figure">
                <div className="artifact-image-wrap">
                    <img
                    src="/inventory/siblings.png"
                    alt="Me, my twin, and my little sister circa 2012"
                    className="artifact-image"
                    />
                </div>
                <figcaption>Me, my twin, and my little sister circa 2012</figcaption>
                </figure>
          </div>
        ),
      },
        {
        id: "touching-grass",
        name: "Touching Grass",
        icon: "mountain",
        rarity: "epic",
        summary: "Outdoor adventures • mountains • desert",
        content: (
            <div className="inv-diary">
            <p>
                There’s nothing quite like the great outdoors (even though as a CS major I rarely get
                to see it). I love disconnecting and getting away from noise.
            </p>
            <p>
                Whether it’s hiking through mountains or trekking through the desert, I’m always
                ready for clean air and a reset.
            </p>

            <div className="inv-subtitle">My Adventures</div>
            <div className="inv-image-grid inv-image-grid--fit">
                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/mecamping.png"
                    alt="Me in Wadi Rum"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Me in Wadi Rum</figcaption>
                </figure>

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/meonmountin.png"
                    alt="Hiking to the peak"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Hiking to the peak</figcaption>
                </figure>

                {/* <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/sunset.png"
                    alt="Desert sunset views"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Desert sunset views</figcaption>
                </figure> */}

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/yosemite.png"
                    alt="Exploring Yosemite"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Exploring Yosemite</figcaption>
                </figure>

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/yosemite2.png"
                    alt="Another breathtaking Yosemite view"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Another breathtaking Yosemite view</figcaption>
                </figure>
            </div>
            </div>
        ),
        },
        {
        id: "watching-movies",
        name: "Watching Movies",
        icon: "film",
        rarity: "rare",
        summary: "Poster photos • favorites • Letterboxd diary",
        content: (
            <div className="inv-diary">
            <p>
                I’m that friend who takes photos in front of movie posters and logs everything I watch
                on Letterboxd.
            </p>

            <div className="inv-subtitle">Posters + Recent Watches</div>
            <div className="inv-image-grid inv-image-grid--fit">
                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/Sinners.HEIC"
                    alt="Sinners"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Me in front of Sinners Poster (One of my favs)</figcaption>
                </figure>

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/superman.HEIC"
                    alt="Superman"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Me in front of Superman Poster</figcaption>
                </figure>

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/httyd.HEIC"
                    alt="How to Train Your Dragon"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Me in front of How to Train Your Dragon Poster</figcaption>
                </figure>

                <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                    <img
                    src="/inventory/missionimpossible.HEIC"
                    alt="Mission Impossible"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                    />
                </div>
                <figcaption>Me in front of Mission Impossible Poster</figcaption>
                </figure>
            </div>

            <p className="mt-3">
              Give me a follow on{" "}
              <a
                href="https://letterboxd.com/hashem_abdelati/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Letterboxd
              </a>{" "}
              if you want to see amazing reviews.
            </p>

            <div id="lb-embed" className="letterboxd-embed" />
          </div>
        ),
      },
    ],
    []
  );

  // initial slots
  const [slots, setSlots] = useState<Slot[]>(() => {
    if (typeof window === "undefined") return [...items, ...Array(TOTAL_SLOTS - items.length).fill(null)];

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...items, ...Array(TOTAL_SLOTS - items.length).fill(null)];

    try {
      const parsed = JSON.parse(raw) as (string | null)[];
      return buildSlotsFromIds(parsed, items);
    } catch {
      return [...items, ...Array(TOTAL_SLOTS - items.length).fill(null)];
    }
  });

  // persist slots
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slotsToIds(slots)));
  }, [slots]);

  // letterboxd embed
  useEffect(() => {
    const active = slots.find((s) => s?.id === activeId);
    if (!active || active.id !== "watching-movies") return;

    const el = document.getElementById("lb-embed");
    if (!el) return;
    el.innerHTML = "<p>Summoning Letterboxd diary...</p>";

    fetch("https://lb-embed-content.bokonon.dev?username=hashem_abdelati")
      .then((r) => r.text())
      .then((html) => {
        const target = document.getElementById("lb-embed");
        if (target) target.innerHTML = html;
      })
      .catch(() => {
        const target = document.getElementById("lb-embed");
        if (target) {
          target.innerHTML =
            '<p>See my diary on <a href="https://letterboxd.com/hashem_abdelati/" target="_blank" rel="noopener noreferrer">Letterboxd</a>.</p>';
        }
      });
  }, [activeId, slots]);

  const active = slots.find((s) => s?.id === activeId) ?? null;

  const onDropAt = (to: number) => {
    if (dragFrom === null || dragFrom === to) return;
    setSlots((prev) => moveOrSwap(prev, dragFrom, to));
    setDragFrom(null);
  };

  return (
    <section className="inventory-screen">
      <div className="inventory-rings" />

      <header className="inventory-header">
        <p className="sheet-kicker">INVENTORY</p>
        <h2 className="inventory-title">Personal Artifacts</h2>
        <p className="inventory-sub">
          Drag artifacts between slots. Click an artifact to inspect the full entry.
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
              key={`${slot.id}-${index}`}
              className={`inv-slot rarity-${slot.rarity} ${dragFrom === index ? "dragging" : ""}`}
              draggable
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

      {active && (
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
              <button className="inv-close" onClick={() => setActiveId(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="inv-modal-body">{active.content}</div>
          </div>
        </div>
      )}
    </section>
  );
}
