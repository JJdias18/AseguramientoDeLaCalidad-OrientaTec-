import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderHeader() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <AppHeader />
    </MemoryRouter>
  );
}

describe('AppHeader', () => {
  afterEach(() => jest.resetAllMocks());

  it('muestra el logo enlazando al inicio', () => {
    useAuth.mockReturnValue({ user: null, logout: jest.fn() });
    renderHeader();

    expect(screen.getByRole('link', { name: /brújula/i })).toHaveAttribute('href', '/');
  });

  it('no muestra controles de cuenta si no hay sesión iniciada', () => {
    useAuth.mockReturnValue({ user: null, logout: jest.fn() });
    renderHeader();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /mi huella/i })).not.toBeInTheDocument();
  });

  it('con sesión iniciada, enlaza a "Carreras" y "Comparar" (HU-05)', () => {
    useAuth.mockReturnValue({
      user: { fullName: 'Valeria Mora', role: 'student' },
      logout: jest.fn(),
    });
    renderHeader();

    expect(screen.getByRole('link', { name: 'Carreras' })).toHaveAttribute('href', '/carreras');
    expect(screen.getByRole('link', { name: 'Comparar' })).toHaveAttribute('href', '/comparar');
  });

  it('un estudiante NO ve el enlace de gestión de reactivos (HU-07)', () => {
    useAuth.mockReturnValue({
      user: { fullName: 'Valeria Mora', role: 'student' },
      logout: jest.fn(),
    });
    renderHeader();

    expect(screen.queryByRole('link', { name: /gestión de reactivos/i })).not.toBeInTheDocument();
  });

  it('un admin sí ve el enlace de gestión de reactivos (HU-07)', () => {
    useAuth.mockReturnValue({
      user: { fullName: 'Administrador OrientaTec', role: 'admin' },
      logout: jest.fn(),
    });
    renderHeader();

    expect(screen.getByRole('link', { name: /gestión de reactivos/i })).toHaveAttribute(
      'href',
      '/admin/reactivos'
    );
  });

  it('la burbuja de perfil lleva a "Mi huella" y NO cierra la sesión', async () => {
    const user = userEvent.setup();
    const logout = jest.fn();
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora' }, logout });
    renderHeader();

    const burbuja = screen.getByRole('link', { name: /mi huella/i });
    expect(burbuja).toHaveTextContent('VM');
    expect(burbuja).toHaveAttribute('href', '/mi-huella');

    await user.click(burbuja);
    // Ver el perfil no debe terminar la sesión (regresión: burbuja == logout).
    expect(logout).not.toHaveBeenCalled();
  });

  it('ofrece un botón explícito para cerrar sesión', async () => {
    const user = userEvent.setup();
    const logout = jest.fn();
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora' }, logout });
    renderHeader();

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
