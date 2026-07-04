import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/** Rutas solo para visitantes (login/registro): con sesión activa redirige a "/". */
function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
