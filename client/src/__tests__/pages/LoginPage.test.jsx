import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import LoginPage from '../../pages/LoginPage';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  afterEach(() => jest.resetAllMocks());

  it('renderiza correo y contraseña como campos obligatorios', () => {
    useAuth.mockReturnValue({ login: jest.fn() });
    renderPage();

    expect(screen.getByLabelText('Correo electrónico')).toBeRequired();
    expect(screen.getByLabelText('Contraseña')).toBeRequired();
  });

  it('inicia sesión y navega a "/" con credenciales válidas', async () => {
    const user = userEvent.setup();
    const login = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login });
    renderPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@ejemplo.cr');
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ email: 'valeria@ejemplo.cr', password: 'clave1234' })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('muestra un mensaje de error genérico ante credenciales incorrectas', async () => {
    const user = userEvent.setup();
    const error = Object.assign(new Error('Correo o contraseña incorrectos.'), {
      code: 'INVALID_CREDENTIALS',
    });
    const login = jest.fn().mockRejectedValue(error);
    useAuth.mockReturnValue({ login });
    renderPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@ejemplo.cr');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta1');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Correo o contraseña incorrectos.');
    expect(alerta).toHaveTextContent('Revisá los datos e intentá de nuevo.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('muestra el botón en estado de carga mientras se envía', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    const login = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );
    useAuth.mockReturnValue({ login });
    renderPage();

    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@ejemplo.cr');
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const boton = screen.getByRole('button', { name: 'Entrando…' });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-busy', 'true');

    resolveLogin({});
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});
