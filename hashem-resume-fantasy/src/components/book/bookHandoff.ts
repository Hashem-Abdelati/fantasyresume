import { artifactFor } from "../../data/navigation";

export const BOOK_OPEN_DELAY = 420;
export const BOOK_OPEN_DURATION = 1450;
export const BOOK_CLOSE_DURATION = 1450;
type Anchor = { x: number; y: number; height: number };
let anchor: Anchor | null = null;
let cancelReturn: (() => void) | null = null;

/** Projected position of the physical book, remembered before leaving the Hall. */
export function rememberBookAnchor(next: Anchor) {
  anchor = {
    x: next.x / innerWidth,
    y: next.y / innerHeight,
    height: next.height / innerHeight,
  };
}
export function cancelBookReturn() {
  cancelReturn?.();
}
export function bookTravelPose(rect: DOMRect, mobile: boolean) {
  if (mobile) return "translate(0px, 35px) scale(.82)";
  const position = anchor ?? { x: 0.5, y: 0.46, height: 0.46 };
  const scale = Math.min(
    0.72,
    Math.max(0.3, (position.height * innerHeight) / rect.height),
  );
  // A closed book occupies the right half of the spread. Align that half,
  // rather than the center of the two-page reader, with the physical cover.
  const x =
    position.x * innerWidth -
    (rect.left + rect.width / 2) -
    (rect.width * scale) / 4;
  const y = position.y * innerHeight - (rect.top + rect.height / 2);
  return `translate(${x}px, ${y}px) scale(${scale})`;
}
export function leatherCover() {
  const cover = document.createElement("div");
  cover.className = "leaf-face leaf-back leather-cover";
  const crest = document.createElement("div");
  crest.className = "cover-crest";
  crest.innerHTML =
    "<span>THE ADVENTURER’S</span><strong>H</strong><span>RESUME CODEX</span>";
  cover.append(crest);
  return cover;
}

/** A short-lived, inert paper facsimile survives route unmount for the return. */
export function returnBook(root: HTMLElement, mobile: boolean) {
  if (
    artifactFor(window.location.pathname) === "book" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  cancelBookReturn();
  const visibleRect = root.getBoundingClientRect();
  const appearance = getComputedStyle(root);
  if (Number(appearance.opacity) < 0.05) return;
  const initialTransform =
    appearance.transform === "none"
      ? "translate(0,0) scale(1)"
      : appearance.transform;
  const matrix = new DOMMatrix(
    appearance.transform === "none" ? undefined : appearance.transform,
  );
  const rect = new DOMRect(
    visibleRect.left +
      visibleRect.width / 2 -
      matrix.m41 -
      root.offsetWidth / 2,
    visibleRect.top +
      visibleRect.height / 2 -
      matrix.m42 -
      root.offsetHeight / 2,
    root.offsetWidth,
    root.offsetHeight,
  );
  const copy = root.cloneNode(true) as HTMLElement;
  copy.classList.add("book-return-copy");
  copy.inert = true;
  copy.setAttribute("aria-hidden", "true");
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  root.querySelectorAll<HTMLElement>(".folio-scroll").forEach((scroll, i) => {
    const target = copy.querySelectorAll<HTMLElement>(".folio-scroll")[i];
    if (!target) return;
    const contents = document.createElement("div");
    contents.append(...target.childNodes);
    contents.style.transform = `translateY(-${scroll.scrollTop}px)`;
    target.append(contents);
    target.style.overflow = "hidden";
  });
  Object.assign(copy.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    transformOrigin: "50% 50%",
  });
  const layer = copy.querySelector<HTMLElement>(".book-turn-layer")!;
  layer.replaceChildren();
  const binding = copy.querySelector<HTMLElement>(".book-binding")!;
  const running: Animation[] = [];
  document.body.append(copy);
  document.body.classList.add("book-returning");
  if (!mobile) {
    const leaf = document.createElement("div");
    leaf.className = "turning-leaf turn-left";
    const front = document.createElement("div");
    front.className = "leaf-face leaf-front";
    front.append(copy.querySelector(".folio-left")!.cloneNode(true));
    leaf.append(front, leatherCover());
    layer.append(leaf);
    running.push(
      leaf.animate(
        [{ transform: "rotateY(0deg)" }, { transform: "rotateY(180deg)" }],
        { duration: 950, easing: "cubic-bezier(.4,0,.25,1)", fill: "both" },
      ),
    );
    running.push(
      binding.animate(
        [
          { clipPath: "inset(-30px -35px -45px -35px)" },
          { clipPath: "inset(-30px -35px -45px 50%)" },
        ],
        { duration: 1000, easing: "cubic-bezier(.4,0,.25,1)", fill: "both" },
      ),
    );
  }
  copy
    .querySelectorAll<HTMLElement>(
      ".book-topline,.book-bottomline,.book-bookmarks",
    )
    .forEach((node) =>
      running.push(
        node.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 220,
          fill: "both",
        }),
      ),
    );
  const travel = copy.animate(
    [
      {
        transform: initialTransform,
        opacity: Number(appearance.opacity),
        offset: 0,
      },
      { opacity: 1, offset: 0.35 },
      { opacity: 0.9, offset: 0.58 },
      { transform: bookTravelPose(rect, mobile), opacity: 0, offset: 1 },
    ],
    {
      duration: mobile ? 650 : BOOK_CLOSE_DURATION,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "both",
    },
  );
  running.push(travel);
  const clean = () => {
    running.forEach((animation) => animation.cancel());
    copy.remove();
    document.body.classList.remove("book-returning");
    cancelReturn = null;
  };
  cancelReturn = clean;
  travel.onfinish = clean;
}
