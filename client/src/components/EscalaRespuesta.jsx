import PropTypes from 'prop-types';

/**
 * Escala 1–5 del cuestionario (DESIGN.md §5). Radiogroup nativo: cada opción es un
 * segmento tocable ≥48px, navegable con las flechas del teclado. Extremos rotulados.
 */
const ETIQUETAS = {
  1: '1 · Nada que ver conmigo',
  5: '5 · Totalmente yo',
};

function EscalaRespuesta({
  name,
  value = undefined,
  onChange,
  min = 1,
  max = 5,
  disabled = false,
}) {
  const opciones = [];
  for (let n = min; n <= max; n += 1) {
    opciones.push(n);
  }

  return (
    <div className="escala" role="radiogroup" aria-label="Elegí del 1 al 5 cuánto te representa">
      <div className="escala__opciones">
        {opciones.map((n) => {
          const opcionId = `${name}-${n}`;
          return (
            <label key={n} className="escala__op" htmlFor={opcionId}>
              <input
                id={opcionId}
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                disabled={disabled}
                aria-label={ETIQUETAS[n] || String(n)}
              />
              <span aria-hidden="true">{n}</span>
            </label>
          );
        })}
      </div>
      <div className="escala__extremos" aria-hidden="true">
        <span>Nada que ver conmigo</span>
        <span>Totalmente yo</span>
      </div>
    </div>
  );
}

EscalaRespuesta.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
};

export default EscalaRespuesta;
