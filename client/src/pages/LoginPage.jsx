import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import PasswordField from '../components/PasswordField';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasError(false);
    setSubmitting(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (error) {
      setHasError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pagina estrecha">
      <h2>Entrá a tu cuenta</h2>
      <p className="sub" style={{ margin: 'var(--esp-2) 0 var(--esp-5)' }}>
        ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>.
      </p>

      {hasError && (
        <div className="panel panel--error" role="alert" style={{ marginBottom: 'var(--esp-4)' }}>
          <b>Correo o contraseña incorrectos.</b> Revisá los datos e intentá de nuevo.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="campo">
          <label htmlFor="li-correo">Correo electrónico</label>
          <input
            id="li-correo"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange('email')}
          />
        </div>

        <PasswordField
          id="li-clave"
          label="Contraseña"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange('password')}
        />

        <button
          className="btn btn--primario btn--bloque"
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
