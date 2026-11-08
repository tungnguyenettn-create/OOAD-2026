import useAuth from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';

export default function AdminLogin() {
  const auth = useAuth(); // Dùng lại hook cũ

  return (
    <>
      <span className="form-label">CỔNG QUẢN TRỊ VIÊN</span>
      <h2>Đăng nhập</h2>
      <p className="form-description">
        Truy cập hệ thống quản lý tổng thể Patient Portal.
      </p>

      <LoginForm
        data={auth.loginData}
        setData={auth.setLoginData}
        error={auth.loginError}
        setError={auth.setLoginError}
        isLoading={auth.isLoading}
        onSubmit={auth.handleLogin}
        // Không truyền onGoRegister
      />
    </>
  );
}