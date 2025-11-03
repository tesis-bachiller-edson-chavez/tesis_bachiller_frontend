import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('App Routing and Authentication Flow', () => {
  // Suprimimos los errores de consola esperados en las pruebas
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cuando el usuario no está autenticado', () => {
    test('debe renderizar la LoginPage en la ruta raíz', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Verifica que el título y el botón de login están presentes
      expect(screen.getByRole('heading', { name: /Plataforma de Métricas DORA/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Iniciar Sesión con GitHub/i })).toBeInTheDocument();
    });
  });

  describe('cuando el usuario está autenticado', () => {
    test('debe renderizar el Layout y la HomePage en una ruta protegida', async () => {
      // 1. Simulamos la respuesta de la API que ahora vive en el AuthenticatedLayout
      const mockUser = {
        id: 1,
        githubUsername: 'TestUser',
        email: 'test@example.com',
        roles: ['USER'], // Proporcionamos el array de roles para evitar el error
      };
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );

      // 2. Esperamos a que el contenido principal se cargue después del fetch
      // Buscamos el saludo personalizado que viene de la HomePage
      const welcomeMessage = await screen.findByRole('heading', {
        name: /Bienvenido, TestUser/i,
      });
      expect(welcomeMessage).toBeInTheDocument();

      // 3. Verificamos que los elementos del layout también se renderizaron
      // El botón de logout es una buena señal de que el layout está presente
      const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
      expect(logoutButton).toBeInTheDocument();

      // Verificamos que la llamada a la API se hizo correctamente
      expect(window.fetch).toHaveBeenCalledWith('/api/v1/users/me', { credentials: 'include' });
    });

    test('debe mostrar el enlace de admin si el usuario tiene el rol ADMIN', async () => {
      const mockAdminUser = {
        id: 2,
        githubUsername: 'AdminUser',
        email: 'admin@example.com',
        roles: ['ADMIN', 'USER'],
      };
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockAdminUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );

      // Esperamos a que el enlace de "Gestión de Usuarios" aparezca en el SideNav
      const adminLink = await screen.findByRole('link', { name: /Gestión de Usuarios/i });
      expect(adminLink).toBeInTheDocument();
    });

    test('NO debe mostrar el enlace de admin si el usuario no tiene el rol ADMIN', async () => {
      const mockRegularUser = {
        id: 3,
        githubUsername: 'RegularUser',
        email: 'user@example.com',
        roles: ['USER'],
      };
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(mockRegularUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      render(
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      );

      // Esperamos a que la página se cargue (buscando el saludo)
      await screen.findByRole('heading', { name: /Bienvenido, RegularUser/i });

      // Verificamos que el enlace de admin NO está presente
      const adminLink = screen.queryByRole('link', { name: /Gestión de Usuarios/i });
      expect(adminLink).not.toBeInTheDocument();
    });
  });
});
