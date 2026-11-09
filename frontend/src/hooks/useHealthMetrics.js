import { useState } from "react";
import useResource from "./useResource";
import { API_HEALTH_METRICS } from "../utils/constants";
import { METRIC_TYPES } from "../utils/patientConstants";

const EMPTY_FORM = {
  metric_type: "Weight",
  value: "",
  unit: "kg",
  secondary_value: "",
  measured_at: "",
};

const defaultUnit = (type) => METRIC_TYPES.find((m) => m.value === type)?.unit || "";

/**
 * Tải danh sách chỉ số sức khoẻ và xử lý form thêm chỉ số mới.
 * Bệnh nhân chỉ thêm được chỉ số cho chính mình (backend tự gán patient_id).
 */
export default function useHealthMetrics({ request, notify }) {
  const resource = useResource(request, API_HEALTH_METRICS, {
    errorMessage: "Không thể tải chỉ số sức khoẻ.",
    invalidMessage: "Dữ liệu chỉ số sức khoẻ không hợp lệ.",
  });

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  function changeType(metricType) {
    setForm((f) => ({
      ...f,
      metric_type: metricType,
      unit: defaultUnit(metricType),
      secondary_value: "",
    }));
  }

  function reset() {
    setForm({ ...EMPTY_FORM, unit: defaultUnit(EMPTY_FORM.metric_type) });
  }

  async function add(event) {
    event?.preventDefault();

    const value = Number(form.value);
    const isBloodPressure = form.metric_type === "BloodPressure";
    const secondaryValue = Number(form.secondary_value);

    if (!Number.isFinite(value) || value <= 0) {
      return notify("Vui lòng nhập giá trị chỉ số hợp lệ.", "error");
    }

    if (isBloodPressure && (!Number.isFinite(secondaryValue) || secondaryValue <= 0)) {
      return notify("Huyết áp cần nhập cả tâm thu và tâm trương.", "error");
    }

    if (!String(form.unit).trim()) {
      return notify("Vui lòng nhập đơn vị đo.", "error");
    }

    const payload = {
      metric_type: form.metric_type,
      value,
      unit: String(form.unit).trim(),
      secondary_value: isBloodPressure ? secondaryValue : null,
    };

    if (form.measured_at) payload.measured_at = form.measured_at;

    setSaving(true);
    try {
      await request(API_HEALTH_METRICS, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      notify("Đã thêm chỉ số sức khoẻ");
      reset();
      await resource.load();
    } catch (error) {
      notify(error.message || "Không thể thêm chỉ số sức khoẻ.", "error");
    } finally {
      setSaving(false);
    }
  }

  return { ...resource, form, setField, changeType, add, saving, reset };
}
