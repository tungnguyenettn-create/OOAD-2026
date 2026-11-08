import { UserRound, Mail, Phone, CalendarDays, ArrowRight } from "lucide-react";
import InputField from "./InputField";
import PasswordInput from "./PasswordInput";

export default function RegisterForm({ data, setData, onSubmit, onGoLogin }) {
  const update = (field) => (e) => setData({ ...data, [field]: e.target.value });

  return (
    <form onSubmit={onSubmit}>
      <InputField id="fullName" label="Họ và tên" icon={UserRound}
        type="text" placeholder="Nguyễn Văn A" autoComplete="name"
        value={data.fullName} onChange={update("fullName")} required />

      <InputField id="registerEmail" label="Địa chỉ email" icon={Mail}
        type="email" placeholder="name@example.com" autoComplete="email"
        value={data.email} onChange={update("email")} required />

      <InputField id="phone" label="Số điện thoại" icon={Phone}
        type="tel" placeholder="09xxxxxxxx" autoComplete="tel"
        value={data.phone} onChange={update("phone")} required />

      <InputField id="dateOfBirth" label="Ngày sinh" icon={CalendarDays}
        type="date" autoComplete="bday"
        value={data.dateOfBirth} onChange={update("dateOfBirth")} required />

      <PasswordInput id="registerPassword" label="Mật khẩu"
        placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" minLength={8}
        value={data.password} onChange={update("password")} required />

      <PasswordInput id="confirmPassword" label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu" autoComplete="new-password" minLength={8}
        value={data.confirmPassword} onChange={update("confirmPassword")} required />

      <button className="login-button" type="submit">
        Tạo tài khoản <ArrowRight size={19} />
      </button>

      <p className="register-prompt">
        Đã có tài khoản?{" "}
        <a href="#login" onClick={(e) => { e.preventDefault(); onGoLogin(); }}>
          Đăng nhập
        </a>
      </p>
    </form>
  );
}