import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenPayload } from './jwt'; // Di chuyển từ utils/jwt.js vào auth/

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(sessionStorage.getItem('access_token'));
  const [role, setRole] = useState(sessionStorage.getItem('user_role'));

  const login = useCallback((newToken, newRole) => {
    sessionStorage.setItem('access_token', newToken);
    sessionStorage.setItem('user_role', newRole);
    setToken(newToken);
    setRole(newRole);
    navigate(`/${newRole}/dashboard`, { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    const currentRole = role || 'patient';
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_role');
    setToken(null);
    setRole(null);
    navigate(`/${currentRole}/login`, { replace: true });
  }, [navigate, role]);

  const value = useMemo(() => ({ token, role, login, logout }), [token, role, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};