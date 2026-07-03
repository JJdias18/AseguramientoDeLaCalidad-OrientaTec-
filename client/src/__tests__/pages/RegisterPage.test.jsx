import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import RegisterPage from '../../pages/RegisterPage';
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
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  afterEach(() => jest.resetAllMocks());

  it('renderiza los campos obligatorios de registro', () => {
    useAuth.mockReturnValue({ register: jest.fn() });
    renderPage();

    expect(screen.getByLabelText('Nombre completo')).toBeRequired();
    expect(screen.getByLabelText('Correo electrónico')).toBeRequired();
    expect(screen.getByLabelText('Contraseña')).toBeRequired();
  });

  it('muestra un error de contraseña débil al perder el foco del campo', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ register: jest.fn() });
    renderPage();

    await user.type(screen.getByLabelText('Contraseña'), 'abc');
    await user.tab();

    expect(
      screen.getByText('Le faltan caracteres: usá al menos 8, mezclando letras y números.')
    ).toBeInTheDocument();
  });

  it('registra y navega a "/" con datos válidos', async () => {
    const user = userEvent.setup();
    const register = jest.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ register });
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Valeria Mora');
    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@ejemplo.cr');
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        fullName: 'Valeria Mora',
        email: 'valeria@ejemplo.cr',
        password: 'clave1234',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('muestra el error de correo repetido con enlace a inicio de sesión', async () => {
    const user = userEvent.setup();
    const error = Object.assign(new Error('Ese correo ya tiene una cuenta.'), {
      code: 'EMAIL_TAKEN',
    });
    const register = jest.fn().mockRejectedValue(error);
    useAuth.mockReturnValue({ register });
    renderPage();

    await user.type(screen.getByLabelText('Nombre completo'), 'Valeria Mora');
    await user.type(screen.getByLabelText('Correo electrónico'), 'valeria@ejemplo.cr');
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(await screen.findByText(/ese correo ya tiene cuenta/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciá sesión/i })).toHaveAttribute(
      'href',
      '/iniciar-sesion'
    );
  });
});
