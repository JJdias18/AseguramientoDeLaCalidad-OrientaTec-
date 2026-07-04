import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Tab bar móvil (DESIGN.md §5): fija abajo en <720px, oculta en ≥720px (donde la
 * nav vive arriba). Cuatro destinos para el estudiante; el admin suma "Reactivos"
 * (extensión registrada en DESIGN.md §10). Iconos de trazo en currentColor para
 * que el estado activo herede el jade.
 */

const ICONOS = {
  cuestionario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" strokeLinecap="round" />
    </svg>
  ),
  huella: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M3.5 13.5v5M7 9.5v9M10.5 5.5v13M14 8v10.5M17.5 11v7.5M21 14v4.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  carreras: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2z" strokeLinejoin="round" />
      <path d="M5 21a2 2 0 0 1 2-2h12" strokeLinecap="round" />
    </svg>
  ),
  comparar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="6.5" height="14" rx="1.5" />
      <rect x="14" y="5" width="6.5" height="14" rx="1.5" />
    </svg>
  ),
  reactivos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
    </svg>
  ),
};

const DESTINOS = [
  { to: '/cuestionario', label: 'Cuestionario', icono: ICONOS.cuestionario },
  { to: '/mi-huella', label: 'Mi huella', icono: ICONOS.huella },
  { to: '/carreras', label: 'Carreras', icono: ICONOS.carreras },
  { to: '/comparar', label: 'Comparar', icono: ICONOS.comparar },
];

const DESTINO_ADMIN = { to: '/admin/reactivos', label: 'Reactivos', icono: ICONOS.reactivos };

function TabBar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const destinos = user.role === 'admin' ? [...DESTINOS, DESTINO_ADMIN] : DESTINOS;

  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {destinos.map((destino) => (
        <NavLink
          key={destino.to}
          to={destino.to}
          className={({ isActive }) => `tabbar__item${isActive ? ' tabbar__item--activo' : ''}`}
        >
          {destino.icono}
          {destino.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TabBar;
