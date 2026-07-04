import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import ComparadorPage from '../../pages/ComparadorPage';
import { useAuth } from '../../context/AuthContext';
import * as careerService from '../../services/careerService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/careerService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

const CATALOGO = [
  { id: 1, name: 'Ingeniería en Software' },
  { id: 2, name: 'Diseño Gráfico' },
  { id: 3, name: 'Biología' },
];

const carreraDetalle = (overrides) => ({
  id: 1,
  name: 'Ingeniería en Software',
  duration: '4 años',
  fieldOfWork: 'Desarrollo y QA de software',
  profileDesc: 'Lógico, analítico',
  area: { id: 1, name: 'Tecnología e Informática', dominantType: 'I' },
  ...overrides,
});

function renderPage(entrada = '/comparar') {
  return render(
    <MemoryRouter initialEntries={[entrada]} future={ROUTER_FUTURE_FLAGS}>
      <Routes>
        <Route path="/comparar" element={<ComparadorPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ComparadorPage (HU-05)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt' });
    careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
  });

  afterEach(() => jest.resetAllMocks());

  describe('Escenario 1: comparación válida', () => {
    it('muestra ambas carreras lado a lado con sus atributos', async () => {
      const user = userEvent.setup();
      careerService.compareCareers.mockResolvedValue({
        careers: [
          carreraDetalle(),
          carreraDetalle({
            id: 2,
            name: 'Diseño Gráfico',
            duration: '4 años',
            fieldOfWork: 'Identidad visual y multimedia',
            profileDesc: 'Creativo, visual',
            area: { id: 4, name: 'Arte y Diseño', dominantType: 'A' },
          }),
        ],
      });
      renderPage();

      await screen.findByLabelText('Carrera A');
      await user.selectOptions(screen.getByLabelText('Carrera A'), '1');
      await user.selectOptions(screen.getByLabelText('Carrera B'), '2');
      await user.click(screen.getByRole('button', { name: 'Comparar' }));

      expect(await screen.findByRole('table')).toBeInTheDocument();
      expect(careerService.compareCareers).toHaveBeenCalledWith('jwt', { a: '1', b: '2' });
      expect(screen.getByText('Desarrollo y QA de software')).toBeInTheDocument();
      expect(screen.getByText('Identidad visual y multimedia')).toBeInTheDocument();
      expect(screen.getByText('Tecnología e Informática')).toBeInTheDocument();
      expect(screen.getByText('Arte y Diseño')).toBeInTheDocument();
    });
  });

  describe('Escenario 2: una sola carrera seleccionada', () => {
    it('deshabilita "Comparar" y pide elegir la segunda carrera', async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByLabelText('Carrera A');
      await user.selectOptions(screen.getByLabelText('Carrera A'), '1');

      expect(screen.getByRole('button', { name: 'Comparar' })).toBeDisabled();
      expect(screen.getByText(/seleccioná las dos carreras/i)).toBeInTheDocument();
      expect(careerService.compareCareers).not.toHaveBeenCalled();
    });
  });

  describe('Escenario 3: misma carrera repetida', () => {
    it('avisa que las carreras deben ser distintas y deshabilita "Comparar"', async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByLabelText('Carrera A');
      await user.selectOptions(screen.getByLabelText('Carrera A'), '1');
      await user.selectOptions(screen.getByLabelText('Carrera B'), '1');

      expect(
        screen.getByText('Elegiste la misma carrera dos veces. Cambiá una para poder comparar.')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Comparar' })).toBeDisabled();
      expect(careerService.compareCareers).not.toHaveBeenCalled();
    });
  });

  describe('Escenario 4: cambiar una carrera', () => {
    it('al cambiar la segunda carrera, actualiza la comparación de inmediato', async () => {
      const user = userEvent.setup();
      careerService.compareCareers.mockImplementation((token, { a, b }) => {
        const nombres = { 1: 'Ingeniería en Software', 2: 'Diseño Gráfico', 3: 'Biología' };
        return Promise.resolve({
          careers: [
            carreraDetalle({ id: Number(a), name: nombres[a] }),
            carreraDetalle({
              id: Number(b),
              name: nombres[b],
              fieldOfWork: `Campo de ${nombres[b]}`,
            }),
          ],
        });
      });
      renderPage();

      await screen.findByLabelText('Carrera A');
      await user.selectOptions(screen.getByLabelText('Carrera A'), '1');
      await user.selectOptions(screen.getByLabelText('Carrera B'), '2');
      await user.click(screen.getByRole('button', { name: 'Comparar' }));

      expect(await screen.findByText('Campo de Diseño Gráfico')).toBeInTheDocument();

      await user.selectOptions(screen.getByLabelText('Carrera B'), '3');

      expect(await screen.findByText('Campo de Biología')).toBeInTheDocument();
      expect(careerService.compareCareers).toHaveBeenCalledTimes(2);
      expect(careerService.compareCareers).toHaveBeenLastCalledWith('jwt', { a: '1', b: '3' });
    });
  });

  it('precarga la Carrera A desde el query param "a" (entrada desde la ficha)', async () => {
    careerService.compareCareers.mockResolvedValue({ careers: [] });
    renderPage('/comparar?a=2');

    expect(await screen.findByLabelText('Carrera A')).toHaveValue('2');
  });
});
