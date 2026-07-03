import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const initials = (fullName) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <Link className="nav__logo" to="/">
        <span className="huella-mini" aria-hidden="true">
          <i className="t-r" />
          <i className="t-i" />
          <i className="t-a" />
          <i className="t-s" />
          <i className="t-e" />
          <i className="t-c" />
        </span>
        Brújula
      </Link>
      {user && (
        <div className="nav__cuenta">
          <Link
            className="nav__avatar"
            to="/mi-huella"
            aria-label={`Mi huella de ${user.fullName}`}
          >
            {initials(user.fullName)}
          </Link>
          <button type="button" className="enlace" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
