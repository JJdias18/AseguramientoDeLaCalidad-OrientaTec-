import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="pagina">
      <h1>Página no encontrada</h1>
      <p className="sub">La página que buscás no existe o se movió.</p>
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

export default NotFoundPage;
