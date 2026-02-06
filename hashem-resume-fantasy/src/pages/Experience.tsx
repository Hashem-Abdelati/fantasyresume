import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

type ExperienceNode = {
  id: string;
  role: string;
  org: string;
  timeframe: string;
  location?: string;
  type?: "work" | "research" | "leadership";
  desc: string[];
  stack?: string[];
};

const nodes: ExperienceNode[] = [
  {
    id: "zain-ml-intern",
    role: "Machine Learning Intern",
    org: "Zain",
    timeframe: "May 2025 – August 2025",
    location: "Amman, Jordan",
    type: "work",
    desc: [
      "Helped develop an AI-powered call-center assistant by implementing semantic search with OpenAI embeddings and a Pinecone vector database, enabling instant retrieval from hundreds of internal SOPs and support documents.",
      "Built a multilingual (English/Arabic) retrieval pipeline in Python (LangChain), including document cleaning/normalization, chunking, metadata tagging (department/product/version), and top-k retrieval for accurate grounded responses.",
      "Set up incremental indexing and retrieval filters to keep the knowledge base synchronized as documents changed and to prevent outdated content from being surfaced.",
      "Deployed the assistant to support 120+ customer-service agents per day, reducing average customer hold time by 22% across markets by eliminating manual lookup delays.",
    ],
    stack: [
      "Python",
      "LangChain",
      "OpenAI Embeddings",
      "Pinecone",
      "Semantic Search",
      "RAG",
      "Multilingual NLP",
    ],
  },
  {
    id: "ligadata-swe-intern",
    role: "Software Engineering Intern",
    org: "LigaData",
    timeframe: "January 2024 – June 2024",
    location: "Washington, DC",
    type: "work",
    desc: [
      "Conducted unit and integration testing with Postman, JUnit, and automation scripts to identify defects and validate functionality/performance.",
      "Integrated Python-based data pipelines with AI/ML components to improve Future Time Machine (FTM) processing of large-scale telecom subscriber datasets.",
      "Optimized FTM compliance workflows with real-time monitoring and resource-allocation logic, supporting deployments across multiple global telecom operators.",
      "Contributed to managed data-service capabilities that improved operator decision-making, resource optimization, and AI-driven analytics outcomes.",
    ],
    stack: [
      "Python",
      "Postman",
      "JUnit",
      "AI/ML Pipelines",
      "Data Engineering",
      "Monitoring",
      "Telecom Analytics",
    ],
  },
  {
    id: "mawdoo3-fullstack-intern",
    role: "Full-Stack Engineering Intern",
    org: "Mawdoo3",
    timeframe: "May 2023 – August 2023",
    location: "Amman, Jordan",
    type: "work",
    desc: [
      "Enhanced the Mawdoo3 platform (50M+ monthly users) by building responsive front-end features and improving usability with HTML, CSS, and JavaScript.",
      "Led login experience improvements by architecting semantic HTML and optimizing CSS for cross-device responsiveness, faster loads, and a cleaner UX.",
      "Contributed to a high-traffic Arabic content ecosystem accessed by millions, collaborating closely with engineers to deliver features on tight timelines.",
      "Worked across frontend and backend-adjacent workflows, gaining hands-on exposure to PHP, Python, and SQL while maintaining product quality at scale.",
    ],
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive UI",
      "PHP",
      "Python",
      "SQL",
      "Frontend Engineering",
    ],
  },
];

function typeLabel(t?: ExperienceNode["type"]) {
  if (t === "research") return "Research Node";
  if (t === "leadership") return "Leadership Node";
  return "Work Node";
}

export default function Experience() {
  const [openId, setOpenId] = useState<string>(nodes[0].id);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? "" : id));
  };

  return (
    <section className="character-screen">
      <div className="character-rings" />

      <div className="relative z-10">
        <header className="mb-6 md:mb-8">
          <p className="sheet-kicker">My Journey</p>
          <h2 className="mt-1 font-cinzel text-3xl md:text-4xl text-[rgba(255,240,196,0.96)]">
            Experience Timeline
          </h2>
          <p className="mt-2 text-[rgba(255,255,255,0.72)] font-imfell text-lg">
            Roles become nodes. Click a node to reveal impact, responsibilities, and tools mastered.
          </p>
        </header>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[rgba(255,215,140,0.26)]" />

          <div className="space-y-4 md:space-y-5">
            {nodes.map((n) => {
              const isOpen = openId === n.id;

              return (
                <article key={n.id} className="relative pl-12">
                  <button
                    aria-label={`Toggle ${n.role}`}
                    onClick={() => toggle(n.id)}
                    className={`absolute left-0 top-5 grid h-10 w-10 place-items-center rounded-full border transition
                    ${
                      isOpen
                        ? "border-[rgba(255,220,150,0.7)] bg-[rgba(255,210,120,0.14)] shadow-[0_0_24px_rgba(255,210,120,0.3)]"
                        : "border-[rgba(255,220,150,0.35)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,210,120,0.1)]"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 text-[rgba(255,236,190,0.95)]" />
                  </button>

                  <div
                    className={`rounded-2xl border transition-all duration-300
                      ${
                        isOpen
                          ? "border-[rgba(255,215,140,0.34)] bg-[linear-gradient(180deg,rgba(45,19,14,0.74),rgba(20,10,10,0.78))] shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
                          : "border-[rgba(255,215,140,0.2)] bg-[rgba(255,255,255,0.04)]"
                      }
                    `}
                  >
                    <button
                      onClick={() => toggle(n.id)}
                      className="w-full text-left p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-cinzel text-xs tracking-[0.18em] uppercase text-[rgba(255,240,196,0.72)]">
                            {typeLabel(n.type)}
                          </p>
                          <h3 className="mt-1 font-cinzel text-xl md:text-2xl text-[rgba(255,240,196,0.96)]">
                            {n.role}
                          </h3>
                          <p className="mt-1 font-imfell text-lg text-[rgba(255,255,255,0.8)]">
                            {n.org}
                            {n.location ? ` • ${n.location}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-[rgba(255,215,140,0.25)] bg-[rgba(0,0,0,0.25)] px-3 py-1 font-cinzel text-xs tracking-[0.08em] text-[rgba(255,240,196,0.85)]">
                            {n.timeframe}
                          </span>
                          <ChevronDown
                            className={`h-5 w-5 text-[rgba(255,240,196,0.9)] transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 md:px-5 md:pb-5">
                          <div className="h-px w-full bg-[rgba(255,215,140,0.16)] mb-4" />

                          <ul className="space-y-2 list-disc pl-5 text-[rgba(255,255,255,0.82)]">
                            {n.desc.map((d) => (
                              <li key={d} className="font-imfell text-[1.05rem] leading-relaxed">
                                {d}
                              </li>
                            ))}
                          </ul>

                          {n.stack?.length ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {n.stack.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full border border-[rgba(255,215,140,0.2)] bg-[rgba(255,255,255,0.06)] px-3 py-1 font-cinzel text-xs tracking-[0.06em] text-[rgba(255,240,196,0.9)]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
