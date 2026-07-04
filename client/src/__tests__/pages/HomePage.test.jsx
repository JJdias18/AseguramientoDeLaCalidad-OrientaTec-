import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import HomePage from '../../pages/HomePage';
import { useAuth } from '../../context/AuthContext';
import * as questionnaireService from '../../services/questionnaireService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/questionnaireService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

const PERFIL = {
  scores: { R: 10, I: 25, A: 20, S: 15, E: 10, C: 10 },
  hollandCode: 'IAS',
  dominant: ['I', 'A'],
};

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { fullName: 'Valeria Mora' }, token: 'jwt' });
  });

  afterEach(() => jest.resetAllMocks());

  it('sin perfil, muestra el estado vacío con una llamada a la acción al cuestionario', async () => {
    questionnaireService.getRecommendations.mockResolvedValue({
      hasProfile: false,
      recommendations: [],
    });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: /aún no tenés tu huella/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /empezar cuestionario/i })).toHaveAttribute(
      'href',
      '/cuestionario'
    );
  });

  it('con perfil, NO niega la huella: muestra el resumen y el enlace a "Mi huella"', async () => {
    questionnaireService.getRecommendations.mockResolvedValue({
      hasProfile: true,
      profile: PERFIL,
      recommendations: [{ id: 2, name: 'Ciencias Exactas y Naturales', affinity: 87 }],
    });

    renderPage();

    expect(
      await screen.findByRole('heading', { name: /tu huella está lista/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/aún no tenés tu huella/i)).not.toBeInTheDocument();
    expect(screen.getByText('IAS')).toBeInTheDocument();
    expect(screen.getByText('Ciencias Exactas y Naturales')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver mi huella/i })).toHaveAttribute(
      'href',
      '/mi-huella'
    );
  });

  it('ante un error de red muestra el estado de error, no el estado vacío', async () => {
    questionnaireService.getRecommendations.mockRejectedValue(new Error('network'));

    renderPage();

    expect(await screen.findByText(/no pudimos cargar tu información/i)).toBeInTheDocument();
    expect(screen.queryByText(/aún no tenés tu huella/i)).not.toBeInTheDocument();
  });
});
