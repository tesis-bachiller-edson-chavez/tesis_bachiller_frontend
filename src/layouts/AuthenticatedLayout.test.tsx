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
    window.fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))) as any;

    renderLayoutWithTestRoute();

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    expect(window.fetch).toHaveBeenCalledWith('/logout', { method: 'POST' });

    await waitFor(() => {
      // Verificamos directamente el mock, sin necesidad de un espía adicional
      expect(window.location.assign).toHaveBeenCalledWith('/');
    });
  });

  test('debe mostrar un error en la consola si la respuesta de logout no es ok', async () => {
    window.fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 500 }))) as any;

    renderLayoutWithTestRoute();

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('El logout ha fallado en el servidor');
    });
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  test('debe mostrar un error en la consola si fetch lanza una excepción', async () => {
    const mockError = new Error('Network Error');
    window.fetch = vi.fn(() => Promise.reject(mockError)) as any;

    renderLayoutWithTestRoute();

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error de red durante el logout:', mockError);
    });
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
