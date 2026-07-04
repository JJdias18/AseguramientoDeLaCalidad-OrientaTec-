import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getCareers } from '../services/careerService';

const BUSQUEDA_DEBOUNCE_MS = 300;

/** Áreas presentes en el catálogo completo, para los chips de filtro (sin endpoint aparte). */
const areasUnicas = (careers) => {
  const vistos = new Map();
  careers.forEach((career) => {
    if (!vistos.has(career.area.id)) {
      vistos.set(career.area.id, career.area);
    }
  });
  return [...vistos.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
};

function CarrerasPage() {
  const { token } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | error | listo
  const [careers, setCareers] = useState([]);
  const [areasDisponibles, setAreasDisponibles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);

  useEffect(() => {
    let activo = true;
    setStatus('loading');

    const timeoutId = setTimeout(() => {
      getCareers(token, { search: busqueda, area: areaSeleccionada })
        .then((data) => {
          if (!activo) return;
          setCareers(data.careers);
          if (!busqueda && !areaSeleccionada) {
            setAreasDisponibles(areasUnicas(data.careers));
          }
          setStatus('listo');
        })
        .catch(() => activo && setStatus('error'));
    }, BUSQUEDA_DEBOUNCE_MS);

    return () => {
      activo = false;
      clearTimeout(timeoutId);
    };
  }, [token, busqueda, areaSeleccionada]);

  const sinResultados = status === 'listo' && careers.length === 0;

  const limpiarFiltros = () => {
    setBusqueda('');
    setAreaSeleccionada(null);
  };

  const esqueletos = useMemo(() => [1, 2, 3], []);

  return (
    <div className="pagina">
      <h1>Carreras</h1>
      <p className="sub" style={{ marginTop: 'var(--esp-2)' }}>
        Explorá el catálogo completo y consultá la ficha de cada carrera.
      </p>

      <div className="campo" style={{ marginTop: 'var(--esp-5)' }}>
        <label htmlFor="buscar-carrera">Buscá una carrera</label>
        <input
          id="buscar-carrera"
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Ej. Ingeniería, Biología…"
        />
      </div>

      {areasDisponibles.length > 0 && (
        <div className="chips" role="group" aria-label="Filtrar por área">
          <button
            type="button"
            className={`chip${areaSeleccionada === null ? ' chip--activo' : ''}`}
            aria-pressed={areaSeleccionada === null}
            onClick={() => setAreaSeleccionada(null)}
          >
            Todas
          </button>
          {areasDisponibles.map((area) => (
            <button
              key={area.id}
              type="button"
              className={`chip${areaSeleccionada === area.id ? ' chip--activo' : ''}`}
              aria-pressed={areaSeleccionada === area.id}
              onClick={() => setAreaSeleccionada(area.id)}
            >
              {area.name}
            </button>
          ))}
        </div>
      )}

      {status === 'loading' && (
        <ul className="carreras" aria-hidden="true">
          {esqueletos.map((n) => (
            <li key={n} className="carrera carrera--esqueleto cargando">
              <i />
              <i />
              <i />
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <div className="panel panel--error" role="alert" style={{ marginTop: 'var(--esp-5)' }}>
          <b>No pudimos cargar las carreras.</b> Actualizá la página o intentá más tarde.
        </div>
      )}

      {sinResultados && (
        <div className="panel" role="status" style={{ marginTop: 'var(--esp-5)' }}>
          <p>
            {busqueda ? (
              <>
                No se encontraron carreras para «{busqueda}». Probá con otro nombre o quitá el
                filtro.
              </>
            ) : (
              'No se encontraron carreras con este filtro.'
            )}
          </p>
          <button
            type="button"
            className="enlace"
            onClick={limpiarFiltros}
            style={{ marginTop: 'var(--esp-2)' }}
          >
            Quitar filtros
          </button>
        </div>
      )}

      {status === 'listo' && careers.length > 0 && (
        <ul className="carreras">
          {careers.map((career) => (
            <li key={career.id}>
              <Link to={`/carreras/${career.id}`} className="carrera">
                <span className="carrera__nombre">{career.name}</span>
                <span className="carrera__area">
                  <span
                    className={`carrera__punto t-${career.area.dominantType.toLowerCase()}`}
                    aria-hidden="true"
                  />
                  {career.area.name}
                </span>
                <span className="carrera__meta">
                  {career.duration} · {career.fieldOfWork}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CarrerasPage;
