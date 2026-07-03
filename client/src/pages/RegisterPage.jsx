import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';
import { isValidEmail, isValidPassword } from '../utils/validators';

const fieldError = (field, value) => {
  if (!value.trim()) return 'Este campo es obligatorio.';
  if (field === 'email' && !isValidEmail(value)) {
    return 'El correo electrónico no tiene un formato válido.';
  }
  if (field === 'password' && !isValidPassword(value)) {
    return 'Le faltan caracteres: usá al menos 8, mezclando letras y números.';
  }
  return null;
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleBlur = (field) => () => {
    setErrors((prev) => ({ ...prev, [field]: fieldError(field, form[field]) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      fullName: fieldError('fullName', form.fullName),
      email: fieldError('email', form.email),
      password: fieldError('password', form.password),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email,
        password: form.password,
      });
      navigate('/');
    } catch (error) {
      if (error.code === 'EMAIL_TAKEN') {
        setErrors((prev) => ({ ...prev, email: 'EMAIL_TAKEN' }));
      } else {
        setErrors((prev) => ({ ...prev, form: error.message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pagina estrecha">
      <h2>Creá tu cuenta</h2>
      <p className="sub" style={{ margin: 'var(--esp-2) 0 var(--esp-5)' }}>
        En un par de minutos vas a estar respondiendo el cuestionario.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div className={`campo ${errors.fullName ? 'campo--error' : ''}`.trim()}>
          <label htmlFor="re-nombre">Nombre completo</label>
          <input
            id="re-nombre"
            type="text"
            autoComplete="name"
            required
            value={form.fullName}
            onChange={handleChange('fullName')}
            onBlur={handleBlur('fullName')}
            aria-describedby={errors.fullName ? 're-nombre-msg' : undefined}
          />
          {errors.fullName && (
            <p className="mensaje" id="re-nombre-msg">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className={`campo ${errors.email ? 'campo--error' : ''}`.trim()}>
          <label htmlFor="re-correo">Correo electrónico</label>
          <input
            id="re-correo"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            aria-describedby={errors.email ? 're-correo-msg' : undefined}
          />
          {errors.email === 'EMAIL_TAKEN' && (
            <p className="mensaje" id="re-correo-msg">
              Ese correo ya tiene cuenta. <Link to="/iniciar-sesion">Iniciá sesión</Link> o usá otro
              correo.
            </p>
          )}
          {errors.email && errors.email !== 'EMAIL_TAKEN' && (
            <p className="mensaje" id="re-correo-msg">
              {errors.email}
            </p>
          )}
        </div>

        <PasswordField
          id="re-clave"
          label="Contraseña"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          ayuda={errors.password ? undefined : 'Mínimo 8 caracteres, con letras y números.'}
          error={errors.password}
        />

        <button
          className="btn btn--primario btn--bloque"
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
