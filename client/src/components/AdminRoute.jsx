import { Link, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Anidada dentro de `ProtectedRoute`: sin sesión ya se redirigió a login. Acá solo
 * falta distinguir admin de estudiante (DESIGN.md §7.8: "Acceso denegado" con
 * enlace a inicio, no un redirect silencioso).
 */
function AdminRoute() {
  const { user } = useAuth();

  if (user.role !== 'admin') {
    return (
      <div className="pagina">
        <h1>Acceso denegado</h1>
        <p className="sub">No tenés permiso para ver esta sección.</p>
        <Link
          className="btn btn--primario"
          to="/"
          style={{ display: 'inline-block', marginTop: 'var(--esp-5)' }}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return <Outlet />;
}

export default AdminRoute;
