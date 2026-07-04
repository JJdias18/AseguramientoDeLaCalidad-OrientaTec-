import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import CarrerasPage from '../../pages/CarrerasPage';
import { useAuth } from '../../context/AuthContext';
import * as careerService from '../../services/careerService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/careerService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <CarrerasPage />
    </MemoryRouter>
  );
}

const carrera = (id, name, areaId, areaName, dominantType) => ({
  id,
  name,
  fieldOfWork: 'Campo laboral de prueba',
  duration: '4 años',
  area: { id: areaId, name: areaName, dominantType },
});

const CATALOGO = [
  carrera(1, 'Ingeniería en Computación', 1, 'Ingeniería y Tecnología', 'R'),
  carrera(2, 'Ingeniería Industrial', 1, 'Ingeniería y Tecnología', 'R'),
  carrera(3, 'Biología', 2, 'Ciencias Exactas y Naturales', 'I'),
];

describe('CarrerasPage (HU-04)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt' });
  });

  afterEach(() => jest.resetAllMocks());

  describe('Escenario 1: listar el catálogo', () => {
    it('muestra cada carrera con su nombre y área', async () => {
      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      renderPage();

      expect(await screen.findByText('Ingeniería en Computación')).toBeInTheDocument();
      expect(screen.getByText('Biología')).toBeInTheDocument();
      expect(document.querySelectorAll('.carrera__area')).toHaveLength(3);
      expect(screen.getAllByText('Ingeniería y Tecnología').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Ciencias Exactas y Naturales').length).toBeGreaterThanOrEqual(1);
      expect(careerService.getCareers).toHaveBeenCalledWith('jwt', { search: '', area: null });
    });

    it('arma los chips de área a partir del catálogo completo', async () => {
      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      renderPage();

      await screen.findByText('Ingeniería en Computación');
      expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ingeniería y Tecnología' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Ciencias Exactas y Naturales' })
      ).toBeInTheDocument();
    });
  });

  describe('Escenario 2: búsqueda con resultados', () => {
    it('vuelve a consultar el catálogo con el término escrito', async () => {
      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      renderPage();
      await screen.findByText('Ingeniería en Computación');

      careerService.getCareers.mockResolvedValue({
        careers: [carrera(3, 'Biología', 2, 'Ciencias Exactas y Naturales', 'I')],
      });
      await userEvent.type(screen.getByLabelText('Buscá una carrera'), 'biologia');

      await waitFor(() =>
        expect(careerService.getCareers).toHaveBeenLastCalledWith('jwt', {
          search: 'biologia',
          area: null,
        })
      );
      expect(await screen.findByText('Biología')).toBeInTheDocument();
      expect(screen.queryByText('Ingeniería en Computación')).not.toBeInTheDocument();
    });
  });

  describe('Escenario 4: búsqueda sin resultados', () => {
    it('muestra el mensaje de "no se encontraron carreras" y permite quitar el filtro', async () => {
      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      renderPage();
      await screen.findByText('Ingeniería en Computación');

      careerService.getCareers.mockResolvedValue({ careers: [] });
      await userEvent.type(screen.getByLabelText('Buscá una carrera'), 'panaderia');

      expect(
        await screen.findByText(/No se encontraron carreras para «panaderia»/i)
      ).toBeInTheDocument();

      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      await userEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));

      expect(await screen.findByText('Ingeniería en Computación')).toBeInTheDocument();
      expect(screen.getByLabelText('Buscá una carrera')).toHaveValue('');
    });
  });

  describe('Filtro por área', () => {
    it('al elegir un chip, consulta el catálogo filtrado por esa área', async () => {
      careerService.getCareers.mockResolvedValue({ careers: CATALOGO });
      renderPage();
      await screen.findByText('Ingeniería en Computación');

      careerService.getCareers.mockResolvedValue({
        careers: [carrera(3, 'Biología', 2, 'Ciencias Exactas y Naturales', 'I')],
      });
      await userEvent.click(screen.getByRole('button', { name: 'Ciencias Exactas y Naturales' }));

      await waitFor(() =>
        expect(careerService.getCareers).toHaveBeenLastCalledWith('jwt', {
          search: '',
          area: 2,
        })
      );
      expect(await screen.findByText('Biología')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ciencias Exactas y Naturales' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  it('ante un error de red muestra el estado de error', async () => {
    careerService.getCareers.mockRejectedValue(new Error('network'));
    renderPage();

    expect(await screen.findByText(/No pudimos cargar las carreras/i)).toBeInTheDocument();
  });
});
