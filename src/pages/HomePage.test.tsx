import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useAuth } from '@/layouts/AuthenticatedLayout';

// Hacemos un mock del hook useAuth para poder controlarlo en las pruebas
vi.mock('@/layouts/AuthenticatedLayout', () => ({
  useAuth: vi.fn(),
}));

describe('HomePage', () => {
  test('debe mostrar un saludo personalizado cuando hay un usuario autenticado', () => {
    // Simulamos que el hook useAuth devuelve un usuario
    const mockUser = {
      id: 1,
      githubUsername: 'grubhart',
      email: 'test@example.com',
      roles: ['ADMIN'],
    };
    (useAuth as vi.Mock).mockReturnValue({ user: mockUser });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Comprobamos que el saludo personalizado se renderiza
    const welcomeMessage = screen.getByRole('heading', {
      name: /Bienvenido, grubhart/i,
    });
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('debe mostrar un saludo genérico cuando no hay un usuario autenticado', () => {
    // Simulamos que el hook useAuth devuelve un usuario nulo
    (useAuth as vi.Mock).mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Comprobamos que se renderiza el saludo genérico
    const welcomeMessage = screen.getByRole('heading', {
      name: /Bienvenido/i,
    });
    expect(welcomeMessage).toBeInTheDocument();
    // Nos aseguramos de que NO se muestre un nombre de usuario
    expect(screen.queryByText(/, /)).not.toBeInTheDocument();
  });
});
