import { useSearchParams } from "react-router-dom";
import FolioPage from "../components/book/FolioPage";
import { quests } from "../data/quests";

export default function Projects() {
  const [params, setParams] = useSearchParams();
  const quest =
    quests.find((q) => q.id === params.get("quest")) ??
    quests.find((q) => q.status === "in_progress")!;
  const select = (id: string) => {
    setParams({ quest: id });
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(".folio-right .folio-scroll")
        ?.scrollTo({ top: 0 });
      document.getElementById("quest-title")?.focus({ preventScroll: true });
      if (matchMedia("(max-width: 760px)").matches)
        document
          .querySelector(".folio-right")
          ?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  };
  return (
    <>
      <FolioPage side="left" title="The Quest Log" number="03">
        <p className="folio-kicker">CHAPTER II · THE QUESTS</p>
        <h1 className="folio-title">Quest Log</h1>
        <p className="folio-intro">
          Ideas put into practice. A record of what I’ve shipped, and what I’m
          building next.
        </p>
        {(["in_progress", "completed"] as const).map((status) => (
          <section className="folio-index-section" key={status}>
            <div className="folio-section-heading">
              <h2>
                {status === "completed" ? "Completed quests" : "In progress"}
              </h2>
              <span>
                {String(
                  quests.filter((q) => q.status === status).length,
                ).padStart(2, "0")}
              </span>
            </div>
            <div className="folio-index">
              {quests
                .filter((q) => q.status === status)
                .map((q) => (
                  <button
                    key={q.id}
                    aria-label={`Open ${q.title}`}
                    aria-pressed={q.id === quest.id}
                    onClick={() => select(q.id)}
                  >
                    <span className="index-star" aria-hidden="true">
                      ✧
                    </span>
                    <span>
                      <strong>{q.title.replace("Quest: ", "")}</strong>
                      <small>{q.subtitle}</small>
                    </span>
                    <span className="index-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                ))}
            </div>
          </section>
        ))}
      </FolioPage>
      <FolioPage side="right" title="Project Dossier" number="04">
        <article className="folio-dossier" aria-labelledby="quest-title">
          <p className="folio-kicker">
            {quest.status === "completed" ? "COMPLETED QUEST" : "IN PROGRESS"} ·{" "}
            {quest.timeline}
          </p>
          <h2 id="quest-title" className="folio-title" tabIndex={-1}>
            {quest.title.replace("Quest: ", "")}
          </h2>
          <p className="folio-intro">{quest.subtitle}</p>
          <p className="folio-small">DIFFICULTY · {quest.difficulty}</p>
          <section>
            <h3>Objective</h3>
            <p className="folio-dropcap">{quest.objective}</p>
          </section>
          <section>
            <h3>Approach</h3>
            <ol>
              {quest.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </section>
          <section>
            <h3>Loot &amp; impact</h3>
            <ul>
              {quest.loot.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Spellbook · tech stack</h3>
            <div className="folio-tags">
              {quest.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>
          {!!quest.companions?.length && (
            <section>
              <h3>Companions</h3>
              {quest.companions.map((c) => (
                <p key={c.name}>
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer">
                      {c.name}
                    </a>
                  ) : (
                    c.name
                  )}
                  {c.role && <span> {c.role}</span>}
                </p>
              ))}
            </section>
          )}
          {quest.links && (
            <section>
              <h3>Explore the work</h3>
              <div className="folio-portals">
                {quest.links.demo && (
                  <a href={quest.links.demo} target="_blank" rel="noreferrer">
                    Live demo ↗
                  </a>
                )}
                {quest.links.repo && (
                  <a href={quest.links.repo} target="_blank" rel="noreferrer">
                    Repository ↗
                  </a>
                )}
                {quest.links.paper && (
                  <a href={quest.links.paper} target="_blank" rel="noreferrer">
                    Read the paper ↗
                  </a>
                )}
              </div>
            </section>
          )}
        </article>
      </FolioPage>
    </>
  );
}
