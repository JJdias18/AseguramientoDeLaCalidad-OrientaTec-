import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import CuestionarioPage from '../../pages/CuestionarioPage';
import { useAuth } from '../../context/AuthContext';
import * as questionnaireService from '../../services/questionnaireService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/questionnaireService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

const QUESTIONS = [
  { id: 10, position: 1, text: 'Pregunta uno', riasecType: 'R', scaleMin: 1, scaleMax: 5 },
  { id: 11, position: 2, text: 'Pregunta dos', riasecType: 'I', scaleMin: 1, scaleMax: 5 },
  { id: 12, position: 3, text: 'Pregunta tres', riasecType: 'A', scaleMin: 1, scaleMax: 5 },
];

const buildState = ({ answers = [], nextIndex = 0, resumed = false } = {}) => ({
  attempt: { id: 1, status: 'in_progress', startedAt: '2026-07-03T00:00:00Z' },
  questions: QUESTIONS,
  answers,
  progress: {
    total: 3,
    answered: answers.length,
    nextIndex,
    complete: answers.length === 3,
  },
  resumed,
});

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <CuestionarioPage />
    </MemoryRouter>
  );
}

describe('CuestionarioPage (HU-02)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt', user: { fullName: 'Ana Ruiz' } });
    questionnaireService.saveAnswer.mockResolvedValue({ answer: {}, progress: {} });
  });

  afterEach(() => jest.resetAllMocks());

  it('muestra la intro con "Empezar" cuando no hay intento en curso', async () => {
    questionnaireService.getCurrentAttempt.mockResolvedValue({ attempt: null });
    renderPage();

    expect(await screen.findByRole('button', { name: 'Empezar' })).toBeInTheDocument();
    expect(screen.getByText(/30 preguntas/i)).toBeInTheDocument();
  });

  it('al empezar muestra la primera pregunta y el contador', async () => {
    const user = userEvent.setup();
    questionnaireService.getCurrentAttempt.mockResolvedValue({ attempt: null });
    questionnaireService.startAttempt.mockResolvedValue(buildState());
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Empezar' }));

    expect(screen.getByText('Pregunta uno')).toBeInTheDocument();
    expect(screen.getByText('Pregunta 1 de 3')).toBeInTheDocument();
  });

  it('guarda cada respuesta con autosave y muestra "Guardado ✓"', async () => {
    const user = userEvent.setup();
    questionnaireService.getCurrentAttempt.mockResolvedValue({ attempt: null });
    questionnaireService.startAttempt.mockResolvedValue(buildState());
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('radio', { name: '5 · Totalmente yo' }));

    expect(questionnaireService.saveAnswer).toHaveBeenCalledWith('jwt', 1, 10, 5);
    expect(await screen.findByText('Guardado ✓')).toBeInTheDocument();
  });

  it('escenario 2: bloquea el envío incompleto y señala las preguntas faltantes', async () => {
    const user = userEvent.setup();
    questionnaireService.getCurrentAttempt.mockResolvedValue({ attempt: null });
    questionnaireService.startAttempt.mockResolvedValue(buildState());
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Empezar' }));
    // Avanza hasta la última sin responder ninguna.
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Ver mi huella' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/faltan 3 preguntas/i);
    expect(questionnaireService.submitAttempt).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('escenario 1: al responder todo y enviar, calcula y navega a "/mi-huella"', async () => {
    const user = userEvent.setup();
    questionnaireService.getCurrentAttempt.mockResolvedValue({ attempt: null });
    questionnaireService.startAttempt.mockResolvedValue(buildState());
    questionnaireService.submitAttempt.mockResolvedValue({ profile: {} });
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('radio', { name: '5 · Totalmente yo' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('radio', { name: '5 · Totalmente yo' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('radio', { name: '5 · Totalmente yo' }));
    await user.click(screen.getByRole('button', { name: 'Ver mi huella' }));

    await waitFor(() => expect(questionnaireService.submitAttempt).toHaveBeenCalledWith('jwt', 1));
    expect(mockNavigate).toHaveBeenCalledWith('/mi-huella');
  });

  it('escenario 3: al retomar muestra el aviso y ubica en la primera sin responder', async () => {
    const user = userEvent.setup();
    questionnaireService.getCurrentAttempt.mockResolvedValue(
      buildState({
        answers: [
          { questionId: 10, value: 4 },
          { questionId: 11, value: 3 },
        ],
        nextIndex: 2,
        resumed: true,
      })
    );
    renderPage();

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Retomaste donde quedaste: pregunta 3 de 3'
    );

    await user.click(screen.getByRole('button', { name: 'Retomar cuestionario' }));

    expect(screen.getByText('Pregunta tres')).toBeInTheDocument();
    expect(screen.getByText('Pregunta 3 de 3')).toBeInTheDocument();
    // Retomar no crea un intento nuevo.
    expect(questionnaireService.startAttempt).not.toHaveBeenCalled();
  });
});
