import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import AdminReactivosPage from '../../pages/AdminReactivosPage';
import { useAuth } from '../../context/AuthContext';
import * as adminQuestionService from '../../services/adminQuestionService';

jest.mock('../../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/adminQuestionService');

const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderPage() {
  return render(
    <MemoryRouter future={ROUTER_FUTURE_FLAGS}>
      <AdminReactivosPage />
    </MemoryRouter>
  );
}

const reactivo = (id, text, riasecType, isActive = true) => ({
  id,
  text,
  riasecType,
  scaleMin: 1,
  scaleMax: 5,
  isActive,
});

const BANCO = [
  reactivo(1, 'Disfruto reparar aparatos electrónicos.', 'R'),
  reactivo(2, 'Reactivo desactivado de prueba.', 'I', false),
];

describe('AdminReactivosPage (HU-07)', () => {
  beforeAll(() => {
    // jsdom no implementa showModal()/close(): se simulan reflejando el atributo
    // `open` (del que depende tanto la propiedad `.open` como la visibilidad que
    // Testing Library usa para decidir qué es accesible). Funciones planas, no
    // jest.fn(): `afterEach(jest.resetAllMocks)` borraría su implementación.
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  });

  beforeEach(() => {
    useAuth.mockReturnValue({ token: 'jwt' });
    adminQuestionService.getQuestions.mockResolvedValue({ questions: BANCO });
  });

  afterEach(() => jest.resetAllMocks());

  it('lista los reactivos, mostrando "Inactivo" solo en los desactivados', async () => {
    renderPage();

    expect(await screen.findByText('Disfruto reparar aparatos electrónicos.')).toBeInTheDocument();
    expect(screen.getByText('Reactivo desactivado de prueba.')).toBeInTheDocument();
    expect(screen.getAllByText('Inactivo')).toHaveLength(1);
  });

  describe('Escenario 1: crear un reactivo', () => {
    it('crea un reactivo válido y refresca el banco', async () => {
      const user = userEvent.setup();
      adminQuestionService.createQuestion.mockResolvedValue({
        question: reactivo(3, 'Reactivo nuevo de prueba.', 'S'),
      });
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      await user.click(screen.getByRole('button', { name: 'Nuevo reactivo' }));
      await user.type(screen.getByLabelText('Texto del reactivo'), 'Reactivo nuevo de prueba.');
      await user.selectOptions(screen.getByLabelText('Tipo RIASEC'), 'S');

      adminQuestionService.getQuestions.mockResolvedValue({
        questions: [...BANCO, reactivo(3, 'Reactivo nuevo de prueba.', 'S')],
      });
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      await waitFor(() =>
        expect(adminQuestionService.createQuestion).toHaveBeenCalledWith('jwt', {
          text: 'Reactivo nuevo de prueba.',
          riasecType: 'S',
        })
      );
      expect(
        await screen.findByText('Reactivo creado. Ya aparece en el cuestionario.')
      ).toBeInTheDocument();
      expect(await screen.findByText('Reactivo nuevo de prueba.')).toBeInTheDocument();
    });
  });

  describe('Escenario 2: editar un reactivo', () => {
    it('precarga el formulario y guarda los cambios', async () => {
      const user = userEvent.setup();
      adminQuestionService.updateQuestion.mockResolvedValue({
        question: reactivo(1, 'Texto editado.', 'A'),
      });
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      const filaEditar = screen.getAllByRole('button', { name: 'Editar' })[0];
      await user.click(filaEditar);

      expect(screen.getByLabelText('Texto del reactivo')).toHaveValue(
        'Disfruto reparar aparatos electrónicos.'
      );
      expect(screen.getByLabelText('Tipo RIASEC')).toHaveValue('R');

      await user.clear(screen.getByLabelText('Texto del reactivo'));
      await user.type(screen.getByLabelText('Texto del reactivo'), 'Texto editado.');
      await user.selectOptions(screen.getByLabelText('Tipo RIASEC'), 'A');
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      await waitFor(() =>
        expect(adminQuestionService.updateQuestion).toHaveBeenCalledWith('jwt', 1, {
          text: 'Texto editado.',
          riasecType: 'A',
        })
      );
      expect(await screen.findByText('Reactivo actualizado.')).toBeInTheDocument();
    });
  });

  describe('Escenario 3: desactivar un reactivo', () => {
    const getDialog = () => document.querySelector('dialog');

    it('pide confirmación antes de desactivar y explica la consecuencia', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      expect(getDialog().open).toBe(false);

      await user.click(screen.getAllByRole('button', { name: 'Desactivar' })[0]);

      expect(getDialog().open).toBe(true);
      expect(screen.getByText('Desactivar reactivo')).toBeInTheDocument();
      expect(
        screen.getByText(/deja de aparecer en el cuestionario de inmediato/i)
      ).toBeInTheDocument();
      expect(adminQuestionService.deactivateQuestion).not.toHaveBeenCalled();
    });

    it('cancela sin desactivar', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      await user.click(screen.getAllByRole('button', { name: 'Desactivar' })[0]);
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(getDialog().open).toBe(false);
      expect(adminQuestionService.deactivateQuestion).not.toHaveBeenCalled();
    });

    it('al confirmar, desactiva el reactivo y avisa por toast', async () => {
      const user = userEvent.setup();
      adminQuestionService.deactivateQuestion.mockResolvedValue({
        question: reactivo(1, 'Disfruto reparar aparatos electrónicos.', 'R', false),
      });
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      await user.click(screen.getAllByRole('button', { name: 'Desactivar' })[0]);
      adminQuestionService.getQuestions.mockResolvedValue({
        questions: [reactivo(1, 'Disfruto reparar aparatos electrónicos.', 'R', false), BANCO[1]],
      });
      await user.click(screen.getByRole('button', { name: 'Sí, desactivar' }));

      await waitFor(() =>
        expect(adminQuestionService.deactivateQuestion).toHaveBeenCalledWith('jwt', 1)
      );
      expect(
        await screen.findByText('Reactivo desactivado. Ya no aparece en el cuestionario.')
      ).toBeInTheDocument();
      expect(getDialog().open).toBe(false);
    });
  });

  describe('Escenario 5: validación de campos', () => {
    it('muestra errores si se intenta guardar sin texto ni tipo', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Disfruto reparar aparatos electrónicos.');

      await user.click(screen.getByRole('button', { name: 'Nuevo reactivo' }));
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('El texto del reactivo es obligatorio.')).toBeInTheDocument();
      expect(screen.getByText('Elegí un tipo RIASEC.')).toBeInTheDocument();
      expect(adminQuestionService.createQuestion).not.toHaveBeenCalled();
    });
  });
});
