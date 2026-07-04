import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const carrera = (id, name) => ({ id, name, fieldOfWork: 'Campo', duration: '4 años' });

// Seis áreas ya ordenadas por afinidad (como las entrega el motor).
const RECOMMENDATIONS = [
  {
    id: 3,
    name: 'Artes y Diseño',
    description: 'Expresión creativa.',
    affinity: 89,
    dominantType: 'A',
    explanation: 'Coincide con tu interés artístico.',
    weights: { R: 0.2, I: 0.3, A: 0.95, S: 0.3, E: 0.3, C: 0.1 },
    careerCount: 2,
    careers: [carrera(11, 'Diseño Gráfico'), carrera(12, 'Arquitectura')],
  },
  {
    id: 6,
    name: 'Salud y Ciencias Médicas',
    description: 'Cuidado de la salud.',
    affinity: 86,
    dominantType: 'I',
    explanation: 'Coincide con tu interés investigativo.',
    weights: { R: 0.5, I: 0.8, A: 0.2, S: 0.8, E: 0.3, C: 0.4 },
    careerCount: 1,
    careers: [carrera(20, 'Medicina')],
  },
  {
    id: 2,
    name: 'Ciencias Exactas y Naturales',
    description: 'Método científico.',
    affinity: 85,
    dominantType: 'I',
    explanation: 'Coincide con tu interés investigativo.',
    weights: { R: 0.4, I: 0.95, A: 0.2, S: 0.2, E: 0.1, C: 0.3 },
    careerCount: 1,
    careers: [carrera(30, 'Física')],
  },
  {
    id: 4,
    name: 'Ciencias Sociales y Educación',
    description: 'Sociedad y personas.',
    affinity: 80,
    dominantType: 'S',
    explanation: 'Coincide con tu interés social.',
    weights: { R: 0.1, I: 0.4, A: 0.4, S: 0.95, E: 0.3, C: 0.2 },
    careerCount: 2,
    careers: [carrera(40, 'Psicología'), carrera(41, 'Trabajo Social')],
  },
  {
    id: 1,
    name: 'Ingeniería y Tecnología',
    description: 'Sistemas y máquinas.',
    affinity: 78,
    dominantType: 'I',
    explanation: 'Coincide con tu interés investigativo.',
    weights: { R: 0.9, I: 0.8, A: 0.2, S: 0.1, E: 0.3, C: 0.4 },
    careerCount: 1,
    careers: [carrera(50, 'Ingeniería en Computación')],
  },
  {
    id: 5,
    name: 'Administración y Negocios',
    description: 'Organizaciones y mercados.',
    affinity: 65,
    dominantType: 'C',
    explanation: 'Coincide con tu interés convencional.',
    weights: { R: 0.1, I: 0.2, A: 0.2, S: 0.4, E: 0.95, C: 0.8 },
    careerCount: 1,
    careers: [carrera(60, 'Administración de Empresas')],
  },
];

const okRecommendations = () =>
  questionnaireService.getRecommendations.mockResolvedValue({
    hasProfile: true,
    profile: PROFILE,
    recommendations: RECOMMENDATIONS,
  });

describe('ResultadoPage (HU-02 + HU-03)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt', user: { fullName: 'Ana Ruiz' } });
  });

  afterEach(() => jest.resetAllMocks());

  it('muestra la huella, la leyenda con valores y el código Holland del perfil', async () => {
    okRecommendations();
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Esta huella es solo tuya' })
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Tu huella vocacional/i })).toBeInTheDocument();
    expect(screen.getAllByText('Investigativo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('25 / 25')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: /Tu código Holland: IAC/ })).toBeInTheDocument();
  });

  it('destaca solo las TOP 3 áreas como cards, con % coseno y explicación (HU-03 esc. 1 y 3)', async () => {
    okRecommendations();
    const { container } = renderPage();

    expect(
      await screen.findByRole('heading', { name: /Tus áreas más afines/i })
    ).toBeInTheDocument();

    // Exactamente 3 cards destacadas (las demás quedan en el desplegable).
    const cards = container.querySelectorAll('.area');
    expect(cards).toHaveLength(3);
    expect(screen.getByText('Artes y Diseño')).toBeInTheDocument();
    expect(screen.getByText('Salud y Ciencias Médicas')).toBeInTheDocument();
    expect(screen.getByText('Ciencias Exactas y Naturales')).toBeInTheDocument();

    // Afinidad como número grande (coseno real) + explicación.
    const valores = container.querySelectorAll('.area__afinidad-val');
    expect(valores[0]).toHaveTextContent('89');
    expect(screen.getAllByText('afinidad')).toHaveLength(3);
    expect(screen.getByText('Coincide con tu interés artístico.')).toBeInTheDocument();
  });

  it('colapsa las áreas 4+ en "Ver más áreas afines" como lista simple (HU-03)', async () => {
    okRecommendations();
    const { container } = renderPage();

    await screen.findByText('Artes y Diseño');

    const summary = container.querySelector('summary');
    expect(summary).toHaveTextContent('Ver más áreas afines (3)');
    // Cerrado por defecto.
    expect(container.querySelector('details').open).toBe(false);

    // Las 3 restantes son filas compactas (sin huella grande), con su %.
    const filas = container.querySelectorAll('.area-mas');
    expect(filas).toHaveLength(3);
    expect(screen.getByText('Administración y Negocios')).toBeInTheDocument();
    expect(screen.getByText('65 %')).toBeInTheDocument();
    // Las filas compactas no dibujan la huella eco.
    expect(container.querySelectorAll('.area-mas .huella--eco')).toHaveLength(0);
  });

  it('permite drill-down a las carreras desde una card destacada (HU-03)', async () => {
    okRecommendations();
    renderPage();

    await screen.findByText('Artes y Diseño');
    expect(screen.queryByText('Diseño Gráfico')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Ver 2 carreras del área/i }));

    expect(await screen.findByText('Diseño Gráfico')).toBeInTheDocument();
    expect(screen.getByText('Arquitectura')).toBeInTheDocument();
  });

  it('sin perfil muestra el estado vacío con enlace al cuestionario (HU-03 esc. 2)', async () => {
    questionnaireService.getRecommendations.mockResolvedValue({
      hasProfile: false,
      recommendations: [],
    });
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Aún no tenés tu huella' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar cuestionario' })).toBeInTheDocument();
  });

  it('ante un error de red muestra el estado de error', async () => {
    questionnaireService.getRecommendations.mockRejectedValue(new Error('network'));
    renderPage();

    expect(await screen.findByText(/No pudimos cargar tu huella/i)).toBeInTheDocument();
  });
});
