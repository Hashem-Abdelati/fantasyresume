import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-3 py-1 text-sm transition",
    isActive ? "bg-white/10 text-white ring-1 ring-white/15" : "text-white/75 hover:text-white hover:bg-white/5",
  ].join(" ");

export default function NavBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rune-border glass mt-4 flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Hashem Abdelati</div>
              <div className="text-xs text-white/60">Adventurer’s Resume Codex</div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/hub" className={linkClass}>Hub</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
            <NavLink to="/projects" className={linkClass}>Quests</NavLink>
            <NavLink to="/experience" className={linkClass}>Skill Tree</NavLink>
            <NavLink to="/contact" className={linkClass}>Raven</NavLink>
          </nav>

          <NavLink
            to="/hub"
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-white ring-1 ring-white/15 hover:bg-white/15 md:hidden"
          >
            Enter
          </NavLink>
        </div>
      </div>
    </header>
  );
}
