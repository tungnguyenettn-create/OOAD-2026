export default function StatCard({ icon: Icon, color, title, value, note }) {
  return (
    <article className="pt-stat">
      <div className={`pt-stat-icon pt-color-${color}`}>
        <Icon size={22} />
      </div>
      <div className="pt-stat-title">{title}</div>
      <div className="pt-stat-value">{value}</div>
      <div className="pt-stat-note">{note}</div>
    </article>
  );
}
