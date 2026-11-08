import { useState } from "react";
import { API_APPOINTMENTS } from "../utils/constants";

const EMPTY_FORM = { doctor_id: "", appointment_date: "", appointment_time: "", reason: "" };

export default function useAppointmentActions({ request, reloadAppointments, setError, setMessage }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function createAppointment(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSubmitting(true);
      await request(API_APPOINTMENTS, {
        method: "POST",
        body: JSON.stringify({
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          reason: form.reason.trim() || null,
        }),
      });

      setMessage("Đặt lịch khám thành công! Lịch hẹn đang chờ xác nhận.");
      setForm(EMPTY_FORM);
      await reloadAppointments();
    } catch (e) {
      setError(e.message || "Không thể tạo lịch hẹn.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelAppointment(appointmentId) {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) return;

    setError("");
    setMessage("");

    try {
      await request(`${API_APPOINTMENTS}/${appointmentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Cancelled" }),
      });
      setMessage("Đã gửi yêu cầu hủy lịch hẹn.");
      await reloadAppointments();
    } catch (e) {
      setError(e.message || "Không thể hủy lịch hẹn.");
    }
  }

  return { form, setForm, submitting, createAppointment, cancelAppointment };
}