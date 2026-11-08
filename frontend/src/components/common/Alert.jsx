import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="pd-error">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

export function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <div role="status" className="pd-success">
      {message}
    </div>
  );
}