import { useState } from 'react';
import PropTypes from 'prop-types';

import Huella from './Huella';

/**
 * Área recomendada (HU-03, DESIGN.md §5 / §7.4). Dos presentaciones:
 *
 * - **Card destacada** (top 3): nombre, indicador de afinidad como NÚMERO GRANDE
 *   (separado de la huella para que no compitan), la huella "eco" como identidad del
 *   área, el porqué de la coincidencia y drill-down a las carreras.
 * - **Fila compacta** (`compacta`, áreas 4+): nombre, % y un botón para desplegar las
 *   carreras. Sin huella grande. La lista simple vive dentro del "Ver más áreas afines".
 *
 * El % mostrado es el coseno real del motor; el orden lo decide `recommendationService`.
 */
function AreaAfin({ area, principal = false, compacta = false }) {
  const [abierto, setAbierto] = useState(false);
  const listaId = `area-carreras-${area.id}`;
  const carreraLabel = area.careerCount === 1 ? 'carrera' : 'carreras';

  const carreras = abierto && (
    <ul id={listaId} className="area__carreras">
      {area.careers.map((carrera) => (
        <li key={carrera.id} className="area__carrera">
          <b className="area__carrera-nombre">{carrera.name}</b>
          <span className="area__carrera-meta">
            {carrera.duration} · {carrera.fieldOfWork}
          </span>
        </li>
      ))}
    </ul>
  );

  if (compacta) {
    return (
      <li className="area-mas">
        <div className="area-mas__fila">
          <span className="area-mas__nombre">{area.name}</span>
          <span className="area-mas__pct">{area.affinity} %</span>
          <button
            type="button"
            className="area__link area-mas__link"
            aria-expanded={abierto}
            aria-controls={listaId}
            onClick={() => setAbierto((previo) => !previo)}
          >
            {abierto ? 'Ocultar carreras' : `Ver ${area.careerCount} ${carreraLabel}`}
          </button>
        </div>
        {carreras}
      </li>
    );
  }

  return (
    <li className={`area${principal ? ' area--principal' : ''}`}>
      <div className="area__cabecera">
        <span className="area__nombre">{area.name}</span>
        <span
          className="area__afinidad"
          role="img"
          aria-label={`Afinidad ${area.affinity} por ciento`}
        >
          <span className="area__afinidad-val">
            {area.affinity}
            <small>%</small>
          </span>
          <span className="area__afinidad-cap" aria-hidden="true">
            afinidad
          </span>
        </span>
      </div>

      <div className="ident">
        <span className="ident__rotulo">La huella del área</span>
        <Huella variant="eco" pesos={area.weights} />
      </div>

      <p className="area__porque">{area.explanation}</p>

      <button
        type="button"
        className="area__link"
        aria-expanded={abierto}
        aria-controls={listaId}
        onClick={() => setAbierto((previo) => !previo)}
      >
        {abierto ? 'Ocultar carreras' : `Ver ${area.careerCount} ${carreraLabel} del área`}
      </button>

      {carreras}
    </li>
  );
}

const areaShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  affinity: PropTypes.number.isRequired,
  explanation: PropTypes.string.isRequired,
  weights: PropTypes.objectOf(PropTypes.number).isRequired,
  careerCount: PropTypes.number.isRequired,
  careers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      fieldOfWork: PropTypes.string,
      duration: PropTypes.string,
    })
  ).isRequired,
});

AreaAfin.propTypes = {
  area: areaShape.isRequired,
  principal: PropTypes.bool,
  compacta: PropTypes.bool,
};

export default AreaAfin;
