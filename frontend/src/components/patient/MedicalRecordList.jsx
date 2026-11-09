import { ClipboardList } from "lucide-react";
import StateMessage from "./StateMessage";
import DocumentList from "./DocumentList";
import { formatDate } from "../../utils/patientHelpers";

function Field({ label, value, fallback = "Chưa cập nhật" }) {
  return (
    <>
      <strong>{label}</strong>
      <p>{value || fallback}</p>
    </>
  );
}

export default function MedicalRecordList({ records, loading, error, documents }) {
  if (loading && records.length === 0) return <StateMessage message="Đang tải lịch sử khám bệnh..." />;
  if (error && records.length === 0) return <StateMessage variant="error" message={error} />;

  if (records.length === 0) {
    return (
      <div className="pt-empty">
        <ClipboardList size={28} />
        <p>Bạn chưa có hồ sơ khám bệnh nào.</p>
      </div>
    );
  }

  return (
    <div className="pt-record-list">
      {records.map((r) => (
        <article key={r.id} className="pt-record">
          <div className="pt-record-head">
            <h3>Lần khám #{r.id}</h3>
            <span className="pt-secondary">{formatDate(r.created_at)}</span>
          </div>
          <Field label="Lý do khám" value={r.chief_complaint} />
          <Field label="Chẩn đoán" value={r.diagnosis} />
          <Field label="Hướng điều trị" value={r.treatment_plan} />
          {r.doctor_notes && <Field label="Ghi chú bác sĩ" value={r.doctor_notes} />}
          <div className="pt-record-docs">
            <h4>Tài liệu đính kèm</h4>
            <DocumentList
              documents={documents?.byRecord?.[r.id]}
              onDownload={documents?.download}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
