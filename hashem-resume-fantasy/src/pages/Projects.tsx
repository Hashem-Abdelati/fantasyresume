import ArcaneCard from "../components/ArcaneCard";

const quests = [
  {
    title: "Quest: Sports Matching Platform",
    subtitle: "Recommendations, profiles, messaging",
    body: "Add your project: problem, your solution, measurable outcome, and stack.",
    tags: ["React", "Node", "Postgres"],
  },
  {
    title: "Quest: Data Intelligence System",
    subtitle: "Natural language over databases",
    body: "Add your project: what you built, why it matters, and how it works.",
    tags: ["LLMs", "SQL", "Pipelines"],
  },
];

export default function Projects() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Quests</h2>
        <p className="mt-2 text-white/70">
          Projects presented as quests: objective, approach, loot (impact), and stack.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {quests.map((q) => (
          <ArcaneCard key={q.title} title={q.title} subtitle={q.subtitle}>
            <p className="text-white/80">{q.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {q.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/10">
                  {t}
                </span>
              ))}
            </div>
          </ArcaneCard>
        ))}
      </div>
    </div>
  );
}
