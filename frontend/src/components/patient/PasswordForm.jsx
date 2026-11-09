import Panel from "./Panel";

export default function PasswordForm({ password }) {
  const { form, setField, saving, save, reset } = password;

  return (
    <Panel
      className="pt-form-card"
      title="Đổi mật khẩu"
      description="Nên dùng mật khẩu riêng và không chia sẻ với người khác."
    >
      <form onSubmit={save}>
        <div className="pt-grid2">
          <div className="pt-field pt-full">
            <label htmlFor="pw-current">Mật khẩu hiện tại</label>
            <input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={form.current_password}
              onChange={(event) => setField("current_password", event.target.value)}
              required
            />
          </div>
          <div className="pt-field">
            <label htmlFor="pw-new">Mật khẩu mới</label>
            <input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.new_password}
              onChange={(event) => setField("new_password", event.target.value)}
              required
            />
          </div>
          <div className="pt-field">
            <label htmlFor="pw-confirm">Xác nhận mật khẩu mới</label>
            <input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={form.confirm_password}
              onChange={(event) => setField("confirm_password", event.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-form-actions">
          <button type="button" className="pt-btn pt-btn--secondary" onClick={reset} disabled={saving}>
            Nhập lại
          </button>
          <button type="submit" className="pt-btn" disabled={saving}>
            {saving ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
