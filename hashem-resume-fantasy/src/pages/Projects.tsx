import { useMemo, useState } from "react";

type QuestStatus = "completed" | "in_progress";

type QuestCompanion = {
  name: string;
  role?: string;
  link?: string;
};

type Quest = {
  id: string;
  title: string;
  subtitle: string;
  status: QuestStatus;
  difficulty: "Novice" | "Adept" | "Master";
  timeline: string;
  objective: string;
  approach: string[];
  loot: string[];
  stack: string[];
  companions?: QuestCompanion[];
  links?: {
    demo?: string;
    repo?: string;
    paper?: string;
  };
};

const quests: Quest[] = [
  {
    id: "spacenet-segmentation",
    title: "Quest: Deep Learning for Building Footprint Segmentation",
    subtitle: "Satellite imagery segmentation with PyTorch",
    status: "completed",
    difficulty: "Master",
    timeline: "2025",
    objective:
      "Extract pixel-level building footprints from high-resolution satellite imagery and benchmark segmentation performance on SpaceNet-2 (Las Vegas AOI).",
    approach: [
      "Implemented a ResNet-50 fully convolutional segmentation model in PyTorch for binary building-mask prediction.",
      "Designed end-to-end train/validation/evaluation pipelines using BCE loss with Adam optimization.",
      "Standardized experiment tracking for consistent metric comparison across runs.",
      "Validated model quality with IoU/F1-centered evaluation suitable for geospatial CV tasks.",
    ],
    loot: [
      "Achieved F1 = 0.8246 and IoU = 0.7016 on benchmarked evaluation.",
      "Produced a reproducible CV workflow for future architecture comparisons.",
      "Improved reliability of automated building-footprint extraction from satellite data.",
    ],
    stack: [
      "Python",
      "PyTorch",
      "ResNet-50",
      "Segmentation",
      "SpaceNet-2",
      "Computer Vision",
    ],
    companions: [
      {
        name: "Yousra El Zamzami",
        role: "- SegFormer architecture, data preperation and code review",
        link: "https://www.linkedin.com/in/yousraelzamzami/",
      },
    ],
    links: {
      repo: "https://github.com/Hashem-Abdelati/SkyMapper",
      paper: "../public/csci_4364_6364_F2025_SkyMapper.pdf",

    },
  },
  {
    id: "xv6-shared-memory",
    title: "Quest: Container Infrastructure for xv6 UNIX",
    subtitle: "Shared memory + virtual memory management",
    status: "completed",
    difficulty: "Master",
    timeline: "2024",
    objective:
      "Implement kernel-level shared-memory and virtual-memory mechanisms in xv6 to support safe IPC, efficient deallocation, and stronger process isolation.",
    approach: [
      "Developed a shared memory management system inside xv6 with kernel-level bookkeeping.",
      "Designed reference-counted shared-memory structures to guarantee correct cleanup on process exit/termination.",
      "Applied synchronization controls (mutexes and condition-variable style coordination) to protect concurrent shared-memory access.",
      "Contributed to containerized isolation behavior by constraining shared resources within namespace boundaries.",
    ],
    loot: [
      "Enabled reliable shared-memory IPC in a teaching OS environment.",
      "Reduced memory-leak and stale-mapping risks through deterministic refcount-based teardown.",
      "Strengthened process isolation guarantees for container-like execution contexts.",
    ],
    stack: ["C", "xv6", "OS Kernel", "Virtual Memory", "Synchronization", "Namespaces"],
  },
  {
    id: "arg-university-system",
    title: "Quest: University ARG System",
    subtitle: "Course registration, grading, and transcript workflows",
    status: "completed",
    difficulty: "Master",
    timeline: "2023",
    objective:
      "Build a full-stack Application, Registration, and Graduation (ARG) platform for students, instructors, and administrators with scalable and validated workflows.",
    approach: [
      "Implemented online course registration, grade submission, and transcript lookup/search across role-based interfaces.",
      "Designed a robust validation layer to protect data integrity across student/faculty/secretary actions.",
      "Built a scalable architecture on MySQL (AWS) with frontend flows optimized for usability and reliability.",
      "Engineered the system to support high concurrency and consistent behavior under heavy usage.",
    ],
    loot: [
      "Supported 2,000+ students and faculty in a unified academic workflow platform.",
      "Handled 500+ simultaneous users with stable performance.",
      "Delivered cleaner user experience for enrollment and transcript operations.",
    ],
    stack: ["Python", "HTML", "CSS", "JavaScript", "MySQL", "AWS"],
  },
  {
    id: "abdelati-comics",
    title: "Quest: AbdelatiComics E-Commerce Platform",
    subtitle: "Comic marketplace with full-stack data flow",
    status: "completed",
    difficulty: "Adept",
    timeline: "2023",
    objective:
      "Create an e-commerce platform for comic enthusiasts with seamless front-end shopping flows and reliable back-end data operations.",
    approach: [
      "Engineered product browsing and transaction-oriented UI flows tailored to comic buyers.",
      "Integrated frontend interactions with backend/database operations for consistent catalog and user actions.",
      "Structured core commerce logic to keep inventory/customer actions synchronized.",
      "Focused on smooth UX and clean data movement across the app layers.",
    ],
    loot: [
      "Delivered a niche e-commerce experience targeted to comic-book users.",
      "Established dependable front-back integration patterns for marketplace features.",
      "Built a base architecture expandable to payments, accounts, and order-history features.",
    ],
    stack: ["JavaScript", "HTML", "CSS", "Full-Stack Development", "Database Operations"],
  },
  {
  id: "middle-man-sports-matching",
  title: "Quest: Middle Man",
  subtitle: "Full-stack sports partner matching + pickup game coordination",
  status: "in_progress",
  difficulty: "Master",
  timeline: "2025 – Present",
  objective:
    "Build a full-stack platform that helps users find compatible sports partners and organize pickup games using ranked recommendations based on distance, skill similarity, and schedule overlap.",
  approach: [
    "Designed a multi-service architecture: React + Tailwind frontend, Node/Express + Prisma + PostgreSQL/AWS backend, and a Python FastAPI matchmaking service.",
    "Implemented recommendation flow where the backend builds sport-filtered candidate pairs, sends features to the ML service, and returns ranked results to the UI.",
    "Engineered pairwise features using Haversine-based distance similarity, skill-gap similarity, and availability overlap from a 336-slot weekly time-bitset with Jaccard scoring.",
    "Built a resilient ranking pipeline with V2 logistic-regression model scoring (`p_success`) and automatic fallback to deterministic V1 weighted scoring when model artifacts are unavailable.",
    "Delivered core product modules including auth, onboarding, profile editing, sports/facilities, feed, and open-game create/join/cancel workflows.",
  ],
  loot: [
    "Enabled end-to-end, sport-specific partner recommendations with explainable ranking signals.",
    "Established a scalable service boundary between app API and ML scoring engine for future model upgrades.",
    "Created strong production-style foundations for real-time matchmaking, game orchestration, and growth-ready feature expansion.",
  ],
  stack: [
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "Prisma",
    "PostgreSQL",
    "Python",
    "FastAPI",
    "scikit-learn",
    "Machine Learning",
  ],
  companions: [
      {
        name: "Ilinca Hirtopanu",
        role: "- Co-contributor on frontend and backend development, data flow design, and code review",
        link: "https://www.linkedin.com/in/ilinca-hirtopanu/",
      },
      {
        name: "Niquita Varier",
        role: "- Co-contributor on backend development and AWS database management",
        link: "https://www.linkedin.com/in/niquita-varier/",
      },
      {
        name: "Kurdo Shali",
        role: "- Co-contributor on machine learning-based recommendation features",
        link: "https://www.linkedin.com/in/kurdo-shali/",
      },
  ],
  links: {
    repo: "https://github.com/Hashem-Abdelati/senior-design-ihnk"
  }
},
  {
    id: "exercise-screen-time",
    title: "Quest: Exercise for Screen Time",
    subtitle: "Earn social media time through pushups (iOS MVP)",
    status: "in_progress",
    difficulty: "Master",
    timeline: "2025 – Present",
    objective:
      "Reduce doom-scrolling by requiring exercise to unlock social-media usage through a pushup-to-time-bank system.",
    approach: [
      "Built an iOS MVP where 1 pushup earns 1 minute of app usage time.",
      "Used front-camera pose estimation (Apple Vision) to count pushups and update a local time bank.",
      "Implemented a Shortcuts-based enforcement workaround that redirects users from TikTok/Instagram when minutes are depleted.",
      "Designed minute-spend logic and ongoing improvements for detection thresholds, UI polish, and expanded exercise modes.",
    ],
    loot: [
      "Validated the core behavior loop: effort-gated screen time with real friction.",
      "Created a working non-paid workaround despite iOS third-party app-blocking constraints.",
      "Laid foundation for stronger enforcement flows and additional exercise mechanics.",
    ],
    stack: ["Swift", "iOS", "Apple Vision", "Shortcuts Automation", "MVP Prototyping"],
    links: {
      repo: "https://github.com/Hashem-Abdelati/exerciseforscreentime",
    },
  },
  {
  id: "ai-npc-town-sim",
  title: "Quest: AI NPC Town Sim",
  subtitle: "In-character NPC dialogue with memory + retrieval (local LLM)",
  status: "in_progress",
  difficulty: "Master",
  timeline: "2025 – Present",
  objective:
    "Build a data-driven NPC simulation where players explore towns and converse with NPCs that stay in-character using persistent memory and retrieval-augmented local LLM prompting.",
  approach: [
    "Architected a modular Python system with separate layers for game state, NPC logic, memory storage, retrieval, and LLM orchestration.",
    "Implemented multi-source memory grounding: short-term dialogue history, NPC profile memory (backstory/relationships), world knowledge, and public rumor/flag memory.",
    "Built embedding-based top-k retrieval to select relevant context snippets each turn and inject them into prompt construction for more coherent, grounded responses.",
    "Integrated Ollama for local model serving and configurable generation controls (model, temperature, max tokens) to support offline, hackable experimentation.",
    "Developed two interfaces: a simple CLI REPL (`main.py`) and a keyboard-driven curses TUI (`maintui.py`) for richer interaction loops.",
    "Designed world content as JSON-first data (`data/`) so towns, lore, NPCs, and memory files can be expanded rapidly without heavy code changes.",
  ],
  loot: [
    "Delivered an in-progress but functional prototype where NPCs maintain persona consistency across conversations.",
    "Improved dialogue grounding quality by combining retrieval across four memory channels instead of relying on raw chat history alone.",
    "Created an extensible foundation for future features such as quests, town-state mutation, inventories, and long-term world simulation.",
  ],
  stack: [
    "Python",
    "Ollama",
    "Local LLMs",
    "Sentence-Transformers",
    "Embeddings",
    "RAG",
    "Curses TUI",
    "JSON Data Modeling",
  ],
  links: {
    repo: "https://github.com/Hashem-Abdelati/ainpc",
  },
},
];

function statusLabel(status: QuestStatus) {
  return status === "completed" ? "Completed" : "In Progress";
}

export default function Projects() {
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);

  const activeQuest = useMemo(
    () => quests.find((q) => q.id === activeQuestId) ?? null,
    [activeQuestId]
  );

  const completed = quests.filter((q) => q.status === "completed");
  const inProgress = quests.filter((q) => q.status === "in_progress");

  return (
    <section className="quests-page">
      <div className="quests-header">
        <h2>Quest Log</h2>
        <p>
          Completed quests are shipped projects. In-progress quests are what I’m actively building now.
          Select a quest to inspect the full dossier.
        </p>
      </div>

      <QuestSection
        title="In Progress Quests"
        subtitle="Active development"
        items={inProgress}
        onOpen={(id) => setActiveQuestId(id)}
      />

      <QuestSection
        title="Completed Quests"
        subtitle="Shipped projects"
        items={completed}
        onOpen={(id) => setActiveQuestId(id)}
      />

      {activeQuest && (
        <QuestModal quest={activeQuest} onClose={() => setActiveQuestId(null)} />
      )}
    </section>
  );
}

function QuestSection({
  title,
  subtitle,
  items,
  onOpen,
}: {
  title: string;
  subtitle: string;
  items: Quest[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="quest-section">
      <div className="quest-section-head">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>

      <div className="quest-grid">
        {items.map((q) => (
          <button
            key={q.id}
            className="quest-card"
            onClick={() => onOpen(q.id)}
            aria-label={`Open ${q.title}`}
          >
            <div className="quest-card-glyph">✦</div>

            <div className="quest-card-body">
              <p className={`quest-status ${q.status}`}>{statusLabel(q.status)}</p>
              <h4>{q.title}</h4>
              <p className="quest-subtitle">{q.subtitle}</p>
            </div>

            <div className="quest-card-foot">
              <span className="difficulty">{q.difficulty}</span>
              <span className="timeline">{q.timeline}</span>
            </div>

            <div className="quest-tags">
              {q.stack.slice(0, 4).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestModal({
  quest,
  onClose,
}: {
  quest: Quest;
  onClose: () => void;
}) {
  return (
    <div className="quest-modal-backdrop" onClick={onClose}>
      <div
        className="quest-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${quest.title} details`}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close quest details">
          ✕
        </button>

        <div className="quest-modal-header">
          <p className={`quest-status ${quest.status}`}>{statusLabel(quest.status)}</p>
          <h3>{quest.title}</h3>
          <p className="quest-subtitle">{quest.subtitle}</p>
        </div>

        <div className="quest-modal-meta">
          <span>Difficulty: {quest.difficulty}</span>
          <span>Timeline: {quest.timeline}</span>
        </div>

        <div className="quest-modal-content">
          <Section title="Objective">
            <p>{quest.objective}</p>
          </Section>
      
        {quest.companions?.length ? (
          <Section title="Companions">
            <div className="quest-companions">
              {quest.companions.map((c) => (
                <div key={`${c.name}-${c.link ?? ""}`} className="quest-companion">
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer" className="quest-companion-name">
                      {c.name}
                    </a>
                  ) : (
                    <span className="quest-companion-name">{c.name}</span>
                  )}
                  {c.role ? <span className="quest-companion-role">{c.role}</span> : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

          <Section title="Approach">
            <ul>
              {quest.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Section>

          <Section title="Loot (Impact)">
            <ul>
              {quest.loot.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Section>

          <Section title="Spellbook (Tech Stack)">
            <div className="quest-tags large">
              {quest.stack.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </Section>

          {(quest.links?.demo || quest.links?.repo) && (
            <Section title="Portals">
              <div className="quest-links">
                {quest.links?.demo && (
                  <a href={quest.links.demo} target="_blank" rel="noreferrer">
                    Live Demo
                  </a>
                )}
                {quest.links?.repo && (
                  <a href={quest.links.repo} target="_blank" rel="noreferrer">
                    Repository
                  </a>
                )}
                {quest.links?.paper && (
                  <a href={quest.links.paper} target="_blank" rel="noreferrer">
                    Paper
                  </a>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="quest-modal-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}
