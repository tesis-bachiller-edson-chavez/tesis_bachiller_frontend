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
  });

  test('debe redirigir al flujo de autorización de GitHub al hacer clic en el botón', () => {
    // Prepara el "espía" para la propiedad href
    const hrefSet = vi.spyOn(window.location, 'href', 'set');

    render(<LoginPage />);

    // Encuentra y haz clic en el botón
    const loginButton = screen.getByRole('button', {
      name: /Iniciar Sesión con GitHub/i,
    });
    fireEvent.click(loginButton);

    // Verifica que se intentó asignar la URL correcta
    expect(hrefSet).toHaveBeenCalledWith('/oauth2/authorization/github');
  });
});
