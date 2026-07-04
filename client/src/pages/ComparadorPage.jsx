import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getCareers, compareCareers } from '../services/careerService';

/** Atributos comparables de HU-05: Área, Duración, Campo laboral y Perfil. */
const ATRIBUTOS = [
  { clave: 'area', etiqueta: 'Área', valor: (career) => career.area.name },
  { clave: 'duration', etiqueta: 'Duración', valor: (career) => career.duration },
  { clave: 'fieldOfWork', etiqueta: 'Campo laboral', valor: (career) => career.fieldOfWork },
  { clave: 'profileDesc', etiqueta: 'Perfil', valor: (career) => career.profileDesc },
];

function ComparadorPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  const [estadoCatalogo, setEstadoCatalogo] = useState('cargando'); // cargando | listo | error
  const [catalogo, setCatalogo] = useState([]);

  const [careerAId, setCareerAId] = useState(searchParams.get('a') || '');
  const [careerBId, setCareerBId] = useState('');

  const [intentado, setIntentado] = useState(false);
  const [estado, setEstado] = useState('inicial'); // inicial | cargando | listo | error
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let activo = true;
    getCareers(token, {})
      .then((data) => {
        if (!activo) return;
        setCatalogo(data.careers);
        setEstadoCatalogo('listo');
      })
      .catch(() => activo && setEstadoCatalogo('error'));
    return () => {
      activo = false;
    };
  }, [token]);

  const mismaCarrera = Boolean(careerAId) && careerAId === careerBId;
  const faltaSeleccion = !careerAId || !careerBId;
  const puedeComparar = !faltaSeleccion && !mismaCarrera;

  useEffect(() => {
    if (!intentado || !puedeComparar) return undefined;
    let activo = true;
    setEstado('cargando');
    compareCareers(token, { a: careerAId, b: careerBId })
      .then((data) => {
        if (!activo) return;
        setResultado(data.careers);
        setEstado('listo');
      })
      .catch(() => activo && setEstado('error'));
    return () => {
      activo = false;
    };
  }, [intentado, puedeComparar, careerAId, careerBId, token]);

  return (
    <div className="pagina">
      <h1>Comparar carreras</h1>
      <p className="sub" style={{ marginTop: 'var(--esp-2)' }}>
        Elegí dos carreras distintas para ver sus atributos lado a lado.
      </p>

      {estadoCatalogo === 'cargando' && (
        <p className="sub" style={{ marginTop: 'var(--esp-5)' }}>
          Cargando el catálogo…
        </p>
      )}

      {estadoCatalogo === 'error' && (
        <div className="panel panel--error" role="alert" style={{ marginTop: 'var(--esp-5)' }}>
          <b>No pudimos cargar el catálogo.</b> Actualizá la página o intentá más tarde.
        </div>
      )}

      {estadoCatalogo === 'listo' && (
        <>
          <div className="comparador__selects" style={{ marginTop: 'var(--esp-5)' }}>
            <div className="campo">
              <label htmlFor="carrera-a">Carrera A</label>
              <select
                id="carrera-a"
                value={careerAId}
                onChange={(event) => setCareerAId(event.target.value)}
              >
                <option value="">Elegí una carrera</option>
                {catalogo.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={`campo${mismaCarrera ? ' campo--error' : ''}`}>
              <label htmlFor="carrera-b">Carrera B</label>
              <select
                id="carrera-b"
                value={careerBId}
                onChange={(event) => setCareerBId(event.target.value)}
              >
                <option value="">Elegí una carrera</option>
                {catalogo.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </select>
              {mismaCarrera && (
                <p className="mensaje">
                  Elegiste la misma carrera dos veces. Cambiá una para poder comparar.
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'var(--esp-4)' }}>
            <button
              type="button"
              className="btn btn--primario"
              disabled={!puedeComparar}
              onClick={() => setIntentado(true)}
            >
              Comparar
            </button>
            {faltaSeleccion && (
              <p className="sub ayuda-comparar">Seleccioná las dos carreras para comparar.</p>
            )}
          </div>

          {estado === 'cargando' && (
            <p className="sub" style={{ marginTop: 'var(--esp-5)' }}>
              Comparando…
            </p>
          )}

          {estado === 'error' && puedeComparar && (
            <div className="panel panel--error" role="alert" style={{ marginTop: 'var(--esp-5)' }}>
              <b>No pudimos comparar esas carreras.</b> Actualizá la página o intentá más tarde.
            </div>
          )}

          {estado === 'listo' && puedeComparar && resultado && (
            <table className="tabla-comparar" style={{ marginTop: 'var(--esp-5)' }}>
              <thead>
                <tr>
                  <th scope="col">Atributo</th>
                  <th scope="col">{resultado[0].name}</th>
                  <th scope="col">{resultado[1].name}</th>
                </tr>
              </thead>
              <tbody>
                {ATRIBUTOS.map((atributo) => (
                  <tr key={atributo.clave}>
                    <th scope="row">{atributo.etiqueta}</th>
                    <td data-carrera={resultado[0].name}>{atributo.valor(resultado[0])}</td>
                    <td data-carrera={resultado[1].name}>{atributo.valor(resultado[1])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default ComparadorPage;
