import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EscalaRespuesta from '../../components/EscalaRespuesta';

describe('EscalaRespuesta', () => {
  it('renderiza un radiogroup con cinco opciones del 1 al 5', () => {
    render(<EscalaRespuesta name="p1" value={undefined} onChange={() => {}} />);

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('rotula los extremos de forma accesible', () => {
    render(<EscalaRespuesta name="p1" value={undefined} onChange={() => {}} />);

    expect(screen.getByRole('radio', { name: '1 · Nada que ver conmigo' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '5 · Totalmente yo' })).toBeInTheDocument();
  });

  it('marca la opción seleccionada según value', () => {
    render(<EscalaRespuesta name="p1" value={4} onChange={() => {}} />);

    expect(screen.getByRole('radio', { name: '4' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '5 · Totalmente yo' })).not.toBeChecked();
  });

  it('llama onChange con el número elegido al hacer clic', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<EscalaRespuesta name="p1" value={undefined} onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: '3' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
