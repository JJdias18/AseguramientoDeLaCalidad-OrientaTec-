import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderWithRoute(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]} future={ROUTER_FUTURE_FLAGS}>
      <Routes>
        <Route path="/iniciar-sesion" element={<p>Pantalla de inicio de sesión</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<p>Contenido protegido</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => jest.resetAllMocks());

  it('muestra un estado de carga mientras se valida la sesión', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    renderWithRoute('/');

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('redirige a iniciar sesión si no hay usuario autenticado', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderWithRoute('/');

    expect(screen.getByText('Pantalla de inicio de sesión')).toBeInTheDocument();
  });

  it('renderiza el contenido protegido si hay un usuario autenticado', () => {
    useAuth.mockReturnValue({ user: { id: 1, fullName: 'Valeria' }, loading: false });

    renderWithRoute('/');

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
