import { Pill } from "lucide-react";
import StateMessage from "./StateMessage";
import { formatDate } from "../../utils/patientHelpers";

export default function PrescriptionList({ prescriptions, loading, error }) {
  if (loading && prescriptions.length === 0) {
    return <StateMessage message="Đang tải đơn thuốc..." />;
  }

  if (error && prescriptions.length === 0) {
    return <StateMessage variant="error" message={error} />;
  }

  if (prescriptions.length === 0) {
    return (
      <div className="pt-empty">
        <Pill size={28} />
        <p>Bạn chưa có đơn thuốc nào.</p>
      </div>
    );
  }

  return (
    <div className="pt-record-list">
      {prescriptions.map((item) => (
        <article key={item.id} className="pt-record">
          <div className="pt-record-head">
            <h3>{item.medication_name}</h3>
            <span className="pt-secondary">{formatDate(item.created_at)}</span>
          </div>
          {item.dosage && (
            <>
              <strong>Liều dùng</strong>
              <p>{item.dosage}</p>
            </>
          )}
          {item.frequency && (
            <>
              <strong>Tần suất</strong>
              <p>{item.frequency}</p>
            </>
          )}
          {item.duration && (
            <>
              <strong>Thời gian</strong>
              <p>{item.duration}</p>
            </>
          )}
          {item.instructions && (
            <>
              <strong>Hướng dẫn</strong>
              <p>{item.instructions}</p>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
