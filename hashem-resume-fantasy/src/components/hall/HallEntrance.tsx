import { useEffect, useRef, useState } from "react";
import "../../styles/entrance.css";

type Props = {
  ready: boolean;
  reduced: boolean;
  onComplete: () => void;
  onReveal: () => void;
};

/** Accessible controls over the actual doorway in the shared WebGL scene. */
export default function HallEntrance({
  ready,
  reduced,
  onComplete,
  onReveal,
}: Props) {
  const [opening, setOpening] = useState(false);
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (reduced) {
      onComplete();
      return;
    }
    if (!ready) {
      // A failed or stalled entrance never blocks the portfolio.
      const timeout = window.setTimeout(onComplete, 10000);
      return () => window.clearTimeout(timeout);
    }
    const timer = window.setTimeout(() => {
      setOpening(true);
      onReveal();
    }, 950);
    return () => window.clearTimeout(timer);
  }, [ready, reduced, onComplete, onReveal]);
  useEffect(() => {
    skip.current?.focus({ preventScroll: true });
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        skip.current?.focus();
      }
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onComplete();
      }
    };
    window.addEventListener("keydown", keyboard, true);
    return () => window.removeEventListener("keydown", keyboard, true);
  }, [onComplete]);
  return (
    <div
      className={`hall-entrance ${opening ? "is-opening" : ""} ${ready ? "is-ready" : "is-loading"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Entering the Grand Hall"
    >
      {!ready && (
        <div className="entrance-loading" role="status">
          Approaching the Grand Hall…
        </div>
      )}
      <div className="entrance-title">
        <p>HASHEM ABDELATI</p>
        <h1>The Grand Hall</h1>
        <span>A world built by curiosity.</span>
      </div>
      <button ref={skip} className="entrance-skip" onClick={onComplete}>
        Skip entrance <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
