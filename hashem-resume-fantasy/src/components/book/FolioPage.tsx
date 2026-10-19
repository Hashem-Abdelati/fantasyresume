import { useLayoutEffect, useRef, type ReactNode } from "react";

export default function FolioPage({
  side,
  title,
  number,
  children,
}: {
  side: "left" | "right";
  title: string;
  number: string;
  children: ReactNode;
}) {
  const page = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = page.current;
    const scroll = root?.querySelector<HTMLElement>(".folio-scroll");
    const body = root?.querySelector<HTMLElement>(".folio-body");
    if (!root || !scroll || !body) return;
    const update = () => {
      root.dataset.overflow = String(
        scroll.scrollHeight > scroll.clientHeight + 4 &&
          scroll.scrollTop + scroll.clientHeight < scroll.scrollHeight - 8,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    observer.observe(body);
    scroll.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      scroll.removeEventListener("scroll", update);
    };
  }, []);
  return (
    <section
      ref={page}
      className={`folio-page folio-${side}`}
      aria-label={title}
    >
      <header className="folio-running-head">
        <span>Hashem Abdelati</span>
        <span>{title}</span>
      </header>
      <div
        className="folio-scroll"
        tabIndex={0}
        aria-label={`${title} page content`}
      >
        <div className="folio-body">{children}</div>
      </div>
      <footer className="folio-page-number">
        <span>✧</span>
        {number}
        <span>✧</span>
        <small className="folio-overflow-hint">More on this page ↓</small>
      </footer>
    </section>
  );
}
