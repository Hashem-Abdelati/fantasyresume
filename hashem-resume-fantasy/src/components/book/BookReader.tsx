import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import {
  BOOK_OPEN_DELAY,
  BOOK_OPEN_DURATION,
  bookTravelPose,
  cancelBookReturn,
  leatherCover,
  returnBook,
} from "./bookHandoff";
import { chapters } from "../../data/navigation";
import { useMedia } from "../../hooks/useMedia";

type Snapshot = {
  key: string;
  chapter: number;
  left: HTMLElement;
  right: HTMLElement;
};

// Decorative facsimiles travel with the paper. The live, accessible text stays
// in the actual pages; clones never enter the focus order or accessibility tree.
function copyPage(page: HTMLElement): HTMLElement {
  const copy = page.cloneNode(true) as HTMLElement;
  copy.inert = true;
  copy.setAttribute("aria-hidden", "true");
  copy.removeAttribute("aria-label");
  copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  const scroll = page.querySelector<HTMLElement>(".folio-scroll");
  const copiedScroll = copy.querySelector<HTMLElement>(".folio-scroll");
  if (scroll && copiedScroll) {
    // cloneNode does not preserve scroll offsets. Translate the cloned contents
    // within the same clipped viewport, including after scrolling long dossiers.
    const inner = document.createElement("div");
    inner.append(...copiedScroll.childNodes);
    inner.style.transform = `translateY(-${scroll.scrollTop}px)`;
    copiedScroll.append(inner);
    copiedScroll.style.overflow = "hidden";
  }
  return copy;
}

export default function BookReader() {
  const { pathname, search } = useLocation();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 760px)");
  const reader = useRef<HTMLDivElement>(null);
  const spread = useRef<HTMLDivElement>(null);
  const effects = useRef<HTMLDivElement>(null);
  const previous = useRef<Snapshot | null>(null);
  const animations = useRef<Animation[]>([]);
  const chapter = Math.max(
    0,
    chapters.findIndex((c) => c.to === pathname),
  );

  useEffect(() => {
    const capture = () => {
      const left = spread.current?.querySelector<HTMLElement>(".folio-left");
      const right = spread.current?.querySelector<HTMLElement>(".folio-right");
      if (left && right && previous.current) {
        previous.current.left = copyPage(left);
        previous.current.right = copyPage(right);
      }
    };
    document.addEventListener("pointerdown", capture, true);
    document.addEventListener("keydown", capture, true);
    window.addEventListener("popstate", capture);
    return () => {
      document.removeEventListener("pointerdown", capture, true);
      document.removeEventListener("keydown", capture, true);
      window.removeEventListener("popstate", capture);
    };
  }, []);

  useLayoutEffect(() => {
    cancelBookReturn();
    const root = reader.current,
      layer = effects.current;
    const left = spread.current?.querySelector<HTMLElement>(".folio-left");
    const right = spread.current?.querySelector<HTMLElement>(".folio-right");
    if (!root || !layer || !left || !right) return;
    animations.current.forEach((a) => a.cancel());
    layer.replaceChildren();
    const old = previous.current;
    const key = pathname + search;
    const current = {
      key,
      chapter,
      left: copyPage(left),
      right: copyPage(right),
    };
    previous.current = current;
    root.dataset.turning = "false";
    root.dataset.opening = "false";
    if (reduced || old?.key === key) return;
    const opening = !old;
    if (opening) {
      root.dataset.opening = "true";
      const delay = mobile ? 0 : BOOK_OPEN_DELAY;
      const duration = mobile ? 650 : BOOK_OPEN_DURATION;
      const travel = root.animate(
        [
          {
            transform: bookTravelPose(root.getBoundingClientRect(), mobile),
            opacity: 0,
          },
          { opacity: 1, offset: 0.38 },
          { transform: "translate(0,0) scale(1)", opacity: 1 },
        ],
        { delay, duration, easing: "cubic-bezier(.22,.65,.2,1)", fill: "both" },
      );
      animations.current = [travel];
      travel.onfinish = () => {
        root.dataset.opening = "false";
        travel.cancel();
      };
      root
        .querySelectorAll<HTMLElement>(
          ".book-topline,.book-bottomline,.book-bookmarks",
        )
        .forEach((node) => {
          const a = node.animate([{ opacity: 0 }, { opacity: 1 }], {
            delay: delay + duration * 0.65,
            duration: 350,
            fill: "both",
          });
          a.onfinish = () => a.cancel();
          animations.current.push(a);
        });
      if (!mobile) {
        const binding = root.querySelector<HTMLElement>(".book-binding")!;
        const reveal = binding.animate(
          [
            { clipPath: "inset(-30px -35px -45px 50%)" },
            { clipPath: "inset(-30px -35px -45px -35px)" },
          ],
          { delay, duration, easing: "cubic-bezier(.35,0,.2,1)", fill: "both" },
        );
        reveal.onfinish = () => reveal.cancel();
        animations.current.push(reveal);
      }
    } else animations.current = [];
    const sameChapter = old?.chapter === chapter;
    if (mobile || sameChapter) {
      // A single leaf on narrow screens: keep the text upright and readable.
      const a = (sameChapter ? right : spread.current!).animate(
        [
          { opacity: 0.25, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: opening ? 550 : 280, easing: "ease-out" },
      );
      animations.current.push(a);
      return;
    }
    const forward = opening || chapter > old.chapter;
    const leaf = document.createElement("div");
    leaf.className = `turning-leaf ${opening || !forward ? "turn-left" : "turn-right"}`;
    const front = document.createElement("div");
    front.className = "leaf-face leaf-front";
    front.append(opening ? current.left : forward ? old.right : old.left);
    const back = document.createElement("div");
    back.className = `leaf-face leaf-back ${opening ? "leather-cover" : ""}`;
    if (opening) {
      const cover = leatherCover();
      back.className = cover.className;
      back.append(...cover.childNodes);
    } else {
      back.append(forward ? current.left : current.right);
      const resting = document.createElement("div");
      resting.className = `resting-leaf ${forward ? "rest-left" : "rest-right"}`;
      resting.append(forward ? old.left : old.right);
      layer.append(resting);
    }
    leaf.append(front, back);
    layer.append(leaf);
    root.dataset.turning = "true";
    const flip = leaf.animate(
      [
        {
          transform: `rotateY(${opening ? 180 : 0}deg)`,
        },
        {
          transform: `rotateY(${opening ? 0 : forward ? -180 : 180}deg)`,
        },
      ],
      {
        duration: opening ? BOOK_OPEN_DURATION : 850,
        delay: opening ? BOOK_OPEN_DELAY : 0,
        easing: "cubic-bezier(.35,0,.2,1)",
        fill: "both",
      },
    );
    animations.current.push(flip);
    flip.onfinish = () => {
      layer.replaceChildren();
      root.dataset.turning = "false";
      flip.cancel();
    };
  }, [pathname, search, chapter, reduced, mobile]);

  useLayoutEffect(() => {
    const element = reader.current;
    return () => {
      if (element)
        returnBook(element, matchMedia("(max-width: 760px)").matches);
      animations.current.forEach((a) => a.cancel());
      previous.current = null;
    };
  }, []);

  return (
    <div className="book-reader" ref={reader}>
      <div className="book-topline">
        <Link to="/hub" className="book-close">
          <X size={15} /> Close book
        </Link>
        <span>THE ADVENTURER’S CODEX</span>
        <span className="book-edition">VOLUME I · HASHEM ABDELATI</span>
      </div>
      <nav className="book-bookmarks" aria-label="Codex chapters">
        {chapters.map((c) => (
          <NavLink key={c.to} to={c.to}>
            <span>{c.numeral}</span>
            {c.label}
          </NavLink>
        ))}
      </nav>
      <div className="book-binding">
        <div className="book-spread" ref={spread}>
          <Outlet />
        </div>
        <div className="book-gutter" aria-hidden="true" />
        <div
          className="book-turn-layer"
          ref={effects}
          aria-hidden="true"
          inert
        />
        <i className="book-corner corner-tl" aria-hidden="true" />
        <i className="book-corner corner-tr" aria-hidden="true" />
        <i className="book-corner corner-bl" aria-hidden="true" />
        <i className="book-corner corner-br" aria-hidden="true" />
      </div>
      <footer className="book-bottomline">
        {chapter > 0 ? (
          <Link to={chapters[chapter - 1].to}>
            <ArrowLeft size={14} />
            {chapters[chapter - 1].label}
          </Link>
        ) : (
          <Link to="/hub">
            <ArrowLeft size={14} />
            Grand Hall
          </Link>
        )}
        <span>
          {chapters[chapter].numeral} <i>/</i> III
        </span>
        {chapter < 2 ? (
          <Link to={chapters[chapter + 1].to}>
            {chapters[chapter + 1].label}
            <ArrowRight size={14} />
          </Link>
        ) : (
          <Link to="/contact">
            Send a raven
            <ArrowRight size={14} />
          </Link>
        )}
      </footer>
    </div>
  );
}
