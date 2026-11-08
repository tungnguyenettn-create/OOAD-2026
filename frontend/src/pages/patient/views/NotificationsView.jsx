import { Check } from "lucide-react";
import PageTitle from "../../../components/patient/PageTitle";
import Panel from "../../../components/patient/Panel";
import NotificationList from "../../../components/patient/NotificationList";

export default function NotificationsView({ notifications }) {
  const { items, unreadCount, markAllRead } = notifications;

  return (
    <>
      <PageTitle eyebrow="THÔNG BÁO" title="Thông báo" subtitle="Cập nhật về lịch khám và hồ sơ của bạn." />
      <Panel
        title="Tất cả thông báo"
        description={unreadCount ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
        action={
          <button type="button" className="pt-btn pt-btn--secondary" onClick={markAllRead} disabled={!unreadCount}>
            <Check size={16} /> Đánh dấu đã đọc
          </button>
        }
      >
        <NotificationList items={items} />
      </Panel>
    </>
  );
}
