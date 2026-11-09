export const toList = (data) => (Array.isArray(data) ? data : data?.items || []);

export function genderLabel(value) {
  return { Male: "Nam", Female: "Nữ", Other: "Khác" }[value] || value;
}

export function statusLabel(value) {
  return (
    { Waiting: "Đang chờ", "Under Treatment": "Đang điều trị", Discharged: "Đã xuất viện" }[value] || value
  );
}

export function appointmentStatusLabel(value) {
  return (
    {
      Pending: "Chờ xác nhận",
      Confirmed: "Đã xác nhận",
      Completed: "Đã hoàn thành",
      Cancelled: "Đã hủy",
      Rejected: "Bị từ chối",
    }[value] || value
  );
}

// Màu huy hiệu trạng thái: wait | ok | off | bad
export function appointmentTone(value) {
  return { Pending: "wait", Confirmed: "ok", Completed: "off", Cancelled: "bad", Rejected: "bad" }[value] || "off";
}

/** Ngày local dạng YYYY-MM-DD; offsetDays = số ngày lệch so với hôm nay (mặc định 0). */
export function getLocalDate(offsetDays = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const parts = String(value).slice(0, 10).split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const formatTime = (value) => String(value || "").slice(0, 5);

export function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("vi-VN");
}

/** Khung giờ đã trôi qua (chỉ áp dụng khi chọn ngày hôm nay). */
export function isPastSlot(date, time) {
  if (date !== getLocalDate()) return false;
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
}

// Bác sĩ: đọc field theo kiểu "dễ tính" vì chưa biết chính xác schema của /api/doctors
export const doctorName = (d) => d?.full_name || d?.name || "";
export const doctorSpecialty = (d) => d?.specialty || d?.specialization || d?.department || "Đa khoa";

export function appointmentDoctorLabel(appointment, doctorMap) {
  if (appointment.doctor_name) return appointment.doctor_name;
  const doctor = doctorMap?.get(String(appointment.doctor_id));
  if (doctor) return doctorName(doctor);
  return appointment.doctor_id ? `Bác sĩ #${appointment.doctor_id}` : "Chưa phân công";
}
