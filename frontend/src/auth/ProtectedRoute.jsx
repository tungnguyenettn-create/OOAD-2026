import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getTokenPayload } from './jwt';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, role, logout } = useContext(AuthContext);

  // Thiếu token hoặc sai vai trò cổng
  if (!token || role !== allowedRole) {
    return <Navigate to={`/${allowedRole}/login`} replace />;
  }

  // Kiểm tra thời hạn token (exp)
  const payload = getTokenPayload(token);
  if (!payload || payload.exp * 1000 < Date.now()) {
    logout();
    return null; 
  }

  return children;
};

export default ProtectedRoute;