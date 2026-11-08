import { UserRound, ArrowRight, LogIn } from "lucide-react";
import InputField from "./InputField";
import PasswordInput from "./PasswordInput";

export default function LoginForm({
  data,
  setData,
  error,
  setError,
  isLoading,
  onSubmit,
  onGoRegister,
}) {
  function update(field) {
    return (e) => {
      setData({ ...data, [field]: e.target.value });
      if (error) setError("");
    };
  }

  return (
    <form onSubmit={onSubmit}>
      <InputField
        id="username"
        label="Tên đăng nhập"
        icon={UserRound}
        type="text"
        placeholder="Nhập tên đăng nhập"
        autoComplete="username"
        value={data.username}
        onChange={update("username")}
        required
      />

      <PasswordInput
        id="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        autoComplete="current-password"
        value={data.password}
        onChange={update("password")}
        required
      />

      {/* Quên mật khẩu: ngay trên nút đăng nhập, lệch phải */}
      <div className="forgot-row">
        <a
          href="#forgot-password"
          onClick={(e) => {
            e.preventDefault();
            alert("Chức năng quên mật khẩu sẽ được bổ sung sau.");
          }}
        >
          Quên mật khẩu?
        </a>
      </div>

      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}

      <button className="login-button" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            Đang đăng nhập... <LogIn size={19} />
          </>
        ) : (
          <>
            Đăng nhập <ArrowRight size={19} />
          </>
        )}
      </button>

      <p className="register-prompt">
        Bạn chưa có tài khoản?{" "}
        <a
          href="#register"
          onClick={(e) => {
            e.preventDefault();
            onGoRegister();
          }}
        >
          Đăng ký ngay
        </a>
      </p>
    </form>
  );
}