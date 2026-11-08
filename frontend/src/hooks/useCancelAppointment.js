import { useState } from "react";
import { API_APPOINTMENTS } from "../utils/constants";

export default function useCancelAppointment({ request, reload, notify }) {
  const [cancelingId, setCancelingId] = useState(null);

  async function cancelAppointment(appointmentId) {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;

    setCancelingId(appointmentId);
    try {
      await request(`${API_APPOINTMENTS}/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Cancelled" }),
      });
      notify("Đã hủy lịch hẹn");
      await reload();
    } catch (e) {
      notify(e.message || "Không thể hủy lịch hẹn.", "error");
    } finally {
      setCancelingId(null);
    }
  }

  return { cancelingId, cancelAppointment };
}
