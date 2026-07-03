import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  it('sin sesión, redirige a la pantalla de inicio de sesión', async () => {
    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /entrá a tu cuenta/i })).toBeInTheDocument()
    );
  });

  it('muestra siempre el logo de la marca', async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByRole('link', { name: /brújula/i })).toBeInTheDocument());
  });
});
