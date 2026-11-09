import { useState } from "react";
import "./PatientDashboard.css";

import PatientLayout from "../../layouts/PatientLayout";
import useApi from "../../hooks/useApi";
import useToast from "../../hooks/useToast";
import usePatientData from "../../hooks/usePatientData";
import useCancelAppointment from "../../hooks/useCancelAppointment";
import useBooking from "../../hooks/useBooking";
import useNotifications from "../../hooks/useNotifications";
import usePatientProfile from "../../hooks/usePatientProfile";
import useHealthMetrics from "../../hooks/useHealthMetrics";
import useRecordDocuments from "../../hooks/useRecordDocuments";
import usePasswordChange from "../../hooks/usePasswordChange";
import useResource from "../../hooks/useResource";
import { API_PRESCRIPTIONS } from "../../utils/constants";

import StateMessage from "../../components/patient/StateMessage";
import Toast from "../../components/patient/Toast";
import AppointmentsView from "./views/AppointmentsView";
import BookView from "./views/BookView";
import RecordsView from "./views/RecordsView";
import PrescriptionsView from "./views/PrescriptionsView";
import MetricsView from "./views/MetricsView";
import NotificationsView from "./views/NotificationsView";
import ProfileView from "./views/ProfileView";

export default function PatientDashboard() {
  const { token, logout, request } = useApi();
  const { toast, notify } = useToast();
  const [activePage, setActivePage] = useState("appointments");

  const data = usePatientData({ token, request });
  const { patient, appointments, records, specializations, doctorMap } = data;

  const notifications = useNotifications({
    patientId: patient?.id,
    appointments: appointments.items,
    records: records.items,
    doctorMap,
  });

  const { cancelingId, cancelAppointment } = useCancelAppointment({
    request,
    reload: appointments.load,
    notify,
  });

  function navigate(pageId) {
    if (pageId === "prescriptions") prescriptions.load();
    if (pageId === "metrics") metrics.load();
    setActivePage(pageId);
    window.scrollTo(0, 0);
  }

  const booking = useBooking({
    request,
    specializations: specializations.items,
    appointments: appointments.items,
    reload: appointments.load,
    notify,
    onBooked: () => navigate("appointments"),
  });

  const profile = usePatientProfile({ request, patient, setPatient: data.setPatient, notify });
  const prescriptions = useResource(request, API_PRESCRIPTIONS, {
    errorMessage: "Không thể tải đơn thuốc.",
    invalidMessage: "Dữ liệu đơn thuốc không hợp lệ.",
  });
  const metrics = useHealthMetrics({ request, notify });
  const documents = useRecordDocuments({ request, token, notify });
  const password = usePasswordChange({ request, notify });

  function renderPage() {
    if (data.patientLoading && !patient) return <StateMessage message="Đang tải dữ liệu..." />;

    if (data.patientError && !patient) {
      return (
        <StateMessage
          variant="error"
          message={data.patientError}
          action={
            <button type="button" className="pt-btn pt-btn--secondary pt-btn--sm" onClick={data.reloadPatient}>
              Thử lại
            </button>
          }
        />
      );
    }

    switch (activePage) {
      case "book":
        return <BookView
            patient={patient}
            booking={booking}
            specializationsState={specializations}
            onCancel={() => navigate("appointments")}
          />;
      case "records":
        return <RecordsView records={records} documents={documents} />;
      case "prescriptions":
        return <PrescriptionsView prescriptions={prescriptions} />;
      case "metrics":
        return <MetricsView metrics={metrics} />;
      case "notifications":
        return <NotificationsView notifications={notifications} />;
      case "profile":
        return <ProfileView patient={patient} profile={profile} password={password} />;
      default:
        return (
          <AppointmentsView
            patient={patient}
            appointments={appointments}
            doctorMap={doctorMap}
            cancelingId={cancelingId}
            onCancel={cancelAppointment}
            onNavigate={navigate}
          />
        );
    }
  }

  return (
    <PatientLayout
      activePage={activePage}
      onNavigate={navigate}
      onLogout={logout}
      patient={patient}
      unreadCount={notifications.unreadCount}
    >
      {renderPage()}
      <Toast toast={toast} />
    </PatientLayout>
  );
}
