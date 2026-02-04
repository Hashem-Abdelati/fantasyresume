import ArcaneCard from "../components/ArcaneCard";
import StatPill from "../components/StatPill";

export default function About() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <ArcaneCard title="Adventurer Profile" subtitle="Character selection">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-white/10 ring-1 ring-white/15" />
            <div>
              <div className="text-base font-semibold">Hashem Abdelati</div>
              <div className="text-sm text-white/70">Software Engineer</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatPill label="HP" value="99" />
                <StatPill label="Mana" value="TypeScript" />
                <StatPill label="Class" value="Full-Stack" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-white/80">
            <p>
              Replace this with a sharp 3–4 sentence summary: what you build, what you care about,
              and what outcomes you deliver.
            </p>
            <p className="text-white/60">
              Next: add a real headshot in /public and swap the placeholder.
            </p>
          </div>
        </ArcaneCard>
      </div>

      <div className="md:col-span-2 space-y-6">
        <ArcaneCard title="Core Attributes" subtitle="What I’m strongest at">
          <ul className="list-disc pl-5 space-y-2 text-white/80">
            <li>Full-stack product building (React, APIs, databases)</li>
            <li>Data + systems thinking (pipelines, analytics, reliability)</li>
            <li>Security-minded engineering (auth, validation, threat awareness)</li>
          </ul>
        </ArcaneCard>

        <ArcaneCard title="Spellbook" subtitle="Tech stack">
          <div className="flex flex-wrap gap-2">
            {["TypeScript", "React", "Node", "PostgreSQL", "Tailwind", "Prisma", "Python"].map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/10">
                {s}
              </span>
            ))}
          </div>
        </ArcaneCard>
      </div>
    </div>
  );
}
