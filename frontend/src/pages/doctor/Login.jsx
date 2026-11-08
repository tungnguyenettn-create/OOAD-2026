import useAuth from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';

export default function DoctorLogin() {
  const auth = useAuth(); // Dùng lại hook cũ

  return (
    <>
      <span className="form-label">CỔNG BÁC SĨ</span>
      <h2>Đăng nhập</h2>
      <p className="form-description">
        Vui lòng nhập thông tin để truy cập hệ thống quản lý khám bệnh.
      </p>

      <LoginForm
        data={auth.loginData}
        setData={auth.setLoginData}
        error={auth.loginError}
        setError={auth.setLoginError}
        isLoading={auth.isLoading}
        onSubmit={auth.handleLogin}
        // Không truyền onGoRegister để tự động ẩn link đăng ký
      />
    </>
  );
}