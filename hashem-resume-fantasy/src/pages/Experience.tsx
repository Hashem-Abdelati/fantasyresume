import { useSearchParams } from "react-router-dom";
import FolioPage from "../components/book/FolioPage";
import { nodes } from "../data/journey";

export default function Experience() {
  const [params, setParams] = useSearchParams();
  const node = nodes.find((n) => n.id === params.get("role")) ?? nodes[0];
  const select = (id: string) => {
    setParams({ role: id });
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".folio-right .folio-scroll")
        ?.scrollTo({ top: 0 });
      document
        .getElementById("experience-title")
        ?.focus({ preventScroll: true });
      if (matchMedia("(max-width: 760px)").matches)
        document
          .querySelector(".folio-right")
          ?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  };
  return (
    <>
      <FolioPage side="left" title="The Journey" number="05">
        <p className="folio-kicker">CHAPTER III · THE JOURNEY</p>
        <h1 className="folio-title">
          Experience
          <br />
          <em>is the best teacher.</em>
        </h1>
        <p className="folio-intro">
          From building for millions to exploring the possibilities of machine
          learning. Every role, another chapter.
        </p>
        <div className="folio-journey-mark" aria-hidden="true">
          ✧<span>2023 — 2025</span>
        </div>
        <div className="folio-timeline">
          {nodes.map((n, i) => (
            <button
              key={n.id}
              onClick={() => select(n.id)}
              aria-pressed={node.id === n.id}
              aria-label={`Read ${n.role} at ${n.org}`}
            >
              <span className="timeline-number">0{nodes.length - i}</span>
              <span>
                <small>{n.timeframe}</small>
                <strong>{n.org}</strong>
                <span>{n.role}</span>
                <small>{n.location}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <p className="folio-margin-note">
          A continuing journey in software, data, and the spaces between.
        </p>
      </FolioPage>
      <FolioPage side="right" title="Field Notes" number="06">
        <article className="folio-dossier" aria-labelledby="experience-title">
          <p className="folio-kicker">
            {node.type === "research"
              ? "RESEARCH"
              : node.type === "leadership"
                ? "LEADERSHIP"
                : "WORK EXPERIENCE"}{" "}
            · {node.org}
          </p>
          <h2 id="experience-title" className="folio-title" tabIndex={-1}>
            {node.role}
          </h2>
          <p className="folio-intro">
            {node.org} · {node.location}
          </p>
          <p className="folio-dates">{node.timeframe}</p>
          <section>
            <h3>Responsibilities &amp; impact</h3>
            <ol className="folio-impact">
              {node.desc.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ol>
          </section>
          {!!node.stack?.length && (
            <section>
              <h3>Tools mastered</h3>
              <div className="folio-tags">
                {node.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </section>
          )}
        </article>
      </FolioPage>
    </>
  );
}
