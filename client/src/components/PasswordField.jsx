import { useId, useState } from 'react';
import PropTypes from 'prop-types';

function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur = undefined,
  autoComplete = 'current-password',
  ayuda = undefined,
  error = undefined,
}) {
  const [visible, setVisible] = useState(false);
  const mensajeId = useId();

  return (
    <div className={`campo ${error ? 'campo--error' : ''}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <div className="campo__control-clave">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          aria-describedby={error || ayuda ? mensajeId : undefined}
        />
        <button
          type="button"
          className="mostrar"
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {error && (
        <p id={mensajeId} className="mensaje">
          {error}
        </p>
      )}
      {!error && ayuda && (
        <p id={mensajeId} className="ayuda">
          {ayuda}
        </p>
      )}
    </div>
  );
}

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  autoComplete: PropTypes.string,
  ayuda: PropTypes.string,
  error: PropTypes.string,
};

export default PasswordField;
