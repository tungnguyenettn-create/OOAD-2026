import { Activity } from "lucide-react";
import StateMessage from "./StateMessage";
import { METRIC_TYPES } from "../../utils/patientConstants";
import { formatDateTime } from "../../utils/patientHelpers";

const metricLabel = (value) =>
  METRIC_TYPES.find((item) => item.value === value)?.label || value;

const SOURCE_LABELS = {
  patient: "Bệnh nhân tự nhập",
  doctor: "Bác sĩ ghi nhận",
  admin: "Quản trị viên",
};

export default function HealthMetricList({ metrics, loading, error }) {
  if (loading && metrics.length === 0) {
    return <StateMessage message="Đang tải chỉ số sức khoẻ..." />;
  }

  if (error && metrics.length === 0) {
    return <StateMessage variant="error" message={error} />;
  }

  if (metrics.length === 0) {
    return (
      <div className="pt-empty">
        <Activity size={28} />
        <p>Bạn chưa có chỉ số sức khoẻ nào.</p>
      </div>
    );
  }

  return (
    <div className="pt-table-wrap">
      <table className="pt-table">
        <thead>
          <tr>
            <th>Chỉ số</th>
            <th>Giá trị</th>
            <th>Thời điểm</th>
            <th>Nguồn</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((item) => (
            <tr key={item.id}>
              <td>{metricLabel(item.metric_type)}</td>
              <td>
                <b>{item.value}</b>
                {item.metric_type === "BloodPressure" && item.secondary_value != null
                  ? ` / ${item.secondary_value}`
                  : ""}{" "}
                {item.unit}
              </td>
              <td>{formatDateTime(item.measured_at)}</td>
              <td>{SOURCE_LABELS[item.source] || item.source || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
