import ArcaneCard from "../components/ArcaneCard";

const nodes = [
  {
    role: "Intern / Engineer Node",
    org: "Company Name",
    timeframe: "YYYY – YYYY",
    desc: ["Impact bullet 1", "Impact bullet 2", "Impact bullet 3"],
  },
  {
    role: "Research / Project Node",
    org: "Lab / Team",
    timeframe: "YYYY – YYYY",
    desc: ["Impact bullet 1", "Impact bullet 2"],
  },
];

export default function Experience() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Skill Tree</h2>
        <p className="mt-2 text-white/70">
          Roles become nodes. Each node unlocks skills and measurable outcomes.
        </p>
      </div>

      <div className="space-y-4">
        {nodes.map((n) => (
          <ArcaneCard
            key={n.role}
            title={n.role}
            subtitle={`${n.org} • ${n.timeframe}`}
          >
            <ul className="list-disc space-y-2 pl-5 text-white/80">
              {n.desc.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </ArcaneCard>
        ))}
      </div>
    </div>
  );
}
