import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import GuestRoute from '../../components/GuestRoute';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderWithRoute(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]} future={ROUTER_FUTURE_FLAGS}>
      <Routes>
        <Route path="/" element={<p>Inicio</p>} />
        <Route element={<GuestRoute />}>
          <Route path="/iniciar-sesion" element={<p>Pantalla de inicio de sesión</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('GuestRoute', () => {
  afterEach(() => jest.resetAllMocks());

  it('renderiza la pantalla pública si no hay usuario autenticado', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderWithRoute('/iniciar-sesion');

    expect(screen.getByText('Pantalla de inicio de sesión')).toBeInTheDocument();
  });

  it('redirige a "/" si ya hay una sesión iniciada', () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });

    renderWithRoute('/iniciar-sesion');

    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });
});
