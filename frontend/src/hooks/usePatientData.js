import { useCallback, useEffect, useMemo, useState } from "react";
import useResource from "./useResource";
import {
  API_PATIENTS,
  API_APPOINTMENTS,
  API_MEDICAL_RECORDS,
  API_DOCTORS,
  API_SPECIALIZATIONS,
} from "../utils/constants";

export default function usePatientData({ token, request }) {
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState("");

  const appointments = useResource(request, API_APPOINTMENTS, {
    errorMessage: "Không thể tải lịch hẹn.",
    invalidMessage: "Dữ liệu lịch hẹn không hợp lệ.",
  });
  const records = useResource(request, API_MEDICAL_RECORDS, {
    errorMessage: "Không thể tải lịch sử khám bệnh.",
    invalidMessage: "Dữ liệu hồ sơ không hợp lệ.",
  });
  const specializations = useResource(request, API_SPECIALIZATIONS, {
    errorMessage: "Không thể tải danh sách chuyên khoa.",
    invalidMessage: "Dữ liệu chuyên khoa không hợp lệ.",
  });
  // Danh sách bác sĩ chỉ dùng để hiển thị tên/chuyên khoa trong bảng lịch hẹn; chỉ phục vụ form đặt lịch — lỗi ở đây không làm hỏng cả trang
  const doctors = useResource(request, API_DOCTORS, {
    errorMessage: "Không thể tải danh sách bác sĩ.",
    invalidMessage: "Dữ liệu bác sĩ không hợp lệ.",
  });

  const loadPatient = useCallback(async () => {
    setPatientLoading(true);
    setPatientError("");
    try {
      const data = await request(API_PATIENTS);
      const list = Array.isArray(data) ? data : data.items || [data];
      if (!list.length || !list[0]) {
        throw new Error("Tài khoản chưa được liên kết với hồ sơ bệnh nhân.");
      }
      setPatient(list[0]);
    } catch (e) {
      setPatientError(e.message || "Không thể tải hồ sơ bệnh nhân.");
    } finally {
      setPatientLoading(false);
    }
  }, [request]);

  const loadAppointments = appointments.load;
  const loadRecords = records.load;
  const loadDoctors = doctors.load;
  const loadSpecializations = specializations.load;

  useEffect(() => {
    if (!token) return;
    loadPatient();
    loadAppointments();
    loadRecords();
    loadDoctors();
    loadSpecializations();
  }, [token, loadPatient, loadAppointments, loadRecords, loadDoctors, loadSpecializations]);

  const doctorMap = useMemo(() => new Map(doctors.items.map((d) => [String(d.id), d])), [doctors.items]);

  return {
    patient,
    setPatient,
    patientLoading,
    patientError,
    reloadPatient: loadPatient,
    appointments,
    records,
    doctors,
    specializations,
    doctorMap,
  };
}
