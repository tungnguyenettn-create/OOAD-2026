import { HeartPulse } from "lucide-react";

export default function LoginBanner() {
  return (
    <section className="login-banner">
      <div className="brand">
        <div className="brand-icon">
          <HeartPulse size={27} />
        </div>
        <span>Patient Portal</span>
      </div>

      <div className="banner-content">
        <span className="eyebrow">YOUR HEALTH, OUR PRIORITY</span>

        <h1>
          Chăm sóc sức khỏe
          <br />
          bắt đầu từ đây.
        </h1>

        <p>
          Quản lý lịch khám, theo dõi thông tin sức khỏe và kết nối với đội ngũ
          y tế trong một nền tảng duy nhất.
        </p>
      </div>

      {/* Cụm dưới đáy: câu "Đồng hành..." căn giữa, nằm ngay trên dòng PATIENT PORTAL */}
      <div className="banner-bottom">
        <div className="banner-note">
          <HeartPulse size={20} />
          <span>Đồng hành cùng bạn trên hành trình khỏe mạnh.</span>
        </div>

        <div className="banner-footer">
          PATIENT PORTAL · HEALTHCARE MANAGEMENT SYSTEM
        </div>
      </div>
    </section>
  );
}