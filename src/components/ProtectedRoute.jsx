import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && storedUser?.role !== 'admin') {
    return <Navigate to={storedUser?.role === 'user' ? '/dashboard' : '/'} replace />;
  }

  if (userOnly && storedUser?.role !== 'user') {
    return <Navigate to={storedUser?.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
