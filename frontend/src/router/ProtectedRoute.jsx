import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '../constants/appConfig.js';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;