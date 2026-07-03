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

  it('no muestra el botón de cuenta si no hay sesión iniciada', () => {
    useAuth.mockReturnValue({ user: null, logout: jest.fn() });
    renderHeader();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('muestra un botón con las iniciales del usuario y cierra sesión al presionarlo', async () => {
    const user = userEvent.setup();
    const logout = jest.fn();
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora' }, logout });
    renderHeader();

    const boton = screen.getByRole('button', { name: 'Cerrar sesión de Valeria Mora' });
    expect(boton).toHaveTextContent('VM');

    await user.click(boton);

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
