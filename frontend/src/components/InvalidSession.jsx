import { ArrowRight } from "lucide-react";

export default function InvalidSession({ onLogout }) {
  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card">
          <h2>Phiên đăng nhập không hợp lệ</h2>
          <p className="form-description">Vui lòng đăng nhập lại để tiếp tục.</p>
          <button type="button" className="login-button" onClick={onLogout}>
            Quay lại đăng nhập <ArrowRight size={19} />
          </button>
        </div>
      </main>
    </div>
  );
}