import { HeartPulse, LogOut, UserRound } from "lucide-react";
import { PATIENT_MENU } from "../../utils/patientConstants";

export default function PatientSidebar({ activePage, onNavigate, onLogout, patient, unreadCount }) {
  return (
    <aside className="pt-sidebar">
      <div className="pt-brand">
        <div className="pt-brand-icon">
          <HeartPulse size={25} />
        </div>
        <div>
          <strong>Patient Portal</strong>
          <span>PATIENT WORKSPACE</span>
        </div>
      </div>

      <div className="pt-side-label">KHÔNG GIAN BỆNH NHÂN</div>

      <nav className="pt-nav">
        {PATIENT_MENU.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`pt-nav-link ${activePage === id ? "active" : ""}`}
            aria-current={activePage === id ? "page" : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
            {id === "notifications" && unreadCount > 0 && <b className="pt-nav-badge">{unreadCount}</b>}
          </button>
        ))}
      </nav>

      <div className="pt-side-bottom">
        <div className="pt-profile">
          <div className="pt-avatar">
            <UserRound size={19} />
          </div>
          <div>
            <strong>{patient?.full_name || "Bệnh nhân"}</strong>
            <span>Mã BN: {patient?.patient_code || "—"}</span>
          </div>
        </div>

        <button type="button" className="pt-nav-link pt-logout" onClick={onLogout}>
          <LogOut size={19} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
