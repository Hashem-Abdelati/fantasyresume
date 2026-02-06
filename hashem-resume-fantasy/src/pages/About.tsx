import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import StatPill from "../components/StatPill";



type SkillNode = {
  name: string;
  level: "core" | "strong" | "familiar";
};

function SkillTreeModal({ onClose }: { onClose: () => void }) {
  const trees: { title: string; nodes: SkillNode[] }[] = [
    {
      title: "Languages",
      nodes: [
        { name: "Python", level: "core" },
        { name: "TypeScript", level: "core" },
        { name: "JavaScript", level: "strong" },
        { name: "SQL", level: "strong" },
        { name: "C", level: "familiar" },
        { name: "C#", level: "familiar" },
      ],
    },
    {
      title: "Frameworks",
      nodes: [
        { name: "React", level: "core" },
        { name: "Node.js", level: "core" },
        { name: "Express", level: "strong" },
        { name: "Prisma", level: "strong" },
        { name: "Tailwind", level: "strong" },
        { name: "FastAPI", level: "familiar" },
      ],
    },
    {
      title: "Other Skills",
      nodes: [
        { name: "PostgreSQL", level: "core" },
        { name: "REST APIs", level: "core" },
        { name: "Auth/JWT", level: "strong" },
        { name: "Pinecone", level: "familiar" },
        { name: "LangChain", level: "familiar" },
        { name: "Git/GitHub", level: "strong" },
      ],
    },
  ];

  return (
    <div className="skilltree-backdrop" onClick={onClose}>
      <div
        className="skilltree-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Skill Tree"
      >
        <div className="skilltree-head">
          <div>
            <p className="sheet-kicker">SKILL TREE</p>
            <h3 className="font-cinzel text-2xl text-[rgba(255,240,196,0.96)]">
              Codex of Mastery
            </h3>
            <p className="font-imfell text-[rgba(255,255,255,0.74)] text-lg">
              Languages • Frameworks • Other Skills
            </p>
          </div>

          <button className="skilltree-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="skilltree-grid">
          {trees.map((tree) => (
            <section key={tree.title} className="tree-panel">
              <h4 className="tree-title">{tree.title}</h4>

              <div className="tree-rail">
                {tree.nodes.map((node, idx) => (
                  <div key={node.name} className="tree-node-wrap">
                    <div className={`tree-node ${node.level}`}>
                      <Sparkles size={14} />
                    </div>

                    <div className="tree-node-text">
                      <div className="tree-node-name">{node.name}</div>
                      <div className="tree-node-level">
                        {node.level === "core"
                          ? "Core"
                          : node.level === "strong"
                          ? "Strong"
                          : "Familiar"}
                      </div>
                    </div>

                    {idx < tree.nodes.length - 1 && <div className="tree-link" />}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function About() {
  const [openSkillTree, setOpenSkillTree] = useState(false);

  const spellbook = [
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Tailwind",
    "Python",
    "APIs",
    "Auth/JWT",
  ];

  return (
    <>
      <div className="character-screen">
        {/* Ambient rings behind everything */}
        <div className="character-rings" aria-hidden="true" />

        <div className="character-grid">
          {/* LEFT: Portrait panel */}
          <section className="portrait-panel">
            <div className="portrait-frame">
              {/* Option A: real image */}
            {/* <img src="/headshot-cutout.png" alt="Hashem Abdelati" className="portrait-img" /> */ }
            <img src="/Hashem2.jpeg" alt="Hashem Abdelati" className="portrait-img" />

              {/* Placeholder
              <div className="portrait-placeholder">
                <div className="portrait-initials">HA</div>
                <div className="portrait-note">Drop a headshot into /public/headshot-cutout.png</div>
              </div> */}

              <div className="portrait-glow" aria-hidden="true" />
            </div>

            <div className="portrait-meta">
              <div className="level-badge">
                <span className="level-dot" />
                <span className="level-text">Level 22</span>
              </div>

              <h2 className="portrait-name">Hashem Abdelati</h2>
              <p className="portrait-title">Aspiring Software/Data Engineer</p>

              <div className="portrait-pills">
                <StatPill label="HP" value="99" />
                <StatPill label="Magic" value="Computer Science" />
                <StatPill label="Class" value="Senior - George Washington University" />
              </div>

              <p className="portrait-bio">
            I’m driven by the idea that data and machine learning can be used to solve real human problems, particularly in health & wellbeing. I enjoy exploring all corners of computer science and am always curious to learn more about how the world works.

              </p>

              {/* Inventory CTA */}
              <div className="mt-4">
                <Link to="/inventory" className="inventory-cta">
                  Wanna learn more about me? Check my inventory
                </Link>
              </div>
            </div>
          </section>

          {/* RIGHT: Character sheet */}
          <section className="sheet-panel">
            <div className="sheet-header">
              <div className="sheet-kicker">CHARACTER SHEET</div>
              <div className="sheet-sub">
                Core capabilities, strengths, and tools — presented like a game stat card.
              </div>
            </div>

            <div className="sheet-body">
              {/* Traits */}
              <div className="sheet-block">
                <h3 className="sheet-title">Signature Traits</h3>

                <div className="trait">
                <div className="trait-icon">✦</div>
                <div>
                    <div className="trait-name">Interdisciplinary Curiosity</div>
                    <div className="trait-desc">
                    I’m drawn to the space where computer science, data, and real-world problems meet.
                    </div>
                </div>
                </div>

                <div className="trait">
                <div className="trait-icon">⌁</div>
                <div>
                    <div className="trait-name">Learning-Focused Mindset</div>
                    <div className="trait-desc">
                    I’m constantly exploring new tools, concepts, and domains — breadth matters to me.
                    </div>
                </div>
                </div>

                <div className="trait">
                <div className="trait-icon">⟠</div>
                <div>
                    <div className="trait-name">Applied Machine Learning</div>
                    <div className="trait-desc">
                    I’m interested in ML not as theory alone, but as something that can drive impact.
                    </div>
                </div>
                </div>
              </div>

              {/* Stats
              <div className="sheet-block">
                <h3 className="sheet-title">Attributes</h3>

                <div className="sheet-stats">
                  <StatBar label="Strength" value={86} rightText="Shipping" />
                  <StatBar label="Defense" value={82} rightText="Reliability" />
                  <StatBar label="Runic" value={90} rightText="Architecture" />
                  <StatBar label="Mana" value={88} rightText="TypeScript/React" />
                  <StatBar label="Vitality" value={84} rightText="Consistency" />
                  <StatBar label="Critical" value={79} rightText="Security" />
                </div>
              </div> */}

              {/* Spellbook -> opens skill tree modal */}
              <div className="sheet-block">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="sheet-title !mb-0">Spellbook</h3>
                  <button
                    onClick={() => setOpenSkillTree(true)}
                    className="spell-tag inline-flex items-center gap-2"
                  >
                    <Sparkles size={14} />
                    Open Skill Tree
                  </button>
                </div>

                <div className="spell-tags mt-3">
                  {spellbook.map((s) => (
                    <span key={s} className="spell-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

                {/* Quick facts */}
                <div className="sheet-block">
                <h3 className="sheet-title">Quick Facts</h3>
                <div className="facts">
                    <div className="fact">
                    <span className="fact-k">Focus</span>
                    <span className="fact-v">Data • Machine Learning • Applied CS</span>
                    </div>
                    <div className="fact">
                    <span className="fact-k">Approach</span>
                    <span className="fact-v">Learn by building and experimenting</span>
                    </div>
                    <div className="fact">
                    <span className="fact-k">Motivation</span>
                    <span className="fact-v">Using technology to create real-world impact</span>
                    </div>
                </div>
                </div>
            </div>

            {/* Decorative corner filigree */}
            <div className="sheet-filigree tl" aria-hidden="true" />
            <div className="sheet-filigree tr" aria-hidden="true" />
            <div className="sheet-filigree bl" aria-hidden="true" />
            <div className="sheet-filigree br" aria-hidden="true" />
          </section>
        </div>
      </div>

      {openSkillTree && <SkillTreeModal onClose={() => setOpenSkillTree(false)} />}
    </>
  );
}
