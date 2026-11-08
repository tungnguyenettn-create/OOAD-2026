import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import InputField from "./InputField";

export default function PasswordInput({ id, label, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <InputField
      id={id}
      label={label}
      icon={Lock}
      type={show ? "text" : "password"}
      {...props}
    >
      <button
        className="password-toggle"
        type="button"
        aria-label="Hiện hoặc ẩn mật khẩu"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </InputField>
  );
}