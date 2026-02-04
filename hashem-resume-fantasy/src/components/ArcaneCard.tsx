import type { ReactNode } from "react";

export default function ArcaneCard(props: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const { title, subtitle, children, onClick } = props;

  return (
    <div
      onClick={onClick}
      className={[
        "rune-border glass rounded-2xl p-5 shadow-lg shadow-black/30",
        "transition hover:translate-y-[-2px] hover:bg-white/10",
        onClick ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-white/70">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4 text-sm text-white/85">{children}</div> : null}
    </div>
  );
}
