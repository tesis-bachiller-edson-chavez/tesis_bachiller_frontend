import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location para poder espiar los cambios
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterEach(() => {
    // Restaura el window.location original después de cada test
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    // Limpia todos los mocks y stubs después de cada test
    vi.restoreAllMocks();
  });

  test('debe redirigir al flujo de autorización de GitHub al hacer clic en el botón', () => {
    // 1. Define y simula la variable de entorno para este test
    const MOCK_API_URL = 'https://api.test.com';
    vi.stubEnv('VITE_API_BASE_URL', MOCK_API_URL);

    // 2. Prepara el "espía" para la propiedad href
    const hrefSet = vi.spyOn(window.location, 'href', 'set');

    render(<LoginPage />);

    // 3. Encuentra y haz clic en el botón
    const loginButton = screen.getByRole('button', {
      name: /Iniciar Sesión con GitHub/i,
    });
    fireEvent.click(loginButton);

    // 4. Verifica que se intentó asignar la URL completa y correcta
    const expectedUrl = `${MOCK_API_URL}/oauth2/authorization/github`;
    expect(hrefSet).toHaveBeenCalledWith(expectedUrl);
  });
});
