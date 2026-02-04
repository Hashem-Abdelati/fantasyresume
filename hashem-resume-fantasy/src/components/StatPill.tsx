export default function StatPill(props: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-black/30 px-3 py-1 text-xs text-white/85 ring-1 ring-white/10">
      <span className="text-white/60">{props.label}:</span> {props.value}
    </div>
  );
}
