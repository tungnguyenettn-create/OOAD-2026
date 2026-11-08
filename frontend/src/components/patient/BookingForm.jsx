import { AlertTriangle } from "lucide-react";
import Panel from "./Panel";
import SlotPicker from "./SlotPicker";
import { doctorName, getLocalDate } from "../../utils/patientHelpers";

export default function BookingForm({ booking, specializationsState, onCancel }) {
  const { form, specializations, doctors, availability, bookedTimes, submitting } = booking;

  return (
    <Panel className="pt-form-card">
      <div className="pt-grid2">
        {specializations.length > 0 ? (
          <>
            <div className="pt-field">
              <label htmlFor="bk-spec">Chuyên khoa</label>
              <select
                id="bk-spec"
                value={form.specialization}
                onChange={(e) => booking.changeSpecialization(e.target.value)}
              >
                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-field">
              <label htmlFor="bk-doc">Bác sĩ</label>
              <select
                id="bk-doc"
                value={form.doctor_id}
                disabled={doctors.loading}
                onChange={(e) => booking.changeDoctor(e.target.value)}
              >
                <option value="">Hệ thống tự chọn bác sĩ phù hợp</option>
                {doctors.items.map((d) => (
                  <option key={d.id} value={d.id}>
                    {doctorName(d) || `Bác sĩ #${d.id}`}
                  </option>
                ))}
              </select>
              {doctors.error && <span className="pt-hint">{doctors.error}</span>}
            </div>
          </>
        ) : (
          <p className="pt-hint pt-full">
            {specializationsState.loading
              ? "Đang tải danh sách chuyên khoa..."
              : specializationsState.error || "Chưa có chuyên khoa nào để đặt lịch."}
          </p>
        )}

        <div className="pt-field pt-full">
          <label htmlFor="bk-date">Ngày khám</label>
          <input
            id="bk-date"
            type="date"
            min={getLocalDate()}
            value={form.appointment_date}
            onChange={(e) => booking.changeDate(e.target.value)}
          />
        </div>

        <div className="pt-field pt-full">
          <label>Khung giờ</label>
          <SlotPicker
            date={form.appointment_date}
            value={form.appointment_time}
            bookedTimes={bookedTimes}
            onChange={(t) => booking.setField("appointment_time", t)}
          />

          {availability.loading && <span className="pt-hint">Đang kiểm tra lịch của bác sĩ...</span>}
          {availability.data?.has_delay_risk && (
            <div className="pt-warning" role="status">
              <AlertTriangle size={16} />
              <span>{availability.data.warning_message}</span>
            </div>
          )}
        </div>

        <div className="pt-field pt-full">
          <label htmlFor="bk-reason">Lý do khám / triệu chứng</label>
          <textarea
            id="bk-reason"
            rows={3}
            maxLength={2000}
            placeholder="Mô tả ngắn triệu chứng của bạn..."
            value={form.reason}
            onChange={(e) => booking.setField("reason", e.target.value)}
          />
        </div>
      </div>

      <div className="pt-form-actions">
        <button type="button" className="pt-btn pt-btn--secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button type="button" className="pt-btn" onClick={booking.submit} disabled={submitting}>
          {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
        </button>
      </div>
    </Panel>
  );
}
