import { useMemo, useState } from "react";
import { CalendarDays, PlusCircle } from "lucide-react";
import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import StateMessage from "../../../components/patient/StateMessage";
import AppointmentStats from "../../../components/patient/AppointmentStats";
import AppointmentTable from "../../../components/patient/AppointmentTable";
import { STATUS_FILTER_OPTIONS } from "../../../utils/patientConstants";

export default function AppointmentsView({ patient, appointments, doctorMap, cancelingId, onCancel, onNavigate }) {
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(
    () => appointments.items.filter((a) => !statusFilter || a.status === statusFilter),
    [appointments.items, statusFilter]
  );

  return (
    <>
      <PageTitle
        eyebrow="KHÔNG GIAN BỆNH NHÂN"
        title="Lịch khám của tôi"
        subtitle={
          <>
            Xin chào <b>{patient?.full_name || "bạn"}</b>, đây là các lịch hẹn của bạn.
          </>
        }
      >
        <div className="pt-chip-date">
          <CalendarDays size={18} />
          <span>{new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </PageTitle>

      <AppointmentStats appointments={appointments.items} loading={appointments.loading && !appointments.items.length} />

      <Panel
        title="Danh sách lịch hẹn"
        description="Theo dõi trạng thái và hủy lịch khi cần"
        action={
          <div className="pt-tools">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Lọc theo trạng thái">
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="pt-count">{filtered.length} lịch hẹn</span>
            <button type="button" className="pt-btn" onClick={() => onNavigate("book")}>
              <PlusCircle size={16} /> Đặt lịch mới
            </button>
          </div>
        }
      >
        {appointments.error && appointments.items.length > 0 && (
          <StateMessage variant="error" message={appointments.error} />
        )}
        <AppointmentTable
          items={filtered}
          total={appointments.items.length}
          loading={appointments.loading}
          error={appointments.error}
          doctorMap={doctorMap}
          cancelingId={cancelingId}
          onCancel={onCancel}
          onRetry={appointments.load}
        />
      </Panel>
    </>
  );
}
