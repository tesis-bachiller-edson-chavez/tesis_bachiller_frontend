import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('debe obtener y mostrar el nombre de usuario de GitHub del usuario autenticado', async () => {
    const mockUser = {
      id: 12345,
      githubUsername: 'grubhart',
      email: 'user-email@example.com',
      roles: ['ROLE_USER'],
    };
    const mockResponse = new Response(JSON.stringify(mockUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    vi.spyOn(window, 'fetch').mockResolvedValue(mockResponse);

    render(<HomePage />);

    const welcomeMessage = await screen.findByRole('heading', {
      name: /Bienvenido, grubhart/i,
    });

    expect(welcomeMessage).toBeInTheDocument();
    expect(window.fetch).toHaveBeenCalledWith('/api/v1/user/me', { credentials: 'include' });
  });

  test('debe mostrar un mensaje de carga mientras se obtienen los datos', () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(<HomePage />);

    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();
  });

  test('debe mostrar un mensaje de error si la API responde con un error', async () => {
    const mockResponse = new Response(null, { status: 500 });
    vi.spyOn(window, 'fetch').mockResolvedValue(mockResponse);

    render(<HomePage />);

    const errorMessage = await screen.findByRole('heading', {
      name: /No se pudieron cargar los datos del usuario/i,
    });

    expect(errorMessage).toBeInTheDocument();
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error al obtener los datos del usuario');
    });
  });

  test('debe mostrar un mensaje de error si la petición de red falla', async () => {
    const mockError = new Error('Network Error');
    vi.spyOn(window, 'fetch').mockRejectedValue(mockError);

    render(<HomePage />);

    const errorMessage = await screen.findByRole('heading', {
      name: /No se pudieron cargar los datos del usuario/i,
    });

    expect(errorMessage).toBeInTheDocument();
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error de red al obtener los datos del usuario:', mockError);
    });
  });
});
