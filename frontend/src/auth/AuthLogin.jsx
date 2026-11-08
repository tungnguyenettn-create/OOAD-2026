import { Outlet } from 'react-router-dom';
import { HeartPulse, Lock } from 'lucide-react';
import LoginBanner from '../components/LoginBanner';
import '../styles/auth.css'; // Đổi tên từ App.css cũ

const AuthLayout = () => {
  return (
    <div className="login-page">
      <LoginBanner />

      <main className="login-main">
        <div className="login-card">
          <div className="mobile-brand">
            <HeartPulse size={28} />
            <span>Patient Portal</span>
          </div>

          {/* Các form Login/Register sẽ được chèn vào đây */}
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