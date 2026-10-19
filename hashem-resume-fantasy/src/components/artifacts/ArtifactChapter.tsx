import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { artifactFor } from "../../data/navigation";
import { useMedia } from "../../hooks/useMedia";

type Stage = "satchel" | "raven";
const departures = new Map<Stage, () => void>();

function leaveStage(root: HTMLElement, stage: Stage) {
  departures.get(stage)?.();
  const layer = document.createElement("div");
  layer.className = `codex-world in-chapter artifact-${stage} artifact-departure`;
  layer.dataset.artifact = stage;
  layer.inert = true;
  layer.setAttribute("aria-hidden", "true");
  const animations: Animation[] = [];
  document.body.append(layer);
  for (const element of root.querySelectorAll<HTMLElement>(
    ".reading-panel,.artifact-aside",
  )) {
    const rect = element.getBoundingClientRect();
    const appearance = getComputedStyle(element);
    const opacity = Number(appearance.opacity);
    if (opacity < 0.05) continue;
    const copy = element.cloneNode(true) as HTMLElement;
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    Object.assign(copy.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      bottom: "auto",
      right: "auto",
      overflow: "hidden",
      pointerEvents: "none",
      transformOrigin: "50% 45%",
    });
    layer.append(copy);
    const originals = element.querySelectorAll<HTMLElement>("*");
    copy.querySelectorAll<HTMLElement>("*").forEach((node, i) => {
      node.scrollTop = originals[i].scrollTop;
    });
    animations.push(
      copy.animate(
        [
          { opacity, transform: "translate(0,0) scale(1)" },
          {
            opacity: 0,
            transform: `translate(${element.classList.contains("reading-panel") ? 26 : -10}px, 8px) scale(.975)`,
          },
        ],
        { duration: 520, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" },
      ),
    );
  }
  const clean = () => {
    animations.forEach((animation) => animation.cancel());
    layer.remove();
    departures.delete(stage);
    document.body.classList.toggle("artifact-returning", departures.size > 0);
  };
  departures.set(stage, clean);
  document.body.classList.add("artifact-returning");
  if (animations.length) animations[0].onfinish = clean;
  else clean();
}

/** Delay reading controls until the camera has approached the selected artifact. */
export default function ArtifactChapter({
  stage,
  immersive,
  children,
}: {
  stage: Stage;
  immersive: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  useLayoutEffect(() => {
    departures.get(stage)?.();
    const element = root.current;
    if (!element) return;
    const animations: Animation[] = [];
    if (!reduced) {
      element
        .querySelectorAll<HTMLElement>(".reading-panel,.artifact-aside")
        .forEach((node) => {
          const panel = node.classList.contains("reading-panel");
          const animation = node.animate(
            [
              {
                opacity: 0,
                transform: `translate(${panel ? 28 : -12}px, 10px)`,
              },
              { opacity: 1, transform: "translate(0,0)" },
            ],
            {
              delay: immersive ? (panel ? 520 : 320) : 0,
              duration: immersive ? 800 : 450,
              easing: "cubic-bezier(.22,.65,.2,1)",
              fill: "both",
            },
          );
          animation.onfinish = () => animation.cancel();
          animations.push(animation);
        });
    }
    return () => {
      if (
        artifactFor(window.location.pathname) !== stage &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        leaveStage(element, stage);
      animations.forEach((animation) => animation.cancel());
    };
  }, [stage, immersive, reduced]);
  return (
    <div ref={root} className="artifact-chapter">
      {children}
    </div>
  );
}
