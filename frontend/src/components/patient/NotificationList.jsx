import { Bell, Check, Clock, FileText, XCircle } from "lucide-react";
import { formatDate } from "../../utils/patientHelpers";

const ICONS = { check: Check, clock: Clock, file: FileText, x: XCircle };

export default function NotificationList({ items }) {
  if (!items.length) {
    return (
      <div className="pt-empty">
        <Bell size={28} />
        <p>Chưa có thông báo nào.</p>
      </div>
    );
  }

  return (
    <div>
      {items.map((n) => {
        const Icon = ICONS[n.icon] || Bell;
        return (
          <div key={n.id} className={`pt-notif ${n.unread ? "unread" : ""}`}>
            <div className={`pt-notif-icon pt-status--${n.tone}`}>
              <Icon size={18} />
            </div>
            <div className="pt-notif-body">
              <strong>{n.title}</strong>
              <p>{n.message}</p>
            </div>
            <time>{n.when ? formatDate(n.when) : ""}</time>
            {n.unread && <span className="pt-dot" aria-label="Chưa đọc" />}
          </div>
        );
      })}
    </div>
  );
}
