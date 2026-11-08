import { UserRound, XCircle } from "lucide-react";
import StateMessage from "./StateMessage";
import StatusBadge from "./StatusBadge";
import {
  appointmentDoctorLabel,
  doctorSpecialty,
  formatDate,
  formatTime,
} from "../../utils/patientHelpers";

const CANCELABLE = ["Pending", "Confirmed"];

export default function AppointmentTable({ items, total, loading, error, doctorMap, cancelingId, onCancel, onRetry }) {
  if (loading && total === 0) return <StateMessage message="Đang tải lịch hẹn..." />;

  if (error && total === 0) {
    return (
      <StateMessage
        variant="error"
        message={error}
        action={
          <button type="button" className="pt-btn pt-btn--secondary pt-btn--sm" onClick={onRetry}>
            Thử lại
          </button>
        }
      />
    );
  }

  if (!items.length) {
    return (
      <div className="pt-empty">
        {total ? "Không có lịch hẹn phù hợp với bộ lọc." : "Bạn chưa có lịch hẹn nào."}
      </div>
    );
  }

  return (
    <div className="pt-table-wrap">
      <table className="pt-table">
        <thead>
          <tr>
            <th>BÁC SĨ / CHUYÊN KHOA</th>
            <th>NGÀY / GIỜ</th>
            <th>LÝ DO KHÁM</th>
            <th>TRẠNG THÁI</th>
            <th>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const doctor = doctorMap.get(String(a.doctor_id));
            return (
              <tr key={a.id}>
                <td>
                  <div className="pt-cell">
                    <div className="pt-cell-icon">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <strong>{appointmentDoctorLabel(a, doctorMap)}</strong>
                      <span>
                        {doctor ? `${doctorSpecialty(doctor)} · ` : ""}#{a.id}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  {formatDate(a.appointment_date)}
                  <span className="pt-secondary">{formatTime(a.appointment_time)}</span>
                </td>
                <td>
                  {a.reason || "—"}
                  {a.notes && ["Cancelled", "Rejected"].includes(a.status) && (
                    <span className="pt-secondary">Ghi chú: {a.notes}</span>
                  )}
                </td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>
                  {CANCELABLE.includes(a.status) ? (
                    <button
                      type="button"
                      className="pt-btn pt-btn--danger pt-btn--sm"
                      disabled={cancelingId === a.id}
                      onClick={() => onCancel(a.id)}
                    >
                      <XCircle size={15} /> Hủy lịch
                    </button>
                  ) : (
                    <span className="pt-secondary">Không có thao tác</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
