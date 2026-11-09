import Panel from "./Panel";
import { METRIC_TYPES } from "../../utils/patientConstants";

export default function HealthMetricForm({ metrics }) {
  const { form, setField, changeType, add, saving, reset } = metrics;
  const isBloodPressure = form.metric_type === "BloodPressure";

  return (
    <Panel
      className="pt-form-card"
      title="Thêm chỉ số mới"
      description="Ghi lại cân nặng, huyết áp, nhịp tim... để theo dõi sức khoẻ tại nhà."
    >
      <form onSubmit={add}>
        <div className="pt-grid2">
          <div className="pt-field">
            <label htmlFor="hm-type">Loại chỉ số</label>
            <select
              id="hm-type"
              value={form.metric_type}
              onChange={(event) => changeType(event.target.value)}
            >
              {METRIC_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-field">
            <label htmlFor="hm-unit">Đơn vị</label>
            <input
              id="hm-unit"
              value={form.unit}
              onChange={(event) => setField("unit", event.target.value)}
              required
            />
          </div>

          <div className="pt-field">
            <label htmlFor="hm-value">{isBloodPressure ? "Tâm thu" : "Giá trị"}</label>
            <input
              id="hm-value"
              type="number"
              min="0.1"
              step="0.1"
              value={form.value}
              onChange={(event) => setField("value", event.target.value)}
              required
            />
          </div>

          {isBloodPressure && (
            <div className="pt-field">
              <label htmlFor="hm-secondary">Tâm trương</label>
              <input
                id="hm-secondary"
                type="number"
                min="0.1"
                step="0.1"
                value={form.secondary_value}
                onChange={(event) => setField("secondary_value", event.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-field">
            <label htmlFor="hm-measured-at">Thời điểm đo (không bắt buộc)</label>
            <input
              id="hm-measured-at"
              type="datetime-local"
              value={form.measured_at}
              onChange={(event) => setField("measured_at", event.target.value)}
            />
          </div>
        </div>

        <div className="pt-form-actions">
          <button type="button" className="pt-btn pt-btn--secondary" onClick={reset} disabled={saving}>
            Nhập lại
          </button>
          <button type="submit" className="pt-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Thêm chỉ số"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
