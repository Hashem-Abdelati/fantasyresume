import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TalentCard from "../components/TalentCard";

type HubItem = {
  key: string;
  title: string;
  subtitle: string;
  progress: string;
  route: string;
  icon: string;
};

export default function Hub() {
  const nav = useNavigate();

  const items: HubItem[] = useMemo(
    () => [
      {
        key: "about",
        title: "ABOUT ME",
        subtitle: "Character Sheet",
        progress: "0 / 10",
        route: "/about",
        icon: "🜁",
      },
      {
        key: "projects",
        title: "PROJECTS",
        subtitle: "Quests",
        progress: "0 / 12",
        route: "/projects",
        icon: "✦",
      },
      {
        key: "experience",
        title: "WORK EXPERIENCE",
        subtitle: "Skill Tree",
        progress: "0 / 8",
        route: "/experience",
        icon: "⚔",
      },
      {
        key: "contact",
        title: "CONTACT",
        subtitle: "Send Raven",
        progress: "0 / 4",
        route: "/contact",
        icon: "🕊",
      },
    ],
    []
  );

  const [selected, setSelected] = useState<string>(items[0].key);

  const selectedItem = items.find((i) => i.key === selected) ?? items[0];

  return (
    <div className="hub-scene relative min-h-[calc(100vh-120px)] rounded-2xl px-4 py-6 md:px-8 md:py-8">
      {/* Header strip */}
      <div className="hub-header mb-6 rounded-xl px-4 py-3 md:px-6">
        <p className="hub-kicker">GRAND HALL OF TALENTS</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="hub-copy">
            Choose your path. Each card opens a major section of the codex.
          </p>

          <button
            className="hub-continue-btn"
            onClick={() => nav(selectedItem.route)}
          >
            Continue →
          </button>
        </div>
      </div>

      {/* Card row */}
      <div className="hub-card-row">
        {items.map((item) => (
          <TalentCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            progress={item.progress}
            icon={item.icon}
            selected={selected === item.key}
            onHover={() => setSelected(item.key)}
            onClick={() => nav(item.route)}
          />
        ))}
      </div>

      {/* Helper text */}
      <p className="mt-5 text-center font-body text-sm text-white/65">
        Hover to inspect • Click to enter chamber
      </p>
    </div>
  );
}
