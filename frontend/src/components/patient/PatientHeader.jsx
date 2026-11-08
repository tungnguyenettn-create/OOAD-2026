import { Bell, CheckCircle2, LogOut, UserRound } from "lucide-react";

export default function PatientHeader({ unreadCount, onNavigate, onLogout }) {
  return (
    <header className="pt-header">
      <div className="pt-header-title">
        <UserRound size={20} />
        <span>Patient Dashboard</span>
      </div>

      <div className="pt-header-actions">
        <div className="pt-role">
          <CheckCircle2 size={15} />
          Bệnh nhân
        </div>
        <div className="pt-divider" />
        <button
          type="button"
          className="pt-icon-btn"
          aria-label="Thông báo"
          title="Thông báo"
          onClick={() => onNavigate("notifications")}
        >
          <Bell size={19} />
          {unreadCount > 0 && <i className="pt-bell-dot" />}
        </button>
        <button type="button" className="pt-icon-btn" aria-label="Đăng xuất" title="Đăng xuất" onClick={onLogout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
