import type { ReactNode } from "react";
import { createPortal } from "react-dom";
/** Keep dialogs outside animated reading panels and their stacking contexts. */
export default function ModalPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
