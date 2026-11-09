import { useState } from "react";
import { API_ME_PASSWORD } from "../utils/constants";

const EMPTY_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

/** Form đổi mật khẩu cho bệnh nhân. */
export default function usePasswordChange({ request, notify }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  function reset() {
    setForm(EMPTY_FORM);
  }

  async function save(event) {
    event?.preventDefault();

    if (!form.current_password) {
      return notify("Vui lòng nhập mật khẩu hiện tại.", "error");
    }

    if (form.new_password.length < 8) {
      return notify("Mật khẩu mới phải có ít nhất 8 ký tự.", "error");
    }

    if (form.new_password !== form.confirm_password) {
      return notify("Mật khẩu xác nhận không khớp.", "error");
    }

    setSaving(true);
    try {
      await request(API_ME_PASSWORD, {
        method: "POST",
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });
      notify("Đã đổi mật khẩu");
      reset();
    } catch (error) {
      notify(error.message || "Không thể đổi mật khẩu.", "error");
    } finally {
      setSaving(false);
    }
  }

  return { form, setField, saving, save, reset };
}
