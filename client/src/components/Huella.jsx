import PropTypes from 'prop-types';

import { DIMENSIONES } from '../utils/riasec';

/**
 * La huella: seis bandas en orden fijo R-I-A-S-E-C (DESIGN.md §4).
 *
 * - `variant="progreso"`: 12px, decorativa (aria-hidden); cada banda se LLENA
 *   (scaleY) según `fracciones[type]` (0–1). El contador textual comunica el avance.
 * - `variant="hero"`: 112px, informativa; misma mecánica de llenado, con
 *   role="img" + aria-label con los seis valores (revelación del resultado).
 * - `variant="eco"`: 16px, decorativa (aria-hidden); bandas SÓLIDAS cuyo ANCHO es
 *   proporcional a `pesos[type]` — es la IDENTIDAD del área (su mezcla de dimensiones),
 *   no un medidor de afinidad. El porqué textual y el indicador de afinidad la
 *   acompañan por separado, por eso es aria-hidden.
 */
function Huella({ variant, fracciones = {}, pesos = {}, ariaLabel = undefined }) {
  if (variant === 'eco') {
    return (
      <div className="huella huella--eco" aria-hidden="true">
        {DIMENSIONES.map((dimension) => (
          <i
            key={dimension.type}
            className={`huella__eco-banda ${dimension.clase}`}
            style={{ flexGrow: pesos[dimension.type] ?? 0 }}
          />
        ))}
      </div>
    );
  }

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
  variant: PropTypes.oneOf(['progreso', 'hero', 'eco']).isRequired,
  fracciones: PropTypes.objectOf(PropTypes.number),
  pesos: PropTypes.objectOf(PropTypes.number),
  ariaLabel: PropTypes.string,
};

export default Huella;
