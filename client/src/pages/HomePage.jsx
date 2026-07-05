import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getRecommendations } from '../services/questionnaireService';
import { DIMENSIONES, PUNTAJE_MAXIMO, nombrePorTipo } from '../utils/riasec';
import Huella from '../components/Huella';

function HomePage() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | vacio | error | listo
  const [profile, setProfile] = useState(null);
  const [areaTop, setAreaTop] = useState(null);

  useEffect(() => {
    let activo = true;
    getRecommendations(token)
      .then((data) => {
        if (!activo) return;
        if (!data.hasProfile) {
          setStatus('vacio');
          return;
        }
        setProfile(data.profile);
        setAreaTop(data.recommendations[0] ?? null);
        setStatus('listo');
      })
      .catch(() => activo && setStatus('error'));
    return () => {
      activo = false;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="pagina">
        <p className="sub">Cargando…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pagina">
        <p className="sub">Hola, {user.fullName}</p>
        <div className="panel panel--error" role="alert" style={{ marginTop: 'var(--esp-5)' }}>
          <b>No pudimos cargar tu información.</b> Actualizá la página o intentá más tarde.
        </div>
      </div>
    );
  }

  if (status === 'listo') {
    const fracciones = DIMENSIONES.reduce(
      (acc, dimension) => ({
        ...acc,
        [dimension.type]: profile.scores[dimension.type] / PUNTAJE_MAXIMO,
      }),
      {}
    );

    return (
      <>
        <div className="pagina">
          <p className="sub">Hola, {user.fullName}</p>
          <h1>Tu huella está lista</h1>
          <div className="huella-cascada" style={{ maxWidth: '24rem', margin: 'var(--esp-5) 0' }}>
            <Huella
              variant="hero"
              fracciones={fracciones}
              ariaLabel={`Tu huella vocacional. Código Holland ${profile.hollandCode}; tu dimensión más alta es ${nombrePorTipo(profile.dominant[0])}.`}
            />
          </div>
          <div className="panel" style={{ marginBottom: 'var(--esp-5)' }}>
            <p>
              Tu código Holland es <b>{profile.hollandCode}</b>
              {areaTop && (
                <>
                  {' '}
                  y tu área más afín es <b>{areaTop.name}</b> ({areaTop.affinity}% de afinidad)
                </>
              )}
              .
            </p>
          </div>
          <Link className="btn btn--primario" to="/mi-huella" style={{ display: 'inline-block' }}>
            Ver mi huella
          </Link>
        </div>
        <section className="inicio-manifiesto" aria-labelledby="inicio-manifiesto-titulo">
          <div className="inicio-manifiesto__huella" aria-hidden="true">
            <i className="t-r" />
            <i className="t-i" />
            <i className="t-a" />
            <i className="t-s" />
            <i className="t-e" />
            <i className="t-c" />
          </div>
          <div className="inicio-manifiesto__texto">
            <h2 id="inicio-manifiesto-titulo">Nadie decide como vos</h2>
            <p className="inicio-manifiesto__pull">
              Brújula Vocacional convierte tus respuestas en un mapa: seis dimensiones, combinadas a
              tu manera, que muestran qué estudiar tiene sentido para vos.
            </p>
            <p className="sub">
              Es para estudiantes de colegio en Costa Rica que están por elegir carrera. Respondés
              un cuestionario breve, ves tu perfil vocacional, explorás las áreas académicas más
              afines y comparás carreras — sin apuro, y podés volver cuando querás.
            </p>
          </div>
        </section>
      </>
    );
  }

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
