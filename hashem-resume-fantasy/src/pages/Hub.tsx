import { useNavigate } from "react-router-dom";
import ArcaneCard from "../components/ArcaneCard";

export default function Hub() {
  const nav = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">The Grand Hall</h2>
        <p className="mt-2 text-white/70">
          Choose a chamber: your character sheet, quests, skill tree, or send a raven.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ArcaneCard
          title="About Me"
          subtitle="Character sheet"
          onClick={() => nav("/about")}
        >
          Stats, identity, and a clean professional summary.
        </ArcaneCard>

        <ArcaneCard
          title="Projects"
          subtitle="Quests completed"
          onClick={() => nav("/projects")}
        >
          Each project is a quest with impact, stack, and outcomes.
        </ArcaneCard>

        <ArcaneCard
          title="Work Experience"
          subtitle="Skill tree"
          onClick={() => nav("/experience")}
        >
          Roles become unlockable nodes with measurable growth.
        </ArcaneCard>

        <ArcaneCard
          title="Contact"
          subtitle="Send a raven"
          onClick={() => nav("/contact")}
        >
          A letter-style contact form plus links.
        </ArcaneCard>
      </div>
    </div>
  );
}
