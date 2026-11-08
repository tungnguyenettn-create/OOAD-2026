import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext"; // Import AuthContext mới
import { getTokenPayload } from "../auth/jwt"; // Đổi đường dẫn trỏ về thư mục auth/

const API_LOGIN_URL = "/api/auth/login";
const EMPTY_REGISTER = {
  fullName: "", email: "", phone: "",
  dateOfBirth: "", password: "", confirmPassword: "",
};

export default function useAuth() {
  const navigate = useNavigate();
  
  // Lấy hàm login từ AuthContext để xử lý token và điều hướng
  const { login } = useContext(AuthContext); 

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState(EMPTY_REGISTER);

  async function handleLogin(event) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.username.trim(),
          password: loginData.password,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
        if (response.status === 403) throw new Error("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        if (response.status === 422) throw new Error("Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại.");
        if (response.status >= 500) throw new Error("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
        throw new Error(result.detail || `Đăng nhập thất bại (HTTP ${response.status}).`);
      }

      if (!result.access_token) throw new Error("Máy chủ không trả về access_token hợp lệ.");

      const role = getTokenPayload(result.access_token)?.role;
      if (!role) throw new Error("Không xác định được vai trò tài khoản trong JWT.");

      if (!["admin", "doctor", "patient"].includes(role)) {
        throw new Error(`Vai trò "${role}" chưa được hỗ trợ.`);
      }

      // CHUYỂN SANG ROUTER: Gọi hàm login của Context thay vì tự lưu sessionStorage và setPage
      login(result.access_token, role);

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      if (error instanceof TypeError || error.message === "Failed to fetch") {
        setLoginError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và cấu hình API.");
      } else {
        setLoginError(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (registerData.password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      const email = registerData.email.trim().toLowerCase();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          email,
          password: registerData.password,
          full_name: registerData.fullName.trim(),
          phone: registerData.phone.trim(),
          date_of_birth: registerData.dateOfBirth || null,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let message = "Đăng ký thất bại. Vui lòng thử lại.";
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail.map((item) => {
            const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "Thông tin";
            return `${field}: ${item.msg || "Dữ liệu không hợp lệ"}`;
          }).join("\n");
        } else if (typeof data.message === "string") {
          message = data.message;
        }
        throw new Error(message);
      }

      alert("Đăng ký tài khoản thành công! Bạn có thể đăng nhập.");
      
      // Xóa form và chuyển hướng về trang login của patient
      setLoginData({ username: email, password: "" });
      setRegisterData(EMPTY_REGISTER);
      navigate("/patient/login");

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert(error.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    loginError, setLoginError,
    loginData, setLoginData,
    registerData, setRegisterData,
    handleLogin, handleRegister,
  };
}