import Panel from "./Panel";
import { PROFILE_FIELDS } from "../../utils/patientConstants";
import { statusLabel } from "../../utils/patientHelpers";

export default function ProfileForm({ patient, profile }) {
  const { form, setField, saving, save, reset } = profile;

  return (
    <Panel className="pt-form-card">
      <form onSubmit={save}>
        <div className="pt-grid2">
          <div className="pt-field">
            <label>Mã bệnh nhân</label>
            <input value={patient?.patient_code || "—"} disabled readOnly />
          </div>
          <div className="pt-field">
            <label>Tình trạng</label>
            <input value={statusLabel(patient?.status) || "—"} disabled readOnly />
          </div>

          {PROFILE_FIELDS.map((f) => (
            <div key={f.name} className={`pt-field ${f.full ? "pt-full" : ""}`}>
              <label htmlFor={`pf-${f.name}`}>{f.label}</label>
              {f.type === "select" ? (
                <select id={`pf-${f.name}`} value={form[f.name]} onChange={(e) => setField(f.name, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`pf-${f.name}`}
                  type={f.type}
                  required={f.required}
                  value={form[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="pt-form-actions">
          <button type="button" className="pt-btn pt-btn--secondary" onClick={reset} disabled={saving}>
            Khôi phục
          </button>
          <button type="submit" className="pt-btn" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
