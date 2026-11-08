import { useCallback, useEffect, useMemo, useState } from "react";
import { appointmentDoctorLabel, formatDate, formatTime, getLocalDate } from "../utils/patientHelpers";

/**
 * Backend chưa có API thông báo, nên thông báo được suy ra từ lịch hẹn + hồ sơ bệnh án.
 * Trạng thái "đã đọc" lưu trong localStorage theo từng bệnh nhân.
 * Khi có API thật, chỉ cần thay phần `items` bên dưới.
 */
const STORAGE_PREFIX = "pt_read_notifications";

function loadRead(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveRead(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* bỏ qua nếu trình duyệt chặn storage */
  }
}

export default function useNotifications({ patientId, appointments, records, doctorMap }) {
  const storageKey = `${STORAGE_PREFIX}:${patientId ?? "anon"}`;
  const [readIds, setReadIds] = useState(() => new Set());

  useEffect(() => {
    setReadIds(loadRead(storageKey));
  }, [storageKey]);

  const items = useMemo(() => {
    const list = [];
    const today = getLocalDate();
    const tomorrow = getLocalDate(1);

    appointments.forEach((a) => {
      const when = a.updated_at || a.created_at || a.appointment_date;
      const detail = `${appointmentDoctorLabel(a, doctorMap)} · ${formatDate(a.appointment_date)} lúc ${formatTime(a.appointment_time)}.`;
      const date = String(a.appointment_date).slice(0, 10);
      const note = a.notes ? ` Lý do: ${a.notes}` : "";

      if (a.status === "Confirmed") {
        list.push({ id: `appt-${a.id}-Confirmed`, icon: "check", tone: "ok", title: `Lịch khám #${a.id} đã được xác nhận`, message: detail, when });
        if (date === today || date === tomorrow) {
          list.push({ id: `remind-${a.id}-${date}`, icon: "clock", tone: "wait", title: "Nhắc lịch khám sắp tới", message: `${detail} Vui lòng đến sớm 15 phút.`, when: date });
        }
      }
      if (a.status === "Rejected") {
        list.push({ id: `appt-${a.id}-Rejected`, icon: "x", tone: "bad", title: `Lịch khám #${a.id} bị từ chối`, message: detail + note, when });
      }
      if (a.status === "Cancelled") {
        list.push({ id: `appt-${a.id}-Cancelled`, icon: "x", tone: "bad", title: `Lịch khám #${a.id} đã bị hủy`, message: detail + note, when });
      }
    });

    records.forEach((r) => {
      list.push({
        id: `record-${r.id}`,
        icon: "file",
        tone: "off",
        title: "Hồ sơ bệnh án mới",
        message: `Bác sĩ đã cập nhật hồ sơ cho lịch khám #${r.appointment_id}.`,
        when: r.created_at,
      });
    });

    return list
      .sort((a, b) => String(b.when || "").localeCompare(String(a.when || "")))
      .map((n) => ({ ...n, unread: !readIds.has(n.id) }));
  }, [appointments, records, doctorMap, readIds]);

  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = useCallback(() => {
    const next = new Set([...readIds, ...items.map((n) => n.id)]);
    setReadIds(next);
    saveRead(storageKey, next);
  }, [readIds, items, storageKey]);

  return { items, unreadCount, markAllRead };
}
