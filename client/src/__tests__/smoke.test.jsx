import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('App', () => {
  it('renderiza el título del proyecto', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /brújula vocacional/i })).toBeInTheDocument();
  });
});
