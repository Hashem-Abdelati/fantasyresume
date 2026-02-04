import { useNavigate } from "react-router-dom";
import codexImg from "../assets/codex.png";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-obsidian text-parchment">
      <div className="fixed inset-0 bg-aurora opacity-80" />
      <div className="fixed inset-0 bg-runes opacity-30" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <p className="letterspace font-display text-xs text-white/60">
            WELCOME, TRAVELER
          </p>

          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            You have stumbled upon{" "}
            <span className="text-white">Hashem Abdelati’s</span> resume.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-white/75">
            Enter the codex to explore: character sheet, quests, skill tree, and raven contact.
          </p>
        </div>

        {/* The actual book */}
        <div className="codex-stage">
        <span className="codex-spotlight" />
        <span className="codex-floor" />

        <button onClick={() => nav("/hub")} className="codex-link" aria-label="Open the Codex">
            <span className="codex-shimmer" />
            <img src={codexImg} className="codex-img codex-breathe" alt="Codex" />
        </button>
        </div>


        <p className="mt-12 font-body text-sm text-white/55">
          Built with React + TypeScript + Tailwind.
        </p>
      </div>
    </div>
  );
}
