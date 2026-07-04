import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import AdminRoute from '../../components/AdminRoute';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/reactivos']} future={ROUTER_FUTURE_FLAGS}>
      <Routes>
        <Route path="/" element={<p>Inicio</p>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/reactivos" element={<p>Panel de reactivos</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute (HU-07)', () => {
  afterEach(() => jest.resetAllMocks());

  it('renderiza el contenido si el usuario tiene rol admin', () => {
    useAuth.mockReturnValue({ user: { id: 1, fullName: 'Admin', role: 'admin' } });

    renderWithRoute();

    expect(screen.getByText('Panel de reactivos')).toBeInTheDocument();
  });

  it('muestra "Acceso denegado" con enlace a inicio si el usuario no es admin', () => {
    useAuth.mockReturnValue({ user: { id: 2, fullName: 'Estudiante', role: 'student' } });

    renderWithRoute();

    expect(screen.queryByText('Panel de reactivos')).not.toBeInTheDocument();
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });
});
