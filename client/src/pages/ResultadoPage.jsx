import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getRecommendations, getProfileReportBlob } from '../services/questionnaireService';
import { DIMENSIONES, PUNTAJE_MAXIMO, nombrePorTipo } from '../utils/riasec';
import Huella from '../components/Huella';
import AreaAfin from '../components/AreaAfin';

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Cuántas áreas se muestran como cards destacadas; el resto va colapsado. */
const TOP_DESTACADAS = 3;

/** aria-label de la huella hero: los seis valores y la dimensión más alta. */
const descripcionHuella = (scores, dominante) =>
  `Tu huella vocacional. ${DIMENSIONES.map(
    (dimension) => `${dimension.nombre} ${scores[dimension.type]} de ${PUNTAJE_MAXIMO}`
  ).join(', ')}. Tu dimensión más alta es ${nombrePorTipo(dominante)}.`;

function ResultadoPage() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | vacio | error | listo
  const [profile, setProfile] = useState(null);
  const [areas, setAreas] = useState([]);
  const [descargando, setDescargando] = useState(false);
  const [errorReporte, setErrorReporte] = useState(false);

  const descargarReporte = async () => {
    setDescargando(true);
    setErrorReporte(false);
    try {
      const blob = await getProfileReportBlob(token);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'perfil-vocacional.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorReporte(true);
    } finally {
      setDescargando(false);
    }
  };

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
        setAreas(data.recommendations);
        setStatus('listo');
      })
      .catch(() => {
        if (!activo) return;
        setStatus('error');
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

        <div style={{ marginTop: 'var(--esp-4)' }}>
          <button type="button" className="btn btn--secundario" disabled>
            Descargar reporte (PDF)
          </button>
          <p className="sub ayuda-comparar">
            Completá el cuestionario para poder descargar tu reporte en PDF.
          </p>
        </div>
      </div>
    );
  }

  const { scores, hollandCode, dominant, createdAt } = profile;
  const fracciones = DIMENSIONES.reduce(
    (acc, dimension) => ({ ...acc, [dimension.type]: scores[dimension.type] / PUNTAJE_MAXIMO }),
    {}
  );
  const dominantes = new Set(dominant);
  const destacadas = areas.slice(0, TOP_DESTACADAS);
  const resto = areas.slice(TOP_DESTACADAS);

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
          <b>{nombrePorTipo(dominant[1])}</b>. Estas son las áreas académicas que más coinciden con
          tu huella.
        </p>
      </div>

      <section aria-labelledby="areas-titulo" style={{ marginTop: 'var(--esp-7)' }}>
        <h2 id="areas-titulo">Tus áreas más afines</h2>
        <p className="sub" style={{ marginTop: 'var(--esp-2)' }}>
          Comparamos tu huella con la de cada área académica. Cuanto más se parecen, más alta la
          afinidad.
        </p>
        <ol className="areas">
          {destacadas.map((area, indice) => (
            <AreaAfin key={area.id} area={area} principal={indice === 0} />
          ))}
        </ol>

        {resto.length > 0 && (
          <details className="areas-mas">
            <summary className="areas-mas__toggle">
              <span className="areas-mas__chevron" aria-hidden="true">
                ›
              </span>
              Ver más áreas afines ({resto.length})
            </summary>
            <ol className="areas-mas__lista">
              {resto.map((area) => (
                <AreaAfin key={area.id} area={area} compacta />
              ))}
            </ol>
          </details>
        )}
      </section>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--esp-4)',
          marginTop: 'var(--esp-7)',
        }}
      >
        <Link className="btn btn--secundario" to="/cuestionario">
          Repetir el cuestionario
        </Link>
        <button
          type="button"
          className="btn btn--secundario"
          onClick={descargarReporte}
          disabled={descargando}
        >
          {descargando ? 'Generando…' : 'Descargar reporte (PDF)'}
        </button>
      </div>
      {errorReporte && (
        <p className="sub ayuda-comparar" role="alert">
          No pudimos generar el reporte. Intentá de nuevo.
        </p>
      )}
    </div>
  );
}

export default ResultadoPage;
