import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Feather,
  BriefcaseBusiness,
  Eye,
} from "lucide-react";
import { signalRaven } from "../components/three/ravenSignals";
import HallEntrance from "../components/hall/HallEntrance";
import ArtifactChapter from "../components/artifacts/ArtifactChapter";
import BookReader from "../components/book/BookReader";
import NavBar from "../components/NavBar";
import { artifactFor, navigation } from "../data/navigation";
import { supportsWebGL } from "../hooks/webgl";
import { useMedia } from "../hooks/useMedia";
const GrandHallScene = lazy(() => import("../components/three/GrandHallScene"));
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const artifacts = [
  {
    id: "satchel",
    to: "/inventory",
    title: "Satchel Inventory",
    sub: "Personal artifacts & stories",
    meta: "THE HUMAN BEHIND THE WORK",
    icon: BriefcaseBusiness,
  },
  {
    id: "spellbook",
    to: "/about",
    title: "Spellbook Codex",
    sub: "Character, projects & experience",
    meta: "THE PROFESSIONAL JOURNEY",
    icon: BookOpen,
  },
  {
    id: "raven",
    to: "/contact",
    title: "Raven Contact",
    sub: "Ideas, opportunities & connections",
    meta: "A MESSAGE ACROSS REALMS",
    icon: Feather,
  },
];
export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const selected = artifactFor(location.pathname);
  const hall = selected === "hall";
  const mobile = useMedia("(max-width: 760px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [supported] = useState(supportsWebGL);
  const [doorReady, setDoorReady] = useState(false);
  const onDoorReady = useCallback(() => setDoorReady(true), []);
  const [entering, setEntering] = useState(() => {
    try {
      return (
        hall &&
        supported &&
        localStorage.getItem("codex-view") !== "simple" &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !sessionStorage.getItem("codex-hall-entered")
      );
    } catch {
      return (
        hall &&
        supported &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }
  });
  const [startedWithEntrance] = useState(entering);
  const [doorOpening, setDoorOpening] = useState(false);
  const revealHall = useCallback(() => setDoorOpening(true), []);
  const [mode, setMode] = useState<"auto" | "3d" | "simple">(() => {
    try {
      return localStorage.getItem("codex-view") === "simple"
        ? "simple"
        : "auto";
    } catch {
      return "auto";
    }
  });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(!document.hidden);
  const content = useRef<HTMLDivElement>(null);
  const previous = useRef(location.pathname);
  const onError = useCallback(() => {
    setFailed(true);
    setEntering(false);
    requestAnimationFrame(() =>
      content.current?.focus({ preventScroll: true }),
    );
  }, []);
  const onReady = useCallback(() => setReady(true), []);
  const sceneEnabled =
    supported &&
    !failed &&
    mode !== "simple" &&
    (!mobile || mode === "3d" || startedWithEntrance);
  const completeEntrance = useCallback(() => {
    setEntering(false);
    if (location.pathname === "/") navigate("/hub", { replace: true });
    requestAnimationFrame(() =>
      content.current?.focus({ preventScroll: true }),
    );
  }, [location.pathname, navigate]);
  useEffect(() => {
    try {
      sessionStorage.setItem("codex-hall-entered", "1");
    } catch {
      /* This mount still remembers the visit. */
    }
  }, []);
  useEffect(() => {
    if (!entering || !hall) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [entering, hall]);
  const select = useCallback((path: string) => navigate(path), [navigate]);
  useEffect(() => {
    const handler = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  useEffect(() => {
    const item = navigation.find((i) => i.to === location.pathname);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        `https://www.hashemabdelati.com${location.pathname}`,
      );
    document.title = `${item ? `${item.label} · ${item.context}` : "Adventurer’s Resume Codex"} | Hashem Abdelati`;
    if (previous.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      content.current?.focus({ preventScroll: true });
      previous.current = location.pathname;
    }
  }, [location.pathname]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !document.querySelector('[role="dialog"]') &&
        !hall
      )
        navigate("/hub");
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [hall, navigate]);
  const toggle = () => {
    const next = sceneEnabled ? "simple" : "3d";
    setMode(next);
    setFailed(false);
    try {
      localStorage.setItem("codex-view", next === "simple" ? "simple" : "auto");
    } catch {
      /* Private browsing still works. */
    }
  };
  return (
    <>
      {entering && hall && (
        <HallEntrance
          ready={doorReady && ready}
          reduced={reduced}
          onComplete={completeEntrance}
          onReveal={revealHall}
        />
      )}
      <div
        inert={entering && hall}
        className={`codex-world ${entering && hall ? "is-entering" : ""} ${hall ? "in-hall" : "in-chapter"} ${!sceneEnabled ? "simple-view" : ""} artifact-${selected}`}
      >
        <a href="#portfolio-content" className="skip-link">
          Skip to portfolio content
        </a>
        <NavBar />
        <div className="study-backdrop" aria-hidden="true" />
        {hall && !sceneEnabled && (
          <div className="illustrated-candlelight" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span
                key={i}
                style={{
                  left: `${6 + i * 12.5}%`,
                  top: `${110 + (i % 3) * 72}px`,
                  animationDelay: `${-i * 1.7}s`,
                }}
              />
            ))}
          </div>
        )}
        {sceneEnabled && (
          <div
            className={`artifact-canvas ${hovered ? "is-hovering" : ""}`}
            aria-hidden="true"
          >
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <GrandHallScene
                  selected={selected}
                  entering={entering && hall}
                  reveal={doorOpening}
                  onDoorReady={onDoorReady}
                  onEntranceComplete={completeEntrance}
                  chapter={location.pathname}
                  reduced={reduced}
                  hovered={hovered}
                  onHover={setHovered}
                  onSelect={select}
                  onError={onError}
                  onReady={onReady}
                  visible={visible}
                />
              </Suspense>
            </SceneBoundary>
          </div>
        )}
        {!sceneEnabled && !hall && (
          <img
            className="chapter-artifact-poster"
            src={`/models/${selected === "book" ? "spellbook" : selected}.webp`}
            alt=""
          />
        )}
        <main
          id="portfolio-content"
          ref={content}
          tabIndex={-1}
          className={hall ? "hall-content" : "chapter-content"}
        >
          {hall ? (
            <>
              <div className="hall-intro">
                <p className="edition">
                  <span /> THE GRAND HALL{" "}
                  <span className="edition-no">EST. MMIV</span>
                </p>
                <h1>
                  More than a resume.
                  <br />
                  <em>A living codex.</em>
                </h1>
                <p className="hall-description">
                  Projects, experiences, artifacts, and connections — bound by
                  curiosity, built for what’s next.
                </p>
                <p className="hall-instruction">
                  EXPLORE <span>·</span> INTERACT <span>·</span> DISCOVER
                </p>
                <nav
                  className="mobile-quick-links"
                  aria-label="Quick portfolio links"
                >
                  <Link to="/about">About</Link>
                  <Link to="/projects">Projects</Link>
                  <Link to="/experience">Experience</Link>
                  <Link to="/contact">Contact</Link>
                </nav>
              </div>
              <nav
                className="artifact-navigation"
                aria-label="Explore the three artifacts"
              >
                {artifacts.map((a) => (
                  <Link
                    key={a.id}
                    to={a.to}
                    className={`artifact-link ${a.id} ${hovered === a.id ? "is-hovered" : ""}`}
                    onMouseEnter={() => setHovered(a.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(a.id)}
                    onBlur={() => setHovered(null)}
                    aria-label={`Open ${a.title} — ${a.sub}`}
                  >
                    {!sceneEnabled && (
                      <img
                        src={`/models/${a.id}.webp`}
                        alt=""
                        width="640"
                        height="720"
                      />
                    )}
                    <span className="artifact-plaque">
                      <a.icon size={25} strokeWidth={1.2} />
                      <span>
                        <strong>{a.title}</strong>
                        <small>{a.sub}</small>
                      </span>
                      <ArrowUpRight size={17} className="plaque-arrow" />
                    </span>
                    <span className="artifact-meta">{a.meta}</span>
                  </Link>
                ))}
              </nav>
            </>
          ) : selected === "book" ? (
            <BookReader />
          ) : (
            <ArtifactChapter
              key={selected}
              stage={selected === "satchel" ? "satchel" : "raven"}
              immersive={sceneEnabled}
            >
              <h1 className="sr-only">
                {
                  navigation.find((item) => item.to === location.pathname)
                    ?.context
                }{" "}
                — Hashem Abdelati
              </h1>
              <aside className="artifact-aside">
                <Link to="/hub" className="return-link">
                  <ArrowLeft size={15} /> Grand Hall
                </Link>
                <div>
                  <p className="edition">
                    {selected === "satchel" ? "THE SATCHEL" : "THE MESSENGER"}
                  </p>
                  <h2>
                    {selected === "satchel"
                      ? "A satchel\nof stories."
                      : "Some messages\nare meant to fly."}
                  </h2>
                  <p>
                    {selected === "satchel"
                      ? "Objects, ideas, and memories in physical form."
                      : "Ideas. People. Possibilities."}
                  </p>
                  {selected === "raven" &&
                    sceneEnabled &&
                    ready &&
                    !reduced && (
                      <button
                        className="raven-call"
                        onClick={() => signalRaven("greet")}
                      >
                        <Feather size={14} /> Call the raven
                      </button>
                    )}
                </div>
                <small>ESC TO RETURN</small>
              </aside>
              <section
                className={`reading-panel ${selected}`}
                aria-label={
                  selected === "satchel"
                    ? "Personal inventory"
                    : "Contact Hashem"
                }
              >
                <div className="reading-toolbar">
                  <span>
                    {selected === "satchel"
                      ? "PERSONAL COLLECTION"
                      : "CORRESPONDENCE"}
                  </span>
                  <Link to="/hub" aria-label="Close and return to Grand Hall">
                    <ArrowLeft size={15} /> Back to Hall
                  </Link>
                </div>
                <div key={location.pathname} className="chapter-page">
                  <Outlet />
                </div>
                <footer className="page-colophon">
                  <span>HASHEM ABDELATI</span>
                  <span>✧</span>
                  <span>THE CODEX COLLECTION</span>
                </footer>
              </section>
            </ArtifactChapter>
          )}
        </main>
        <div className="scene-controls">
          <button
            onClick={toggle}
            disabled={!supported}
            aria-pressed={!sceneEnabled}
          >
            <Eye size={14} />
            {!supported
              ? "Illustrated view"
              : sceneEnabled
                ? "Reading mode"
                : "Enable 3D"}
          </button>
          {sceneEnabled && !ready && (
            <span role="status" className="scene-loading">
              Opening the Codex…
            </span>
          )}
          {failed && <span role="status">The illustrated view is ready.</span>}
        </div>
      </div>
    </>
  );
}
