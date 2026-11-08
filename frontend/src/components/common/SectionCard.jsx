import { RefreshCw } from "lucide-react";

export default function SectionCard({ icon: Icon, title, onRefresh, refreshing, refreshTitle, children }) {
  return (
    <section className="pd-card">
      <div className="pd-section-title">
        <Icon size={26} />
        <h2>{title}</h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="pd-refresh-btn"
            disabled={refreshing}
            title={refreshTitle}
          >
            <RefreshCw size={17} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}