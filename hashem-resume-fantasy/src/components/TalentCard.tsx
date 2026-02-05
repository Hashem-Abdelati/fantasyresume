type TalentCardProps = {
  title: string;
  subtitle: string;
  progress: string;
  icon: string;
  selected?: boolean;
  onHover?: () => void;
  onClick?: () => void;
};

export default function TalentCard({
  title,
  subtitle,
  progress,
  icon,
  selected = false,
  onHover,
  onClick,
}: TalentCardProps) {
  return (
    <button
      type="button"
      className={`talent-card ${selected ? "is-selected" : ""}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      aria-label={`Open ${subtitle}`}
    >
      <span className="talent-foil" />
      <span className="talent-corner tl" />
      <span className="talent-corner tr" />
      <span className="talent-corner bl" />
      <span className="talent-corner br" />

      <div className="talent-inner">
        <div className="talent-icon-wrap">
          <span className="talent-icon">{icon}</span>
        </div>

        <div className="talent-title">{title}</div>
        <div className="talent-subtitle">{subtitle}</div>

        <div className="talent-progress">
          <span>{progress}</span>
        </div>
      </div>
    </button>
  );
}
