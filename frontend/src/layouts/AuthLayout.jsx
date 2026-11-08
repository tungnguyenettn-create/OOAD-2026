import { Outlet, useLocation } from 'react-router-dom';
import { HeartPulse, Lock } from 'lucide-react';
import LoginBanner from '../components/LoginBanner';
import '../styles/auth.css'; // Sửa thành '../App.css' nếu bạn chưa đổi tên/di chuyển file CSS

const AuthLayout = () => {
  const location = useLocation();
  let portalName = "Patient Portal";
  if (location.pathname.includes("doctor")) portalName = "Doctor Portal";
  if (location.pathname.includes("admin")) portalName = "Admin Portal";

  return (
    <div className="login-page">
      <LoginBanner />

      <main className="login-main">
        <div className="login-card">
          <div className="mobile-brand">
            <HeartPulse size={28} />
            <span>{portalName}</span>
          </div>
          
          {/* Form Login/Register sẽ được render tại đây */}
          <Outlet />

          <div className="security-note">
            <Lock size={15} />
            <span>Thông tin của bạn cần được bảo vệ an toàn.</span>
          </div>
        </div>

        <footer className="page-footer">
          © 2026 Patient Portal. Hệ thống quản lý khám bệnh.
        </footer>
      </main>
    </div>
  );
};

export default AuthLayout;