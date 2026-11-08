import { UserRound } from "lucide-react";
import { genderLabel, statusLabel } from "../../utils/patientHelpers";

function Info({ label, value }) {
  return (
    <div>
      <div className="pd-info-label">{label}</div>
      <strong>{value || "Chưa cập nhật"}</strong>
    </div>
  );
}

export default function PatientInfoCard({ patient }) {
  return (
    <section className="pd-card">
      <div className="pd-section-title">
        <UserRound size={26} />
        <h2>{patient?.full_name || "Hồ sơ bệnh nhân"}</h2>
      </div>

      <div className="pd-info-grid">
        <Info label="Mã bệnh nhân" value={patient?.patient_code} />
        <Info label="Ngày sinh" value={patient?.date_of_birth} />
        <Info label="Giới tính" value={genderLabel(patient?.gender)} />
        <Info label="Email" value={patient?.email} />
        <Info label="Số điện thoại" value={patient?.phone} />
        <Info label="Địa chỉ" value={patient?.address} />
        <Info label="Tình trạng" value={statusLabel(patient?.status)} />
      </div>
    </section>
  );
}