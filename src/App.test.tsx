import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, test, expect } from 'vitest';

describe('App Routing', () => {
  test('should render LoginPage for the root path when user is not authenticated', () => {
    // Paso 1: Renderizar el componente principal de la aplicación,
    // envolviéndolo en MemoryRouter para simular la navegación.
    // Se especifica que la ruta inicial es '/'
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Paso 2: Buscar un elemento distintivo de la página de Login.
    // Usamos getByRole para buscar un encabezado (h1, h2, etc.) con el texto "Login Page".
    // La opción /i hace que la búsqueda no distinga mayúsculas de minúsculas.
    const loginHeading = screen.getByRole('heading', { name: /login page/i });

    // Paso 3: Afirmar que el encabezado existe en el documento.
    // Este test fallará porque el App.tsx actual no renderiza esto.
    expect(loginHeading).toBeInTheDocument();
  });
});
