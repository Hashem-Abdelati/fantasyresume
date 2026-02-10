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
              2012), I’m from Amman, Jordan, and I love history and how it shaped the world we live in.
              Things that feel bigger than reality have always drawn me in.
            </p>

            <p>
              Family is a huge part of who I am. I’m very close with mine, and a lot of my values
              come from that connection. Food is part of that too, I love Arabic food, and if I
              had to choose a favorite, it would probably be mujadara (a rice and lentil dish). Simple, comforting, and
              impossible to get tired of when it’s done right.
            </p>

            <p>
              I’m currently reading <em>A Song of Ice and Fire</em> and I’m on <em>A Clash of Kings</em>.
              I love stories with layered characters, political tension, and moral ambiguity,
              the kind that trust the reader to think and sit with complexity.
            </p>

            <p>
              I enjoy staying active. I go to the gym regularly, and I’ve always loved horseback riding, it’s one of the few activities
              that manages to be both calming and intense at the same time. Archery is next on
              my list; the mix of focus, patience, and precision really appeals to me.
            </p>

            <p>
              At the end of the day, I’m someone who enjoys learning, creating, and improving.
              Whether it’s through code, stories, or new experiences, I like depth, I value
              connection, and I’m always curious about what I can build next.
            </p>
            <p>
              Continue exploring the inventory to learn more.
            </p>
            <p> - Hashem Abdelati 08/02/2026 </p>

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
          There’s nothing quite like the great outdoors (even though, as a CS major, I rarely
          get to see it). I love disconnecting, slowing down, and getting away from noise.
        </p>

        <p>
          I’ve been lucky enough to visit places that really left an impression on me.
          Yosemite felt unreal, massive granite cliffs, quiet trails, and a sense of scale
          that makes you feel small in the best way. Costa Rica is probably my favorite place
          I’ve ever been; the mix of rainforest, wildlife, and ocean made everything feel
          alive and effortless, it was peace and adventure, I also tried surfing which was so fun.
          Wadi Rum was something else entirely. I'm proud to call Jordan home and this amazing endless pink desert,
          that should be talked about more, was a reminder of the beauty and history right in my backyard.
        </p>

        <p>
          Whether it’s hiking through mountains, exploring jungles, or trekking through the
          desert, I’m always ready for clean air and a mental reset. Being outside helps me
          think more clearly, stay present, and come back to my work with a better headspace.
        </p>
        <p> - Hashem Abdelati 08/02/2026 </p>


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
                <figure className="inv-figure inv-figure--fit">

                <div className="inv-img-wrap">
                  <img
                    src="/inventory/costabeachsun.HEIC"
                    alt="Sunset at a beach in Costa Rica"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                  />
                </div>
                <figcaption>Sunset at a beach in Costa Rica</figcaption>
              </figure>

              <figure className="inv-figure inv-figure--fit">
                <div className="inv-img-wrap">
                  <img
                    src="/inventory/volcanoincosta.JPG"
                    alt="Volcano landscape in Costa Rica"
                    className="inv-img inv-img--fit"
                    loading="lazy"
                  />
                </div>
                <figcaption>Arenal Volcano, Costa Rica.</figcaption>
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
                I’m that friend who takes photos in front of movie posters and logs everything I
                watch on Letterboxd. Movies are one of the ways I slow down and think about stories, characters, and the world. 
                I love how they can transport you to different places, times, and perspectives, and how they can make you feel
                deeply in just a couple of hours. Plus theyre a good way to relax!
              </p>

              <p>
                Some of my favorite movies stay with me because of how personal or intentional
                they feel. <em>Sinners</em> was just wow, it stood out to me because it was honest and wasnt afraid to write something insane, and how it
                trusted the audience without overexplaining itself. <em>The Social Network</em> is
                one of those movies I can rewatch forever. I know what you're thinking youre a CS major of course the social network is up there, but it's sharp dialogue, quiet tension, music and plot
                about ambition that makes it great and feels just as relevant now as when it came out, it's a lesson for people in the industry.
              </p>

              <p>
                <em>Palestine 36</em> means something different to me. It’s not an easy watch whatsoever, but
                it’s an important one. Its grounded in history, memory, and perspective. It’s the
                kind of film that reminds me why cinema matters beyond entertainment and how movies can send a message. On the other
                end of the spectrum, <em>Avengers: Endgame</em> represents everything great about
                shared movie experiences, years of buildup, emotional payoff, and the kind of
                moment you remember watching with other people for the rest of your life.
              </p>

              <p>
                I’m drawn to movies that earn their impact, whether that’s through character,
                history, or long-term storytelling. I like films that give me something to sit
                with afterward, and Letterboxd has become my way of keeping track of those moments (scroll down to find me on letter box).
              </p>
              <p> - Hashem Abdelati 08/02/2026 </p>


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
