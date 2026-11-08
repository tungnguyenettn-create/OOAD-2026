import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import RegisterForm from '../../components/RegisterForm';

export default function PatientRegister() {
  const navigate = useNavigate();
  const auth = useAuth(); // Dùng lại hook cũ có chứa api register

  return (
    <>
      <button 
        type="button" 
        className="back-button"
        onClick={() => {
          auth.setLoginError("");
          navigate('/patient/login');
        }}
      >
        <ArrowLeft size={17} /> Quay lại đăng nhập
      </button>

      <span className="form-label">THAM GIA CÙNG CHÚNG TÔI</span>
      <h2>Tạo tài khoản</h2>
      <p className="form-description">
        Điền thông tin bên dưới để tạo tài khoản bệnh nhân.
      </p>

      <RegisterForm
        data={auth.registerData}
        setData={auth.setRegisterData}
        onSubmit={auth.handleRegister}
        isLoading={auth.isLoading}
        onGoLogin={() => {
          auth.setLoginError("");
          navigate('/patient/login');
        }}
      />
    </>
  );
}