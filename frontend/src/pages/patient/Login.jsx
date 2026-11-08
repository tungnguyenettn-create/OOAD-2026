import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';

export default function PatientLogin() {
  const navigate = useNavigate();
  const auth = useAuth(); // Dùng lại hook cũ có chứa api login

  return (
    <>
      <span className="form-label">CHÀO MỪNG BẠN</span>
      <h2>Đăng nhập</h2>
      <p className="form-description">
        Vui lòng nhập thông tin để truy cập tài khoản của bạn.
      </p>

      <LoginForm
        data={auth.loginData}
        setData={auth.setLoginData}
        error={auth.loginError}
        setError={auth.setLoginError}
        isLoading={auth.isLoading}
        onSubmit={auth.handleLogin}
        onGoRegister={() => {
          auth.setLoginError("");
          navigate('/patient/register');
        }}
      />
    </>
  );
}