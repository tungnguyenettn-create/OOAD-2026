import { RefreshCw } from "lucide-react";

export default function RefreshButton({ loading, onClick, title = "Tải lại" }) {
  return (
    <button type="button" className="pt-btn pt-btn--secondary" onClick={onClick} disabled={loading} title={title}>
      <RefreshCw size={16} className={loading ? "pt-spin" : undefined} /> Làm mới
    </button>
  );
}
