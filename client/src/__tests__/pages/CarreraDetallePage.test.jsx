import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import CarreraDetallePage from '../../pages/CarreraDetallePage';
import { useAuth } from '../../context/AuthContext';
import * as careerService from '../../services/careerService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/careerService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderPage(id = '3') {
  return render(
    <MemoryRouter initialEntries={[`/carreras/${id}`]} future={ROUTER_FUTURE_FLAGS}>
      <Routes>
        <Route path="/carreras/:id" element={<CarreraDetallePage />} />
      </Routes>
    </MemoryRouter>
  );
}

const CARRERA = {
  id: 3,
  name: 'Biología',
  description: 'Estudio de los seres vivos y sus procesos.',
  fieldOfWork: 'Investigación, laboratorios, docencia.',
  duration: '4 años',
  profileDesc: 'Curioso, observador, metódico.',
  area: {
    id: 2,
    name: 'Ciencias Exactas y Naturales',
    dominantType: 'I',
    weights: { R: 0.4, I: 0.9, A: 0.2, S: 0.2, E: 0.1, C: 0.3 },
  },
};

describe('CarreraDetallePage (HU-04, escenario 3: ficha de la carrera)', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt' });
  });

  afterEach(() => jest.resetAllMocks());

  it('muestra la descripción, el campo laboral, la duración y el perfil de la carrera', async () => {
    careerService.getCareer.mockResolvedValue({ career: CARRERA });
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Biología' })).toBeInTheDocument();
    expect(screen.getByText('Estudio de los seres vivos y sus procesos.')).toBeInTheDocument();
    expect(screen.getByText('Investigación, laboratorios, docencia.')).toBeInTheDocument();
    expect(screen.getByText('Curioso, observador, metódico.')).toBeInTheDocument();
    expect(screen.getByText(/Ciencias Exactas y Naturales · 4 años/)).toBeInTheDocument();
    expect(careerService.getCareer).toHaveBeenCalledWith('jwt', '3');
    expect(screen.getByRole('link', { name: /comparar esta carrera/i })).toHaveAttribute(
      'href',
      '/comparar?a=3'
    );
  });

  it('si la carrera no existe, muestra un aviso y el enlace de vuelta al catálogo', async () => {
    const error = new Error('no encontrada');
    error.status = 404;
    careerService.getCareer.mockRejectedValue(error);
    renderPage('999999');

    expect(await screen.findByText('No encontramos esa carrera.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al catálogo/i })).toHaveAttribute(
      'href',
      '/carreras'
    );
  });

  it('ante un error de red muestra el estado de error', async () => {
    careerService.getCareer.mockRejectedValue(new Error('network'));
    renderPage();

    expect(await screen.findByText(/No pudimos cargar la ficha/i)).toBeInTheDocument();
  });
});
