import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import PasswordField from '../../components/PasswordField';

describe('PasswordField', () => {
  it('oculta la contraseña por defecto', () => {
    render(<PasswordField id="clave" label="Contraseña" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('muestra la contraseña en texto plano al presionar "Mostrar" y vuelve a ocultarla', async () => {
    const user = userEvent.setup();
    render(<PasswordField id="clave" label="Contraseña" value="secreto1" onChange={() => {}} />);

    const boton = screen.getByRole('button', { name: 'Mostrar' });
    expect(boton).toHaveAttribute('aria-pressed', 'false');

    await user.click(boton);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Ocultar' }));

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('muestra el mensaje de ayuda cuando se pasa como prop', () => {
    render(
      <PasswordField
        id="clave"
        label="Contraseña"
        value=""
        onChange={() => {}}
        ayuda="Mínimo 8 caracteres, con letras y números."
      />
    );

    expect(screen.getByText('Mínimo 8 caracteres, con letras y números.')).toBeInTheDocument();
  });

  it('integra el input y el botón de mostrar en su propio contenedor, aislado del texto de ayuda', () => {
    render(
      <PasswordField
        id="clave"
        label="Contraseña"
        value=""
        onChange={() => {}}
        ayuda="Mínimo 8 caracteres, con letras y números."
      />
    );

    const input = screen.getByLabelText('Contraseña');
    const boton = screen.getByRole('button', { name: 'Mostrar' });
    const ayuda = screen.getByText('Mínimo 8 caracteres, con letras y números.');

    expect(input.parentElement).toBe(boton.parentElement);
    expect(input.parentElement).not.toBe(ayuda.parentElement);
  });

  it('muestra el mensaje de error y lo asocia al campo cuando se pasa como prop', () => {
    render(
      <PasswordField
        id="clave"
        label="Contraseña"
        value="abc"
        onChange={() => {}}
        error="Le faltan caracteres: usá al menos 8, mezclando letras y números."
      />
    );

    const input = screen.getByLabelText('Contraseña');
    const mensaje = screen.getByText(
      'Le faltan caracteres: usá al menos 8, mezclando letras y números.'
    );
    expect(input).toHaveAttribute('aria-describedby', mensaje.id);
  });
});
