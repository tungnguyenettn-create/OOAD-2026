import { useEffect, useMemo, useState, useContext } from "react";
import {
  HeartPulse, LayoutDashboard, Users, CalendarDays, ClipboardList, Pill,
  LogOut, Search, Bell, Clock3, UserRound, RefreshCw, AlertCircle,
  CheckCircle2, Stethoscope, ArrowUpRight, Check, X, Plus, FileText,
} from "lucide-react";
import { AuthContext } from "../../auth/AuthContext";
import "../../styles/DoctorDashboard.css"; 

const MENU_ITEMS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "patients", label: "Bệnh nhân của tôi", icon: Users },
  { id: "appointments", label: "Lịch khám", icon: CalendarDays },
  { id: "records", label: "Hồ sơ bệnh án", icon: ClipboardList },
  { id: "prescriptions", label: "Đơn thuốc", icon: Pill },
];

const EMPTY_RECORD_FORM = {
  chief_complaint: "",
  diagnosis: "",
  treatment_plan: "",
  doctor_notes: "",
};

export default function DoctorDashboard() {
  const { token, logout } = useContext(AuthContext);

  const [activePage, setActivePage] = useState("overview");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("All");
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);

  // Modal từ chối / hủy lịch hẹn
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [rejectForm, setRejectForm] = useState({ notes: "", reassign_to_other_doctor: true });

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [recordMessage, setRecordMessage] = useState("");
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [recordForm, setRecordForm] = useState(EMPTY_RECORD_FORM);
  const [savingRecord, setSavingRecord] = useState(false);

  async function readResponse(response, fallbackMessage) {
    if (response.status === 401) {
      logout();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof data.detail === "string" ? data.detail : fallbackMessage;
      throw new Error(message || fallbackMessage);
    }
    return data;
  }

  async function loadPatients() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response, "Không thể tải danh sách bệnh nhân.");
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bệnh nhân.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAppointments() {
    if (!token) return;
    setAppointmentsLoading(true);
    setAppointmentsError("");
    try {
      const response = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response, "Không thể tải lịch khám.");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAppointmentsError(err.message || "Không thể tải lịch khám.");
    } finally {
      setAppointmentsLoading(false);
    }
  }

  async function loadMedicalRecords() {
    if (!token) return;
    setRecordsLoading(true);
    setRecordsError("");
    try {
      const response = await fetch("/api/medical-records", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponse(response, "Không thể tải hồ sơ bệnh án.");
      setMedicalRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setRecordsError(err.message || "Không thể tải hồ sơ bệnh án.");
    } finally {
      setRecordsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadPatients();
      loadAppointments();
      loadMedicalRecords();
    }
  }, [token]);

  useEffect(() => {
    if (activePage === "records") loadMedicalRecords();
  }, [activePage]);

  async function updateAppointmentStatus(appointmentId, status, extraData = {}) {
    if (!token) return;
    setUpdatingAppointmentId(appointmentId);
    setAppointmentsError("");
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, ...extraData }),
      });
      const res = await readResponse(response, "Không thể cập nhật lịch hẹn.");
      if (res?.message) {
        setRecordMessage(res.message);
      }
      setRejectingAppointment(null);
      await loadAppointments();
    } catch (err) {
      setAppointmentsError(err.message || "Không thể cập nhật lịch hẹn.");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  function handleOpenRejectModal(appointment) {
    setRejectingAppointment(appointment);
    setRejectForm({ notes: "", reassign_to_other_doctor: true });
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectingAppointment) return;
    await updateAppointmentStatus(rejectingAppointment.id, "Rejected", {
      notes: rejectForm.notes.trim() || undefined,
      reassign_to_other_doctor: rejectForm.reassign_to_other_doctor,
    });
  }

  function openRecordForm(appointment) {
    setSelectedAppointment(appointment);
    setRecordForm(EMPTY_RECORD_FORM);
    setRecordMessage("");
    setRecordsError("");
    setShowRecordForm(true);
  }

  function closeRecordForm() {
    if (savingRecord) return;
    setShowRecordForm(false);
    setSelectedAppointment(null);
    setRecordForm(EMPTY_RECORD_FORM);
  }

  async function handleCreateRecord(event) {
    event.preventDefault();
    if (!selectedAppointment) {
      setRecordsError("Vui lòng chọn lịch khám trước khi tạo hồ sơ.");
      return;
    }
    if (!token) return;
    setSavingRecord(true);
    setRecordsError("");
    setRecordMessage("");
    try {
      const response = await fetch("/api/medical-records", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          chief_complaint: recordForm.chief_complaint.trim(),
          diagnosis: recordForm.diagnosis.trim(),
          treatment_plan: recordForm.treatment_plan.trim(),
          doctor_notes: recordForm.doctor_notes.trim(),
        }),
      });
      await readResponse(response, "Không thể tạo hồ sơ bệnh án.");
      setRecordMessage("Đã lưu hồ sơ bệnh án thành công.");
      setShowRecordForm(false);
      setSelectedAppointment(null);
      setRecordForm(EMPTY_RECORD_FORM);
      await loadMedicalRecords();
      await loadAppointments();
    } catch (err) {
      setRecordsError(err.message || "Không thể lưu hồ sơ bệnh án.");
    } finally {
      setSavingRecord(false);
    }
  }

  const filteredPatients = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return patients;
    return patients.filter((patient) => [
      patient.full_name, patient.patient_code, patient.email, patient.phone,
    ].some((value) => String(value ?? "").toLowerCase().includes(keyword)));
  }, [patients, search]);

  const filteredAppointments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesSearch = !keyword || [
        appointment.patient_name, appointment.reason, appointment.id,
      ].some((value) => String(value ?? "").toLowerCase().includes(keyword));
      const matchesStatus = appointmentStatusFilter === "All" || appointment.status === appointmentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, appointmentStatusFilter]);

  const existingAppointmentIds = new Set(medicalRecords.map((record) => Number(record.appointment_id)));
  const completedAppointmentsWithoutRecord = appointments.filter(
    (appointment) => appointment.status === "Completed" && !existingAppointmentIds.has(Number(appointment.id))
  );

  function renderState(message, isError = false, action = null) {
    return (
      <div className={`doctor-state${isError ? " doctor-state-error" : ""}`} role={isError ? "alert" : undefined}>
        {isError ? <AlertCircle size={20} /> : <RefreshCw size={20} className="doctor-spin" />}
        <span>{message}</span>{action}
      </div>
    );
  }

  function renderPatientsTable() {
    if (loading) return renderState("Đang tải danh sách bệnh nhân...");
    if (error) return renderState(error, true, <button className="doctor-button doctor-button-secondary" type="button" onClick={loadPatients}>Thử lại</button>);
    if (!filteredPatients.length) return <div className="doctor-empty"><Users size={32} /><strong>{patients.length ? "Không tìm thấy bệnh nhân" : "Chưa có bệnh nhân được phân công"}</strong><p>{patients.length ? "Hãy thử từ khóa khác." : "Danh sách sẽ hiển thị khi có bệnh nhân được phân công cho bạn."}</p></div>;
    return <div className="doctor-table-wrap"><table className="doctor-table"><thead><tr><th>BỆNH NHÂN</th><th>MÃ BỆNH NHÂN</th><th>LIÊN HỆ</th><th>TÌNH TRẠNG</th></tr></thead><tbody>
      {filteredPatients.map((patient) => <tr key={patient.id}><td><div className="doctor-patient-cell"><div className="doctor-patient-avatar"><UserRound size={18} /></div><div><strong>{patient.full_name || `Bệnh nhân #${patient.id}`}</strong><span>{patient.gender ? genderLabel(patient.gender) : "Chưa cập nhật giới tính"}</span></div></div></td><td>{patient.patient_code || "—"}</td><td><div>{patient.phone || "Chưa có số điện thoại"}</div><span className="doctor-secondary-text">{patient.email || "Chưa có email"}</span></td><td><span className={`doctor-status ${statusClass(patient.status)}`}>{statusLabel(patient.status)}</span></td></tr>)}
    </tbody></table></div>;
  }

  function renderAppointmentsTable(items = filteredAppointments, withActions = true) {
    if (appointmentsLoading && appointments.length === 0) return renderState("Đang tải lịch khám...");
    if (appointmentsError && appointments.length === 0) return renderState(appointmentsError, true, <button type="button" className="doctor-button doctor-button-secondary" onClick={loadAppointments}>Thử lại</button>);
    if (!items.length) return <div className="doctor-empty"><CalendarDays size={32} /><strong>{appointments.length ? "Không tìm thấy lịch phù hợp" : "Chưa có lịch khám"}</strong><p>{appointments.length ? "Hãy đổi từ khóa hoặc bộ lọc." : "Lịch hẹn được phân công cho bạn sẽ xuất hiện tại đây."}</p></div>;
    return <div className="doctor-table-wrap"><table className="doctor-table"><thead><tr><th>BỆNH NHÂN</th><th>NGÀY / GIỜ</th><th>LÝ DO KHÁM</th><th>TRẠNG THÁI</th>{withActions && <th>THAO TÁC</th>}</tr></thead><tbody>
      {items.map((appointment) => <tr key={appointment.id}><td><div className="doctor-patient-cell"><div className="doctor-patient-avatar"><UserRound size={18} /></div><div><strong>{appointment.patient_name || `Bệnh nhân #${appointment.patient_id}`}</strong><span>Mã lịch: #{appointment.id}</span></div></div></td><td>{formatDate(appointment.appointment_date)}<br /><span className="doctor-secondary-text">{formatTime(appointment.appointment_time)}</span></td><td>{appointment.reason || "Không có ghi chú"}</td><td><span className={`doctor-status ${appointmentStatusClass(appointment.status)}`}>{appointmentStatusLabel(appointment.status)}</span></td>{withActions && <td><div className="doctor-appointment-actions">
        {appointment.status === "Pending" && (
          <>
            <button type="button" className="doctor-button doctor-button-secondary" disabled={updatingAppointmentId === appointment.id} onClick={() => updateAppointmentStatus(appointment.id, "Confirmed")}>
              <Check size={15} /> Xác nhận
            </button>
            <button type="button" className="doctor-button doctor-button-danger" disabled={updatingAppointmentId === appointment.id} onClick={() => handleOpenRejectModal(appointment)}>
              <X size={15} /> Từ chối
            </button>
          </>
        )}
        {appointment.status === "Confirmed" && (
          <>
            <button type="button" className="doctor-button doctor-button-secondary" disabled={updatingAppointmentId === appointment.id} onClick={() => updateAppointmentStatus(appointment.id, "Completed")}>
              <Check size={15} /> Hoàn thành
            </button>
            <button type="button" className="doctor-button doctor-button-danger" disabled={updatingAppointmentId === appointment.id} onClick={() => handleOpenRejectModal(appointment)}>
              <X size={15} /> Hủy / Báo bận
            </button>
          </>
        )}
        {appointment.status === "Completed" && !existingAppointmentIds.has(Number(appointment.id)) && (
          <button type="button" className="doctor-button doctor-button-secondary" onClick={() => openRecordForm(appointment)}>
            <Plus size={15} /> Tạo bệnh án
          </button>
        )}
        {["Completed", "Cancelled", "Rejected"].includes(appointment.status) && !(appointment.status === "Completed" && !existingAppointmentIds.has(Number(appointment.id))) && (
          <span className="doctor-secondary-text">Không có thao tác</span>
        )}
      </div></td>}</tr>)}
    </tbody></table></div>;
  }

  function renderRecords() {
    return <section className="doctor-panel">
      <div className="doctor-panel-heading"><div><h2>Hồ sơ bệnh án</h2><p>Xem hồ sơ đã lập và tạo hồ sơ cho lịch khám đã hoàn thành.</p></div><button type="button" className="doctor-button doctor-button-secondary" onClick={() => { loadMedicalRecords(); loadAppointments(); }} disabled={recordsLoading}><RefreshCw size={16} className={recordsLoading ? "doctor-spin" : ""} /> Làm mới</button></div>
      {recordMessage && <div className="doctor-state" role="status"><CheckCircle2 size={18} /><span>{recordMessage}</span></div>}
      {recordsError && <div className="doctor-state doctor-state-error" role="alert"><AlertCircle size={18} /><span>{recordsError}</span></div>}
      {showRecordForm && selectedAppointment && <form className="doctor-record-form" onSubmit={handleCreateRecord}>
        <div className="doctor-panel-heading"><div><h3>Tạo hồ sơ bệnh án</h3><p>Bệnh nhân: {selectedAppointment.patient_name || `#${selectedAppointment.patient_id}`} · Lịch khám #{selectedAppointment.id}</p></div><button type="button" className="doctor-button doctor-button-secondary" onClick={closeRecordForm} disabled={savingRecord}>Đóng</button></div>
        <label>Triệu chứng / lý do khám <textarea required rows={3} value={recordForm.chief_complaint} onChange={(e) => setRecordForm({ ...recordForm, chief_complaint: e.target.value })} placeholder="Mô tả triệu chứng và lý do khám..." /></label>
        <label>Chẩn đoán <textarea required rows={3} value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} placeholder="Nhập chẩn đoán của bác sĩ..." /></label>
        <label>Phác đồ / kế hoạch điều trị <textarea rows={3} value={recordForm.treatment_plan} onChange={(e) => setRecordForm({ ...recordForm, treatment_plan: e.target.value })} placeholder="Nhập kế hoạch điều trị..." /></label>
        <label>Ghi chú của bác sĩ <textarea rows={3} value={recordForm.doctor_notes} onChange={(e) => setRecordForm({ ...recordForm, doctor_notes: e.target.value })} placeholder="Ghi chú bổ sung..." /></label>
        <div className="doctor-appointment-actions"><button type="submit" className="doctor-button" disabled={savingRecord}>{savingRecord ? "Đang lưu..." : "Lưu hồ sơ bệnh án"}</button><button type="button" className="doctor-button doctor-button-secondary" onClick={closeRecordForm} disabled={savingRecord}>Hủy</button></div>
      </form>}
      <div className="doctor-panel-heading"><div><h3>Lịch khám đã hoàn thành chưa có bệnh án</h3><p>Chỉ có thể tạo một hồ sơ cho mỗi lịch khám.</p></div><span className="doctor-count">{completedAppointmentsWithoutRecord.length} lịch</span></div>
      {appointmentsError && <div className="doctor-state doctor-state-error" role="alert"><AlertCircle size={18} /><span>{appointmentsError}</span></div>}
      {appointmentsLoading ? renderState("Đang tải lịch khám...") : completedAppointmentsWithoutRecord.length === 0 ? <div className="doctor-empty"><FileText size={30} /><strong>Không có lịch khám cần lập bệnh án</strong><p>Các lịch khám phải ở trạng thái “Đã hoàn thành” và chưa có hồ sơ.</p></div> : <div className="doctor-table-wrap"><table className="doctor-table"><thead><tr><th>BỆNH NHÂN</th><th>NGÀY KHÁM</th><th>LÝ DO KHÁM</th><th>THAO TÁC</th></tr></thead><tbody>{completedAppointmentsWithoutRecord.map((a) => <tr key={a.id}><td><strong>{a.patient_name || `Bệnh nhân #${a.patient_id}`}</strong><br /><span className="doctor-secondary-text">Lịch #{a.id}</span></td><td>{formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}</td><td>{a.reason || "Không có ghi chú"}</td><td><button type="button" className="doctor-button doctor-button-secondary" onClick={() => openRecordForm(a)}><Plus size={15} /> Tạo bệnh án</button></td></tr>)}</tbody></table></div>}
    </section>;
  }

  function renderContent() {
    if (activePage === "patients") {
      return (
        <section className="doctor-panel">
          <div className="doctor-panel-heading">
            <div><h2>Danh sách bệnh nhân được phân công</h2><p>Dữ liệu chỉ bao gồm các bệnh nhân có lịch hẹn hoặc hồ sơ với bạn.</p></div>
            <button type="button" className="doctor-button doctor-button-secondary" onClick={loadPatients} disabled={loading}><RefreshCw size={16} className={loading ? "doctor-spin" : ""} /> Làm mới</button>
          </div>
          {renderPatientsTable()}
        </section>
      );
    }

    if (activePage === "appointments") {
      return (
        <section className="doctor-panel">
          <div className="doctor-panel-heading">
            <div><h2>Lịch khám bệnh</h2><p>Quản lý lịch hẹn, xác nhận, từ chối và hỗ trợ chuyển ca khám.</p></div>
            <button type="button" className="doctor-button doctor-button-secondary" onClick={loadAppointments} disabled={appointmentsLoading}><RefreshCw size={16} className={appointmentsLoading ? "doctor-spin" : ""} /> Làm mới</button>
          </div>
          <div className="doctor-tabs">
            {["All", "Pending", "Confirmed", "Completed", "Cancelled", "Rejected"].map((tab) => (
              <button key={tab} type="button" className={`doctor-tab ${appointmentStatusFilter === tab ? "active" : ""}`} onClick={() => setAppointmentStatusFilter(tab)}>
                {tab === "All" ? "Tất cả" : appointmentStatusLabel(tab)}
              </button>
            ))}
          </div>
          {renderAppointmentsTable()}
        </section>
      );
    }

    if (activePage === "records") return renderRecords();

    if (activePage === "prescriptions") {
      return (
        <FeaturePlaceholder
          icon={Pill}
          title="Chức năng đơn thuốc đang được hoàn thiện"
          description="Bác sĩ sẽ có thể kê đơn thuốc trực tiếp từ hồ sơ bệnh án."
          nextStep="Dữ liệu kê đơn sẽ liên kết với kho dược và bệnh án điện tử."
        />
      );
    }

    return (
      <>
        <div className="doctor-stats-grid">
          <StatCard icon={Users} title="Bệnh nhân phụ trách" value={loading ? "..." : patients.length} note="Được phân công" type="teal" />
          <StatCard
            icon={CalendarDays}
            title="Lịch chờ xác nhận"
            value={appointmentsLoading ? "..." : appointments.filter((a) => a.status === "Pending").length}
            note="Cần phản hồi sớm"
            type="amber"
          />
          <StatCard
            icon={ClipboardList}
            title="Hồ sơ đã lập"
            value={recordsLoading ? "..." : medicalRecords.length}
            note="Bệnh án điện tử"
            type="blue"
          />
        </div>

        <section className="doctor-panel">
          <div className="doctor-panel-heading">
            <div><h2>Lịch khám sắp tới</h2><p>3 lịch khám gần nhất được phân công cho bạn.</p></div>
            <button type="button" className="doctor-button doctor-button-secondary" onClick={() => setActivePage("appointments")}>
              Xem tất cả <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="doctor-appointment-summary-list">
            {appointmentsLoading && appointments.length === 0 ? (
              <p className="doctor-secondary-text">Đang tải lịch khám...</p>
            ) : appointments.length === 0 ? (
              <p className="doctor-secondary-text">Chưa có lịch hẹn.</p>
            ) : (
              appointments.slice(0, 3).map((item) => (
                <div className="doctor-appointment-summary-item" key={item.id}>
                  <div>
                    <strong>{item.patient_name || `Bệnh nhân #${item.patient_id}`}</strong>
                    <span>{formatDate(item.appointment_date)} · {formatTime(item.appointment_time)}</span>
                  </div>
                  <span className={`doctor-status ${appointmentStatusClass(item.status)}`}>{appointmentStatusLabel(item.status)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="doctor-notice">
          <CheckCircle2 size={20} />
          <div>
            <strong>Hệ thống xác thực đã được tích hợp</strong>
            <p>Danh sách bệnh nhân, lịch khám và hồ sơ bệnh án được tải từ backend theo quyền tài khoản đang đăng nhập.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="doctor-layout">
      <aside className="doctor-sidebar">
        <div className="doctor-brand"><div className="doctor-brand-icon"><HeartPulse size={25} /></div><div><strong>Patient Portal</strong><span>DOCTOR WORKSPACE</span></div></div>
        <div className="doctor-sidebar-label">KHÔNG GIAN BÁC SĨ</div>
        <nav className="doctor-nav">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className={`doctor-nav-link ${activePage === item.id ? "active" : ""}`} onClick={() => { setActivePage(item.id); setRecordMessage(""); }}>
                <Icon size={19} /><span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="doctor-sidebar-bottom">
          <div className="doctor-profile"><div className="doctor-profile-avatar"><Stethoscope size={19} /></div><div className="doctor-profile-info"><strong>Bác sĩ</strong><span>Tài khoản đang đăng nhập</span></div></div>
          <button type="button" className="doctor-nav-link doctor-logout" onClick={logout}><LogOut size={19} /><span>Đăng xuất</span></button>
        </div>
      </aside>
      <main className="doctor-main">
        <header className="doctor-header">
          <div className="doctor-header-title"><Stethoscope size={20} /><span>Doctor Dashboard</span></div>
          <div className="doctor-header-actions">
            <div className="doctor-role-badge"><CheckCircle2 size={15} />Bác sĩ</div>
            <div className="doctor-header-divider" />
            <button type="button" className="doctor-notification" aria-label="Thông báo" title="Thông báo" onClick={() => window.alert("Chức năng thông báo sẽ được bổ sung sau.")}><Bell size={19} /></button>
          </div>
        </header>
        <div className="doctor-content">
          {(activePage === "patients" || activePage === "appointments" || activePage === "overview") && (
            <div className={`doctor-page-toolbar ${activePage === "overview" ? "doctor-overview-toolbar" : ""}`}>
              <div className="doctor-search">
                <Search size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={activePage === "appointments" ? "Tìm theo tên bệnh nhân, lý do khám, mã lịch..." : "Tìm bệnh nhân theo tên, mã, email..."} aria-label="Tìm kiếm" />
              </div>
              {activePage === "overview" && (
                <button type="button" className="doctor-button doctor-button-secondary" onClick={() => setActivePage("patients")}><Users size={16} /> Danh sách bệnh nhân</button>
              )}
            </div>
          )}
          {renderContent()}
          <footer className="doctor-footer">© 2026 Patient Portal · Hospital Management System</footer>
        </div>
      </main>

      {/* Modal xác nhận từ chối / hủy lịch và chuyển ca khám */}
      {rejectingAppointment && (
        <div className="doctors-modal-backdrop" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1.5rem", maxWidth: "480px", width: "90%", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginTop: 0, fontSize: "1.25rem", color: "#1e293b" }}>
              Từ chối / Hủy lịch hẹn #{rejectingAppointment.id}
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Bệnh nhân: <strong>{rejectingAppointment.patient_name || `#${rejectingAppointment.patient_id}`}</strong>
              <br />
              Thời gian: {formatDate(rejectingAppointment.appointment_date)} lúc {formatTime(rejectingAppointment.appointment_time)}
            </p>

            <form onSubmit={handleConfirmReject} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#334155", marginBottom: "0.25rem" }}>
                  Lý do vắng mặt / hủy khám (Notes):
                </label>
                <textarea
                  rows={3}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}
                  placeholder="Ví dụ: Bác sĩ có ca mổ cấp cứu đột xuất..."
                  value={rejectForm.notes}
                  onChange={(e) => setRejectForm({ ...rejectForm, notes: e.target.value })}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#1e293b", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rejectForm.reassign_to_other_doctor}
                  onChange={(e) => setRejectForm({ ...rejectForm, reassign_to_other_doctor: e.target.checked })}
                />
                Tự động chuyển bệnh nhân sang đồng nghiệp cùng chuyên khoa
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="doctor-button doctor-button-secondary"
                  onClick={() => setRejectingAppointment(null)}
                  disabled={updatingAppointmentId === rejectingAppointment.id}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="doctor-button doctor-button-danger"
                  disabled={updatingAppointmentId === rejectingAppointment.id}
                >
                  {updatingAppointmentId === rejectingAppointment.id ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, note, type }) {
  return <article className="doctor-stat-card"><div className={`doctor-stat-icon ${type}`}><Icon size={22} /></div><div className="doctor-stat-title">{title}</div><div className="doctor-stat-value">{value}</div><div className="doctor-stat-note">{note}</div></article>;
}

function FeaturePlaceholder({ icon: Icon, title, description, nextStep }) {
  return <section className="doctor-panel doctor-feature-placeholder"><div className="doctor-placeholder-icon"><Icon size={28} /></div><h2>{title}</h2><p>{description}</p><div className="doctor-placeholder-note"><AlertCircle size={18} /><span>{nextStep}</span></div></section>;
}

function genderLabel(value) { return ({ Male: "Nam", Female: "Nữ", Other: "Khác" })[value] || value; }
function statusLabel(value) { return ({ Waiting: "Đang chờ", "Under Treatment": "Đang điều trị", Discharged: "Đã xuất viện" })[value] || value || "Chưa cập nhật"; }
function statusClass(value) { return ({ Waiting: "waiting", "Under Treatment": "treatment", Discharged: "discharged" })[value] || "unknown"; }
function formatDate(value) { if (!value) return "Chưa xác định ngày"; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN"); }
function formatTime(value) { return value ? String(value).slice(0, 5) : "Chưa xác định giờ"; }
function appointmentStatusLabel(value) { return ({ Pending: "Chờ xác nhận", Confirmed: "Đã xác nhận", Completed: "Đã hoàn thành", Cancelled: "Đã hủy", Rejected: "Đã từ chối" })[value] || value || "Chưa cập nhật"; }
function appointmentStatusClass(value) { return ({ Pending: "waiting", Confirmed: "treatment", Completed: "discharged", Cancelled: "unknown", Rejected: "unknown" })[value] || "unknown"; }
