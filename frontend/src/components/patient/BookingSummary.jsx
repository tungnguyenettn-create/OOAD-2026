import { Bell } from "lucide-react";
import Panel from "./Panel";
import { doctorName, formatDate } from "../../utils/patientHelpers";

export default function BookingSummary({ patientName, form, selectedDoctor }) {
  const time =
    form.appointment_date && form.appointment_time
      ? `${form.appointment_time} · ${formatDate(form.appointment_date)}`
      : "Chưa chọn";

  const doctor = selectedDoctor
    ? doctorName(selectedDoctor) || `Bác sĩ #${selectedDoctor.id}`
    : form.specialization
      ? "Hệ thống tự phân công"
      : "—";

  return (
    <>
      <Panel className="pt-summary">
        <h3>Tóm tắt lịch hẹn</h3>
        <dl>
          <dt>BỆNH NHÂN</dt>
          <dd>{patientName || "—"}</dd>
          <dt>CHUYÊN KHOA</dt>
          <dd>{form.specialization || "—"}</dd>
          <dt>BÁC SĨ</dt>
          <dd>{doctor}</dd>
          <dt>THỜI GIAN</dt>
          <dd>{time}</dd>
        </dl>
      </Panel>

      <div className="pt-notice">
        <Bell size={16} />
        <span>
          Lịch hẹn được xác nhận ngay khi đặt. Nếu bác sĩ có việc đột xuất, bạn sẽ nhận thông báo và có thể được
          chuyển sang bác sĩ cùng chuyên khoa.
        </span>
      </div>
    </>
  );
}
