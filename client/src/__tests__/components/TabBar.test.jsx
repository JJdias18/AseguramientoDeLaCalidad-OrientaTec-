import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import TabBar from '../../components/TabBar';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderTabBar(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]} future={ROUTER_FUTURE_FLAGS}>
      <TabBar />
    </MemoryRouter>
  );
}

describe('TabBar (DESIGN.md §5)', () => {
  afterEach(() => jest.resetAllMocks());

  it('no se renderiza sin sesión iniciada', () => {
    useAuth.mockReturnValue({ user: null });

    renderTabBar();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('un estudiante ve los 4 destinos, sin "Reactivos"', () => {
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora', role: 'student' } });

    renderTabBar();

    expect(screen.getByRole('link', { name: 'Cuestionario' })).toHaveAttribute(
      'href',
      '/cuestionario'
    );
    expect(screen.getByRole('link', { name: 'Mi huella' })).toHaveAttribute('href', '/mi-huella');
    expect(screen.getByRole('link', { name: 'Carreras' })).toHaveAttribute('href', '/carreras');
    expect(screen.getByRole('link', { name: 'Comparar' })).toHaveAttribute('href', '/comparar');
    expect(screen.queryByRole('link', { name: 'Reactivos' })).not.toBeInTheDocument();
  });

  it('un admin ve además el destino "Reactivos"', () => {
    useAuth.mockReturnValue({ user: { fullName: 'Admin', role: 'admin' } });

    renderTabBar();

    expect(screen.getByRole('link', { name: 'Reactivos' })).toHaveAttribute(
      'href',
      '/admin/reactivos'
    );
  });

  it('marca el destino actual como activo (aria-current)', () => {
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora', role: 'student' } });

    renderTabBar('/carreras');

    expect(screen.getByRole('link', { name: 'Carreras' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Comparar' })).not.toHaveAttribute('aria-current');
  });
});
