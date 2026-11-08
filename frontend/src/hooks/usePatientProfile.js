import { useEffect, useState } from "react";
import { API_PATIENTS } from "../utils/constants";
import { PROFILE_FIELDS, PROFILE_UPDATE_METHOD } from "../utils/patientConstants";

function toForm(patient) {
  return Object.fromEntries(
    PROFILE_FIELDS.map((f) => {
      const raw = patient?.[f.name] ?? "";
      return [f.name, f.type === "date" ? String(raw).slice(0, 10) : raw];
    })
  );
}

export default function usePatientProfile({ request, patient, setPatient, notify }) {
  const [form, setForm] = useState(() => toForm(patient));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(toForm(patient));
  }, [patient]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  function reset() {
    setForm(toForm(patient));
    notify("Đã khôi phục");
  }

  async function save(event) {
    event?.preventDefault();
    if (!patient) return;
    if (!String(form.full_name).trim()) return notify("Vui lòng nhập họ và tên", "error");

    const payload = Object.fromEntries(
      PROFILE_FIELDS.map((f) => {
        const value = typeof form[f.name] === "string" ? form[f.name].trim() : form[f.name];
        return [f.name, value === "" && !f.required ? null : value];
      })
    );

    setSaving(true);
    try {
      const data = await request(`${API_PATIENTS}/${patient.id}`, {
        method: PROFILE_UPDATE_METHOD,
        body: JSON.stringify(payload),
      });
      setPatient({ ...patient, ...payload, ...(data && data.id ? data : {}) });
      notify("Đã lưu thông tin cá nhân");
    } catch (e) {
      notify(e.message || "Không thể lưu thông tin cá nhân.", "error");
    } finally {
      setSaving(false);
    }
  }

  return { form, setField, saving, save, reset };
}
