import PropTypes from 'prop-types';

import { DIMENSIONES } from '../utils/riasec';

/**
 * La huella: seis bandas en orden fijo R-I-A-S-E-C (DESIGN.md §4). Cada banda se
 * llena (scaleY) según `fracciones[type]` (0–1).
 *
 * - `variant="progreso"`: 12px, decorativa (aria-hidden); el contador textual
 *   "Pregunta X de N" comunica el avance. Se va formando al responder.
 * - `variant="hero"`: 112px, informativa; lleva role="img" + aria-label con los
 *   seis valores (el momento de revelación del resultado).
 */
function Huella({ variant, fracciones, ariaLabel = undefined }) {
  const esHero = variant === 'hero';

  return (
    <div
      className={`huella huella--${variant}`}
      role={esHero ? 'img' : undefined}
      aria-label={esHero ? ariaLabel : undefined}
      aria-hidden={esHero ? undefined : true}
    >
      {DIMENSIONES.map((dimension) => (
        <i key={dimension.type} className="huella__banda">
          <span
            className={`huella__relleno ${dimension.clase}`}
            style={{ transform: `scaleY(${fracciones[dimension.type] ?? 0})` }}
          />
        </i>
      ))}
    </div>
  );
}

Huella.propTypes = {
  variant: PropTypes.oneOf(['progreso', 'hero']).isRequired,
  fracciones: PropTypes.objectOf(PropTypes.number).isRequired,
  ariaLabel: PropTypes.string,
};

export default Huella;
