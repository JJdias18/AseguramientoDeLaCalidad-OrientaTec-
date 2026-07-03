import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import ResultadoPage from '../../pages/ResultadoPage';
import { useAuth } from '../../context/AuthContext';
import * as questionnaireService from '../../services/questionnaireService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/questionnaireService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <ResultadoPage />
    </MemoryRouter>
  );
}

const PROFILE = {
  id: 1,
  attemptId: 1,
  scores: { R: 5, I: 25, A: 25, S: 10, E: 5, C: 10 },
  hollandCode: 'IAC',
  dominant: ['I', 'A'],
  createdAt: '2026-07-03T12:00:00Z',
};

describe('ResultadoPage (HU-02)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt', user: { fullName: 'Ana Ruiz' } });
  });

  afterEach(() => jest.resetAllMocks());

  it('muestra la huella, la leyenda con valores y el código Holland del perfil', async () => {
    questionnaireService.getProfile.mockResolvedValue({ profile: PROFILE });
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Esta huella es solo tuya' })
    ).toBeInTheDocument();
    // Huella hero informativa.
    expect(screen.getByRole('img', { name: /Tu huella vocacional/i })).toBeInTheDocument();
    // Dimensiones y valores en la leyenda (Investigativo aparece también en la narrativa).
    expect(screen.getAllByText('Investigativo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25 / 25')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /Tu código Holland: IAC/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Repetir el cuestionario' })).toBeInTheDocument();
  });

  it('sin perfil muestra el estado vacío con enlace al cuestionario', async () => {
    const error = Object.assign(new Error('sin perfil'), { code: 'PROFILE_NOT_FOUND' });
    questionnaireService.getProfile.mockRejectedValue(error);
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Aún no tenés tu huella' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar cuestionario' })).toBeInTheDocument();
  });
});
