import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/questionnaireService';
import { DIMENSIONES, PUNTAJE_MAXIMO, nombrePorTipo } from '../utils/riasec';
import Huella from '../components/Huella';

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

/** aria-label de la huella hero: los seis valores y la dimensión más alta. */
const descripcionHuella = (scores, dominante) =>
  `Tu huella vocacional. ${DIMENSIONES.map(
    (dimension) => `${dimension.nombre} ${scores[dimension.type]} de ${PUNTAJE_MAXIMO}`
  ).join(', ')}. Tu dimensión más alta es ${nombrePorTipo(dominante)}.`;

function ResultadoPage() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | vacio | error | listo
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let activo = true;
    getProfile(token)
      .then((data) => {
        if (!activo) return;
        setProfile(data.profile);
        setStatus('listo');
      })
      .catch((error) => {
        if (!activo) return;
        setStatus(error.code === 'PROFILE_NOT_FOUND' ? 'vacio' : 'error');
      });
    return () => {
      activo = false;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="pagina">
        <p className="sub">Cargando tu huella…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pagina">
        <div className="panel panel--error" role="alert">
          <b>No pudimos cargar tu huella.</b> Actualizá la página o intentá más tarde.
        </div>
      </div>
    );
  }

  if (status === 'vacio') {
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
        <p className="sub">Respondé el cuestionario de 30 preguntas para descubrir tu perfil.</p>
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

  const { scores, hollandCode, dominant, createdAt } = profile;
  const fracciones = DIMENSIONES.reduce(
    (acc, dimension) => ({ ...acc, [dimension.type]: scores[dimension.type] / PUNTAJE_MAXIMO }),
    {}
  );
  const dominantes = new Set(dominant);

  return (
    <div className="pagina resultado">
      <p className="sub">Tu perfil · {fechaLarga(createdAt)}</p>
      <h1>Esta huella es solo tuya</h1>
      <p className="sub" style={{ marginTop: 'var(--esp-3)' }}>
        Nadie mezcla los seis intereses igual que vos. Así se ve tu combinación.
      </p>

      <div style={{ margin: 'var(--esp-6) 0' }}>
        <Huella
          variant="hero"
          fracciones={fracciones}
          ariaLabel={descripcionHuella(scores, dominant[0])}
        />
      </div>

      <ul className="leyenda">
        {DIMENSIONES.map((dimension) => (
          <li key={dimension.type} className="leyenda__item">
            <span className={`leyenda__punto ${dimension.clase}`} aria-hidden="true" />
            <span className="leyenda__nombre">
              {dominantes.has(dimension.type) && (
                <span className="leyenda__dominante" aria-hidden="true">
                  ●{' '}
                </span>
              )}
              <b>{dimension.nombre}</b>
              {dominantes.has(dimension.type) && (
                <span className="sr-only"> (dimensión destacada)</span>
              )}
            </span>
            <span className="leyenda__valor">
              {scores[dimension.type]} / {PUNTAJE_MAXIMO}
            </span>
          </li>
        ))}
      </ul>

      <div className="panel" style={{ marginTop: 'var(--esp-6)' }}>
        <h2 style={{ marginBottom: 'var(--esp-2)' }}>Tu código Holland: {hollandCode}</h2>
        <p>
          Tus dimensiones predominantes son <b>{nombrePorTipo(dominant[0])}</b> y{' '}
          <b>{nombrePorTipo(dominant[1])}</b>. En la próxima etapa vas a ver las áreas académicas
          que más coinciden con tu huella.
        </p>
      </div>

      <Link
        className="btn btn--secundario"
        to="/cuestionario"
        style={{ display: 'inline-block', marginTop: 'var(--esp-6)' }}
      >
        Repetir el cuestionario
      </Link>
    </div>
  );
}

export default ResultadoPage;
