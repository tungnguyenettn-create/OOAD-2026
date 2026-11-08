import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';

// Các trang Patient
import PatientLogin from './pages/patient/Login';
import PatientRegister from './pages/patient/Register';
import PatientDashboard from './pages/patient/PatientDashboard';

// Các trang Doctor
import DoctorLogin from './pages/doctor/Login';
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Các trang Admin
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientsPage from './pages/admin/PatientsPage';
import DoctorsPage from './pages/admin/DoctorsPage';

function App() {
  return (
    <Routes>
      {/* Route gốc chuyển hướng về đăng nhập bệnh nhân */}
      <Route path="/" element={<Navigate to="/patient/login" replace />} />

      {/* Cụm Route Auth (dùng chung AuthLayout) */}
      <Route element={<AuthLayout />}>
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      {/* Cụm Route Dashboard (được bảo vệ) */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      
      {/* Các trang con của Admin (có thể đưa vào nested route sau) */}
      <Route path="/admin/patients" element={
        <ProtectedRoute allowedRole="admin"><PatientsPage /></ProtectedRoute>
      } />
      <Route path="/admin/doctors" element={
        <ProtectedRoute allowedRole="admin"><DoctorsPage /></ProtectedRoute>
      } />

      {/* URL lạ -> về đăng nhập */}
      <Route path="*" element={<Navigate to="/patient/login" replace />} />
    </Routes>
  );
}

export default App;