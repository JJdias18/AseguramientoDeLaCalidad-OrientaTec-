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
        <button
          type="button"
          className="nav__avatar"
          aria-label={`Cerrar sesión de ${user.fullName}`}
          onClick={logout}
        >
          {initials(user.fullName)}
        </button>
      )}
    </header>
  );
}

export default AppHeader;
