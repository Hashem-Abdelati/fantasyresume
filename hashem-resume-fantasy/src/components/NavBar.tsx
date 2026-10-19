import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { navigation } from "../data/navigation";
export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="codex-header">
      <Link
        className="codex-brand"
        to="/hub"
        aria-label="Hashem Abdelati — Grand Hall"
      >
        <span className="brand-crest">
          <Sparkles size={21} />
        </span>
        <span>
          <strong>Hashem Abdelati</strong>
          <small>Adventurer’s Resume Codex</small>
        </span>
      </Link>
      <button
        className="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className={open ? "is-open" : ""}
      >
        {navigation.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            title={link.context}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link.label}
            <span className="nav-context">{link.context}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
