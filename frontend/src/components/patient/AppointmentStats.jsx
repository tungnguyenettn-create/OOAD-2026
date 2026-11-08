import { CalendarDays, Check, Clock, FileText } from "lucide-react";
import StatCard from "./StatCard";

export default function AppointmentStats({ appointments, loading }) {
  const count = (status) => appointments.filter((a) => a.status === status).length;
  const v = (n) => (loading ? "…" : n);

  return (
    <div className="pt-stats">
      <StatCard icon={CalendarDays} color="teal" title="Tổng lịch hẹn" value={v(appointments.length)} note="Tất cả lịch của bạn" />
      <StatCard icon={Clock} color="orange" title="Chờ xác nhận" value={v(count("Pending"))} note="Đang chờ bác sĩ" />
      <StatCard icon={Check} color="blue" title="Đã xác nhận" value={v(count("Confirmed"))} note="Sắp tới" />
      <StatCard icon={FileText} color="purple" title="Đã hoàn thành" value={v(count("Completed"))} note="Đã khám xong" />
    </div>
  );
}
