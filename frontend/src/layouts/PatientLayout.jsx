import PatientSidebar from "../components/patient/PatientSidebar";
import PatientHeader from "../components/patient/PatientHeader";

export default function PatientLayout({ activePage, onNavigate, onLogout, patient, unreadCount, children }) {
  return (
    <div className="pt-layout">
      <PatientSidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        patient={patient}
        unreadCount={unreadCount}
      />

      <main className="pt-main">
        <PatientHeader unreadCount={unreadCount} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="pt-content">
          {children}
          <footer className="pt-footer">
            © {new Date().getFullYear()} Patient Portal · Hospital Management System
          </footer>
        </div>
      </main>
    </div>
  );
}
