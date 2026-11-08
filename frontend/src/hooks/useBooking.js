import { useEffect, useMemo, useState } from "react";
import { API_APPOINTMENTS, API_AVAILABILITY, API_DOCTORS_BY_SPEC } from "../utils/constants";
import { formatTime, getLocalDate } from "../utils/patientHelpers";

const toId = (v) => (Number.isNaN(Number(v)) ? v : Number(v));
const withSeconds = (t) => (t.length === 5 ? `${t}:00` : t);

/**
 * Luồng đặt lịch:
 *  1. Chọn chuyên khoa  -> GET /api/doctors/by-specialization
 *  2. (Tuỳ chọn) chọn bác sĩ; để trống = hệ thống tự phân công theo chuyên khoa
 *  3. Chọn ngày + giờ    -> GET /api/appointments/availability (chỉ cảnh báo, không chặn)
 *  4. Xác nhận           -> POST /api/appointments (tự động "Confirmed")
 */
export default function useBooking({ request, specializations, appointments, reload, notify, onBooked }) {
  const [form, setForm] = useState({
    specialization: "",
    doctor_id: "",
    appointment_date: getLocalDate(1),
    appointment_time: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState({ items: [], loading: false, error: "" });
  const [availability, setAvailability] = useState({ data: null, loading: false });

  const { specialization, doctor_id, appointment_date, appointment_time } = form;

  // Chọn sẵn chuyên khoa đầu tiên khi danh sách tải xong
  useEffect(() => {
    if (!specializations.length) return;
    setForm((f) => (specializations.includes(f.specialization) ? f : { ...f, specialization: specializations[0] }));
  }, [specializations]);

  // Tải bác sĩ theo chuyên khoa
  useEffect(() => {
    if (!specialization) {
      setDoctors({ items: [], loading: false, error: "" });
      return;
    }
    let active = true;
    setDoctors((d) => ({ ...d, loading: true, error: "" }));
    request(`${API_DOCTORS_BY_SPEC}?${new URLSearchParams({ specialization })}`)
      .then((data) => {
        if (!active) return;
        setDoctors({ items: Array.isArray(data) ? data : data?.items || [], loading: false, error: "" });
      })
      .catch((e) => {
        if (active) setDoctors({ items: [], loading: false, error: e.message || "Không thể tải danh sách bác sĩ." });
      });
    return () => {
      active = false;
    };
  }, [request, specialization]);

  // Kiểm tra mức độ đông của khung giờ đang chọn
  useEffect(() => {
    if (!appointment_date || !appointment_time || (!doctor_id && !specialization)) {
      setAvailability({ data: null, loading: false });
      return;
    }
    let active = true;
    setAvailability({ data: null, loading: true });

    const params = new URLSearchParams({
      appointment_date,
      appointment_time: withSeconds(appointment_time),
    });
    if (doctor_id) params.set("doctor_id", doctor_id);
    else params.set("specialization", specialization);

    request(`${API_AVAILABILITY}?${params}`)
      .then((data) => active && setAvailability({ data, loading: false }))
      .catch(() => active && setAvailability({ data: null, loading: false })); // chỉ là cảnh báo, lỗi thì bỏ qua
    return () => {
      active = false;
    };
  }, [request, specialization, doctor_id, appointment_date, appointment_time]);

  const selectedDoctor = doctors.items.find((d) => String(d.id) === String(doctor_id)) || null;

  // Giờ mà chính bệnh nhân đã đặt (còn hiệu lực) trong ngày đang chọn
  const bookedTimes = useMemo(
    () =>
      new Set(
        appointments
          .filter(
            (a) =>
              ["Pending", "Confirmed"].includes(a.status) &&
              String(a.appointment_date).slice(0, 10) === appointment_date &&
              (!doctor_id || String(a.doctor_id) === String(doctor_id))
          )
          .map((a) => formatTime(a.appointment_time))
      ),
    [appointments, appointment_date, doctor_id]
  );

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const changeSpecialization = (value) =>
    setForm((f) => ({ ...f, specialization: value, doctor_id: "", appointment_time: "" }));
  const changeDoctor = (value) => setForm((f) => ({ ...f, doctor_id: value, appointment_time: "" }));
  const changeDate = (value) => setForm((f) => ({ ...f, appointment_date: value, appointment_time: "" }));

  async function submit() {
    if (!doctor_id && !specialization) return notify("Vui lòng chọn chuyên khoa", "error");
    if (!appointment_date) return notify("Vui lòng chọn ngày khám", "error");
    if (!appointment_time) return notify("Vui lòng chọn khung giờ", "error");

    setSubmitting(true);
    try {
      const data = await request(API_APPOINTMENTS, {
        method: "POST",
        body: JSON.stringify({
          ...(doctor_id ? { doctor_id: toId(doctor_id) } : { specialization }),
          appointment_date,
          appointment_time,
          reason: form.reason.trim() || null,
        }),
      });

      notify(
        data?.queue_number
          ? `Đặt lịch thành công! Số thứ tự của bạn: ${data.queue_number}.`
          : "Đặt lịch thành công! Lịch hẹn đã được xác nhận."
      );
      setForm((f) => ({ ...f, appointment_time: "", reason: "" }));
      await reload();
      onBooked?.();
    } catch (e) {
      notify(e.message || "Không thể tạo lịch hẹn.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    specializations,
    doctors,
    selectedDoctor,
    availability,
    bookedTimes,
    submitting,
    setField,
    changeSpecialization,
    changeDoctor,
    changeDate,
    submit,
  };
}
