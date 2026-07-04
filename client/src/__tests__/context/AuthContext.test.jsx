import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

jest.mock('../../services/authService');

const TOKEN_KEY = 'brujula_token';

function Probe() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <p>Cargando…</p>;

  return (
    <div>
      <p>{user ? `Hola ${user.fullName}` : 'Sin sesión'}</p>
      <button type="button" onClick={() => login({ email: 'a@b.cr', password: 'clave1234' })}>
        Entrar
      </button>
      <button type="button" onClick={logout}>
        Salir
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  it('empieza sin sesión cuando no hay token guardado', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());
  });

  it('restaura la sesión llamando a /auth/me si hay un token guardado', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-guardado');
    authService.me.mockResolvedValue({ user: { id: 1, fullName: 'Valeria Mora' } });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Hola Valeria Mora')).toBeInTheDocument());
    expect(authService.me).toHaveBeenCalledWith('jwt-guardado');
  });

  it('borra el token guardado si /auth/me falla (token vencido o inválido)', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-vencido');
    authService.me.mockRejectedValue(new Error('no autorizado'));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('login guarda el token y actualiza el usuario', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({
      token: 'jwt-nuevo',
      user: { id: 1, fullName: 'Valeria Mora' },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText('Hola Valeria Mora')).toBeInTheDocument());
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-nuevo');
  });

  it('logout limpia el token y el usuario', async () => {
    const user = userEvent.setup();
    localStorage.setItem(TOKEN_KEY, 'jwt-guardado');
    authService.me.mockResolvedValue({ user: { id: 1, fullName: 'Valeria Mora' } });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Hola Valeria Mora')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Salir' }));

    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
