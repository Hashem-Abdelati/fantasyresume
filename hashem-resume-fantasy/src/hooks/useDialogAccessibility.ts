import { useLayoutEffect } from "react";
/** Used by the existing HTML dossiers, skill tree and diary dialogs. */
export function useDialogAccessibility(open: boolean, close: () => void) {
  useLayoutEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = Array.from(
      document.querySelectorAll<HTMLElement>('[role="dialog"]'),
    ).at(-1);
    if (!dialog) return;
    const selector = 'a[href], button, input, textarea, select, [tabindex="0"]';
    dialog.tabIndex = -1;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (dialog.querySelector<HTMLElement>(selector) ?? dialog).focus();
    const onKey = (event: KeyboardEvent) => {
      if (!dialog.isConnected) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
      if (event.key !== "Tab") return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(selector),
      ).filter((e) => e.getClientRects().length && !e.hasAttribute("disabled"));
      const first = items[0],
        last = items.at(-1);
      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [open, close]);
}
