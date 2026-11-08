export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`pt-toast ${toast.variant === "error" ? "pt-toast--error" : ""}`} role="status">
      {toast.message}
    </div>
  );
}
