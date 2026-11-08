import { CalendarDays, PlusCircle, ClipboardList, Bell, UserRound } from "lucide-react";

export const PATIENT_MENU = [
  { id: "appointments", label: "Lịch khám của tôi", icon: CalendarDays },
  { id: "book", label: "Đặt lịch khám", icon: PlusCircle },
  { id: "records", label: "Lịch sử khám bệnh", icon: ClipboardList },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "profile", label: "Thông tin cá nhân", icon: UserRound },
];

export const SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
];

export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xác nhận" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "Completed", label: "Đã hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "Rejected", label: "Bị từ chối" },
];

// Các trường hồ sơ cho phép chỉnh sửa. Muốn thêm trường (quê quán, quận/huyện...) chỉ cần thêm 1 dòng
// ở đây, với điều kiện backend đã có cột tương ứng.
export const PROFILE_FIELDS = [
  { name: "full_name", label: "Họ và tên", type: "text", required: true },
  { name: "date_of_birth", label: "Ngày sinh", type: "date" },
  {
    name: "gender",
    label: "Giới tính",
    type: "select",
    options: [
      { value: "", label: "Chưa chọn" },
      { value: "Male", label: "Nam" },
      { value: "Female", label: "Nữ" },
      { value: "Other", label: "Khác" },
    ],
  },
  { name: "phone", label: "Số điện thoại", type: "tel" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Địa chỉ", type: "text", full: true },
];

// ⚠️ Cần khớp với backend: endpoint cập nhật hồ sơ là `${API_PATIENTS}/{id}` với method này.
export const PROFILE_UPDATE_METHOD = "PATCH";
