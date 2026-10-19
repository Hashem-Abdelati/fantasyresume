import { Link } from "react-router-dom";
import FolioPage from "../components/book/FolioPage";

const skills = [
  {
    title: "Languages",
    nodes: [
      ["Python", "Core"],
      ["TypeScript", "Core"],
      ["JavaScript", "Strong"],
      ["SQL", "Strong"],
      ["C", "Familiar"],
      ["C#", "Familiar"],
    ],
  },
  {
    title: "Frameworks",
    nodes: [
      ["React", "Core"],
      ["Node.js", "Core"],
      ["Express", "Strong"],
      ["Prisma", "Strong"],
      ["Tailwind", "Strong"],
      ["FastAPI", "Familiar"],
    ],
  },
  {
    title: "Other skills",
    nodes: [
      ["PostgreSQL", "Core"],
      ["REST APIs", "Core"],
      ["Auth/JWT", "Strong"],
      ["Pinecone", "Familiar"],
      ["LangChain", "Familiar"],
      ["Git/GitHub", "Strong"],
    ],
  },
];

export default function About() {
  return (
    <>
      <FolioPage side="left" title="The Character" number="01">
        <p className="folio-kicker">CHAPTER I · THE CHARACTER</p>
        <h1 className="folio-title">
          A curious mind.
          <br />
          <em>A builder at heart.</em>
        </h1>
        <div className="folio-portrait-row">
          <figure className="folio-portrait">
            <img
              src="/portrait.webp"
              width="800"
              height="1067"
              alt="Hashem Abdelati"
            />
            <figcaption>THE ADVENTURER</figcaption>
          </figure>
          <div className="folio-identity">
            <span className="folio-seal">H</span>
            <h2>
              Hashem
              <br />
              Abdelati
            </h2>
            <p>Aspiring Software/Data Engineer</p>
            <small>LEVEL 22 · HP 99</small>
          </div>
        </div>
        <p className="folio-dropcap">
          I’m driven by the idea that data and machine learning can be used to
          solve real human problems, particularly in health &amp; wellbeing. I
          enjoy exploring all corners of computer science and am always curious
          to learn more about how the world works.
        </p>
        <dl className="folio-facts">
          <div>
            <dt>Discipline</dt>
            <dd>Computer Science</dd>
          </div>
          <div>
            <dt>Education</dt>
            <dd>Senior · George Washington University</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>Data · Machine Learning · Applied CS</dd>
          </div>
          <div>
            <dt>Approach</dt>
            <dd>Learn by building and experimenting</dd>
          </div>
          <div>
            <dt>Motivation</dt>
            <dd>Using technology to create real-world impact</dd>
          </div>
        </dl>
        <Link className="folio-text-link" to="/inventory">
          A little more about me — explore my inventory ↗
        </Link>
      </FolioPage>
      <FolioPage side="right" title="Traits & Mastery" number="02">
        <p className="folio-kicker">THE CHARACTER SHEET</p>
        <h2 className="folio-title">Traits &amp; mastery</h2>
        <div className="folio-traits">
          {[
            [
              "✦",
              "Interdisciplinary Curiosity",
              "I’m drawn to the space where computer science, data, and real-world problems meet.",
            ],
            [
              "⌁",
              "Learning-Focused Mindset",
              "I’m constantly exploring new tools, concepts, and domains — breadth matters to me.",
            ],
            [
              "⟠",
              "Applied Machine Learning",
              "I’m interested in ML not as theory alone, but as something that can drive impact.",
            ],
          ].map(([glyph, title, description]) => (
            <section key={title}>
              <span aria-hidden="true">{glyph}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </section>
          ))}
        </div>
        <div className="folio-section-heading">
          <h3>Codex of Mastery</h3>
          <span>THE SKILL TREE</span>
        </div>
        <p className="folio-small">
          The languages, frameworks, and tools in my spellbook.
        </p>
        <div className="folio-skill-tree">
          {skills.map((tree) => (
            <section key={tree.title}>
              <h4>{tree.title}</h4>
              <ul>
                {tree.nodes.map(([name, level]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <small>{level}</small>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <blockquote className="folio-quote">
          “Curiosity builds brighter worlds.”
        </blockquote>
      </FolioPage>
    </>
  );
}
