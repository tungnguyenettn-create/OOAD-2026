import { CalendarDays, PlusCircle } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { getLocalDate } from "../../utils/patientHelpers";

export default function AppointmentForm({ form, setForm, submitting, onSubmit }) {
  const today = getLocalDate();

  return (
    <SectionCard icon={CalendarDays} title="Đặt lịch khám">
      <form onSubmit={onSubmit}>
        <div className="pd-form-grid">
          <label className="pd-label">
            Ngày khám
            <input
              className="pd-input"
              type="date"
              min={today}
              value={form.appointment_date}
              onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              required
            />
          </label>

          <label className="pd-label">
            Giờ khám
            <input
              className="pd-input"
              type="time"
              value={form.appointment_time}
              onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
              required
            />
          </label>

          <label className="pd-label">
            Lý do khám
            <textarea
              className="pd-input pd-textarea"
              maxLength={2000}
              placeholder="Mô tả ngắn gọn lý do khám..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>
        </div>

        <button type="submit" disabled={submitting} className="pd-primary-btn">
          <PlusCircle size={18} />
          {submitting ? "Đang đặt lịch..." : "Đặt lịch khám"}
        </button>
      </form>
    </SectionCard>
  );
}