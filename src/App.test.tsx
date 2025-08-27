import { render, screen} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('App Routing', () => {
  describe('dado que el usuario no está autenticado', () => {
    test('debe renderizar la página de bienvenida en la ruta raíz', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      const mainHeading = screen.getByRole('heading', {
        name: /Plataforma de Métricas DORA/i,
      });
      expect(mainHeading).toBeInTheDocument();

      const loginButton = screen.getByRole('button', {
        name: /Iniciar Sesión con GitHub/i,
      });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('dado que el usuario está autenticado', () => {
    beforeEach(() => {
      // Mock fetch para simular una respuesta exitosa de la API de usuario
      const mockUser = { githubUsername: 'Test User' };
      const mockResponse = new Response(JSON.stringify(mockUser), { status: 200 });
      vi.spyOn(window, 'fetch').mockResolvedValue(mockResponse);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('debe renderizar la HomePage y el Layout para una ruta protegida', async () => {
      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );

      // Esperamos a que el saludo personalizado (que depende del fetch) aparezca
      const homeHeading = await screen.findByRole('heading', {
        name: /Bienvenido, Test User/i,
      });
      expect(homeHeading).toBeInTheDocument();

      // También verificamos que un elemento del layout persistente esté presente.
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });
  });
});
