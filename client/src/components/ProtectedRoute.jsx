import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="sub">Cargando…</p>;
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
