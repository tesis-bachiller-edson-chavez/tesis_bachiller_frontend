import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthenticatedLayout } from './AuthenticatedLayout';

describe('AuthenticatedLayout', () => {
  const originalLocation = window.location;
  const originalFetch = window.fetch;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '', assign: vi.fn() }, // `assign` ya es un mock
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock sessionStorage para evitar redirección automática en tests
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'initialRedirectDone') return 'true';
      return null;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation });
    window.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const renderLayoutWithTestRoute = () => {
    render(
      <MemoryRouter initialEntries={['/test-route']}>
        <Routes>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/test-route" element={<div>Contenido de prueba</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  test('debe renderizar un botón de logout y redirigir al hacer clic con una respuesta exitosa', async () => {
    // Mock para responder tanto a /api/v1/users/me como a /logout
    window.fetch = vi.fn((url) => {
      if (url.includes('/api/v1/users/me')) {
        // Respuesta exitosa del usuario autenticado
        return Promise.resolve(
          new Response(JSON.stringify({ id: 1, githubUsername: 'test', email: 'test@test.com', roles: ['DEVELOPER'] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // Respuesta exitosa del logout
      return Promise.resolve(new Response(null, { status: 200 }));
    }) as any;

    renderLayoutWithTestRoute();

    // Esperar a que cargue el usuario
    await waitFor(() => {
      expect(screen.queryByText(/Cargando.../i)).not.toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    // Verificar que se llamó al logout con credentials
    expect(window.fetch).toHaveBeenCalledWith('/logout', { method: 'POST', credentials: 'include' });

    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });
  });

  test('debe mostrar un error en la consola si la respuesta de logout no es ok', async () => {
    // Mock para responder tanto a /api/v1/users/me como a /logout
    window.fetch = vi.fn((url) => {
      if (url.includes('/api/v1/users/me')) {
        // Respuesta exitosa del usuario autenticado
        return Promise.resolve(
          new Response(JSON.stringify({ id: 1, githubUsername: 'test', email: 'test@test.com', roles: ['DEVELOPER'] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // Respuesta de error del logout
      return Promise.resolve(new Response(null, { status: 500 }));
    }) as any;

    renderLayoutWithTestRoute();

    // Esperar a que cargue el usuario
    await waitFor(() => {
      expect(screen.queryByText(/Cargando.../i)).not.toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('El logout ha fallado en el servidor');
    });
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  test('debe mostrar un error en la consola si fetch lanza una excepción', async () => {
    const mockError = new Error('Network Error');
    let callCount = 0;

    // Mock para que la primera llamada tenga éxito y la segunda falle
    window.fetch = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // Primera llamada a /api/v1/users/me exitosa
        return Promise.resolve(
          new Response(JSON.stringify({ id: 1, githubUsername: 'test', email: 'test@test.com', roles: ['DEVELOPER'] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      // Segunda llamada (logout) lanza error
      return Promise.reject(mockError);
    }) as any;

    renderLayoutWithTestRoute();

    // Esperar a que cargue el usuario
    await waitFor(() => {
      expect(screen.queryByText(/Cargando.../i)).not.toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error de red durante el logout:', mockError);
    });
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
