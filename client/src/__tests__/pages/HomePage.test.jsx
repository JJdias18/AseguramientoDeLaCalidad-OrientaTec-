import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import HomePage from '../../pages/HomePage';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

describe('HomePage', () => {
  afterEach(() => jest.resetAllMocks());

  it('muestra el estado vacío con una llamada a la acción al cuestionario', () => {
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora' } });

    render(
      <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /aún no tenés tu huella/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /empezar cuestionario/i })).toHaveAttribute(
      'href',
      '/cuestionario'
    );
  });
});
