import { useCallback, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function useApi() {
  const { token, logout } = useContext(AuthContext);

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        logout();
        throw new Error("Phiên đăng nhập đã hết hạn.");
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : `Yêu cầu thất bại (HTTP ${response.status}).`
        );
      }

      return data;
    },
    [token, logout]
  );

  return { token, logout, request };
}