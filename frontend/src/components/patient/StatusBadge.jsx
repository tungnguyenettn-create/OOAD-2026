import { appointmentStatusLabel, appointmentTone } from "../../utils/patientHelpers";

export default function StatusBadge({ status }) {
  return <span className={`pt-status pt-status--${appointmentTone(status)}`}>{appointmentStatusLabel(status)}</span>;
}
