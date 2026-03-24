import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.length || allowedRoles.includes(user?.role)) {
    return children;
  }
  return <Navigate to="/forbidden" replace />;
};

export default RoleGuard;