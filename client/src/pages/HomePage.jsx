import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="pagina">
      <p className="sub">Hola, {user.fullName}</p>
      <h1>Aún no tenés tu huella</h1>
      <div
        className="huella huella--vacia"
        role="img"
        aria-label="Todavía no respondiste el cuestionario vocacional."
        style={{ maxWidth: '24rem', margin: 'var(--esp-5) 0' }}
      >
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <p className="sub">
        Respondé el cuestionario de 30 preguntas para descubrir tu perfil vocacional.
      </p>
      <Link
        className="btn btn--primario"
        to="/cuestionario"
        style={{ display: 'inline-block', marginTop: 'var(--esp-5)' }}
      >
        Empezar cuestionario
      </Link>
    </div>
  );
}

export default HomePage;
