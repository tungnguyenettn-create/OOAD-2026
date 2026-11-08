import { AlertCircle, RefreshCw } from "lucide-react";

export default function StateMessage({ message, variant = "loading", action = null }) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : RefreshCw;
  return (
    <div className={`pt-state ${isError ? "pt-state--error" : ""}`} role={isError ? "alert" : undefined}>
      <Icon size={18} className={isError ? undefined : "pt-spin"} />
      <span>{message}</span>
      {action}
    </div>
  );
}
