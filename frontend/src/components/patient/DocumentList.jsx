import { Download, FileText } from "lucide-react";
import { DOCUMENT_TYPE_LABELS } from "../../utils/patientConstants";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentList({ documents, onDownload }) {
  if (!documents || documents.length === 0) {
    return <p className="pt-secondary">Chưa có tài liệu đính kèm.</p>;
  }

  return (
    <div className="pt-doc-list">
      {documents.map((document) => (
        <div key={document.id} className="pt-doc">
          <FileText size={18} />
          <div>
            <strong>{document.file_name}</strong>
            <p className="pt-secondary">
              {DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
              {document.file_size ? ` · ${formatSize(document.file_size)}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="pt-btn pt-btn--secondary pt-btn--sm"
            onClick={() => onDownload(document)}
          >
            <Download size={14} /> Tải PDF
          </button>
        </div>
      ))}
    </div>
  );
}
