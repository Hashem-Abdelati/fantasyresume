import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { to: "/hub", label: "Grand Hall" },
  { to: "/about", label: "Character" },
  { to: "/projects", label: "Quests" },
  { to: "/experience", label: "Journey" },
  { to: "/contact", label: "Raven" },
  { to: "/inventory", label: "Inventory" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "nav-link group relative overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
    isActive
      ? "text-[rgba(255,240,196,0.98)] bg-[rgba(255,215,140,0.15)] ring-1 ring-[rgba(255,215,140,0.45)] shadow-[0_0_18px_rgba(255,215,140,0.22)]"
      : "text-white/75 hover:text-[rgba(255,240,196,0.95)] hover:bg-[rgba(255,255,255,0.06)] ring-1 ring-transparent hover:ring-[rgba(255,215,140,0.22)]",
  ].join(" ");

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto w-[98vw] max-w-[1800px] px-2 md:px-3">
        <div className="nav-shell mt-3 md:mt-4 rounded-2xl px-3 py-2.5 md:px-4 md:py-3">
          {/* Left brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="nav-crest">
              <Sparkles className="h-4 w-4 text-[rgba(255,236,190,0.95)]" />
            </div>

            <div className="leading-tight min-w-0">
              <div className="truncate font-cinzel text-sm md:text-[15px] tracking-[0.05em] text-[rgba(255,240,196,0.96)]">
                Hashem Abdelati
              </div>
              <div className="truncate font-imfell text-xs md:text-[13px] text-white/65">
                Adventurer’s Resume Codex
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                <span className="relative z-10">{l.label}</span>
                <span className="nav-link-shimmer" />
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-[rgba(255,215,140,0.28)] bg-[rgba(255,255,255,0.05)] p-2 text-[rgba(255,236,190,0.95)]"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
          }`}
        >
          <div className="nav-mobile rounded-2xl p-2">
            <nav className="grid gap-1.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2 text-sm transition",
                      isActive
                        ? "text-[rgba(255,240,196,0.98)] bg-[rgba(255,215,140,0.14)] ring-1 ring-[rgba(255,215,140,0.35)]"
                        : "text-white/80 hover:text-[rgba(255,240,196,0.96)] hover:bg-[rgba(255,255,255,0.06)]",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
