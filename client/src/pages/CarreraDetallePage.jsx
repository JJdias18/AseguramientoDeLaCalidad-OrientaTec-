import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { getCareer } from '../services/careerService';
import Huella from '../components/Huella';

function CarreraDetallePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | error | notFound | listo
  const [career, setCareer] = useState(null);

  useEffect(() => {
    let activo = true;
    setStatus('loading');
    getCareer(token, id)
      .then((data) => {
        if (!activo) return;
        setCareer(data.career);
        setStatus('listo');
      })
      .catch((error) => {
        if (!activo) return;
        setStatus(error.status === 404 ? 'notFound' : 'error');
      });
    return () => {
      activo = false;
    };
  }, [token, id]);

  const volver = (
    <Link className="enlace" to="/carreras">
      ← Volver al catálogo
    </Link>
  );

  if (status === 'loading') {
    return (
      <div className="pagina estrecha">
        <p className="sub">Cargando la ficha…</p>
      </div>
    );
  }

  if (status === 'notFound') {
    return (
      <div className="pagina estrecha">
        <div className="panel panel--error" role="alert">
          <b>No encontramos esa carrera.</b>
        </div>
        <div style={{ marginTop: 'var(--esp-4)' }}>{volver}</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="pagina estrecha">
        <div className="panel panel--error" role="alert">
          <b>No pudimos cargar la ficha.</b> Actualizá la página o intentá más tarde.
        </div>
        <div style={{ marginTop: 'var(--esp-4)' }}>{volver}</div>
      </div>
    );
  }

  const { name, duration, fieldOfWork, description, profileDesc, area } = career;

  return (
    <div className="pagina estrecha">
      {volver}
      <h1 style={{ marginTop: 'var(--esp-4)' }}>{name}</h1>
      <p className="sub carrera__area" style={{ marginTop: 'var(--esp-2)' }}>
        <span
          className={`carrera__punto t-${area.dominantType.toLowerCase()}`}
          aria-hidden="true"
        />
        {area.name} · {duration}
      </p>

      <div className="ident" style={{ margin: 'var(--esp-5) 0' }}>
        <span className="ident__rotulo">La huella del área</span>
        <Huella variant="eco" pesos={area.weights} />
      </div>

      <section style={{ marginTop: 'var(--esp-5)' }}>
        <h2>Descripción</h2>
        <p style={{ marginTop: 'var(--esp-2)' }}>{description}</p>
      </section>

      <section style={{ marginTop: 'var(--esp-5)' }}>
        <h2>Campo laboral</h2>
        <p style={{ marginTop: 'var(--esp-2)' }}>{fieldOfWork}</p>
      </section>

      <section style={{ marginTop: 'var(--esp-5)' }}>
        <h2>Perfil del estudiante</h2>
        <p style={{ marginTop: 'var(--esp-2)' }}>{profileDesc}</p>
      </section>

      <Link
        className="btn btn--secundario"
        to={`/comparar?a=${id}`}
        style={{ marginTop: 'var(--esp-6)', display: 'inline-block' }}
      >
        Comparar esta carrera
      </Link>
    </div>
  );
}

export default CarreraDetallePage;
