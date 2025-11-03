import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserManagementPage } from './UserManagementPage';

// 1. Hacemos un mock del componente UsersTable para aislar la prueba
vi.mock('@/components/UsersTable', () => ({
  UsersTable: vi.fn(({ users }) => (
    <div data-testid="mock-users-table">
      {/* Simulamos la visualización de los usuarios para verificar que se pasan las props */}
      <span>{users.length} usuarios</span>
    </div>
  )),
}));

// Datos de prueba
const mockUsers = [
  { githubUsername: 'user1', name: 'User One', avatarUrl: '' },
  { githubUsername: 'user2', name: 'User Two', avatarUrl: '' },
];

describe('UserManagementPage', () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    vi.spyOn(window, 'fetch');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('debe mostrar el estado de carga inicialmente', () => {
    // Hacemos que fetch nunca se resuelva para mantener el estado de carga
    (window.fetch as vi.Mock).mockImplementation(() => new Promise(() => {}));

    render(<UserManagementPage />);

    expect(screen.getByText(/Cargando usuarios.../i)).toBeInTheDocument();
  });

  test('debe mostrar la tabla de usuarios cuando la petición tiene éxito', async () => {
    // Simulamos una respuesta exitosa de la API
    (window.fetch as vi.Mock).mockResolvedValue(
      new Response(JSON.stringify(mockUsers), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<UserManagementPage />);

    // Esperamos a que el componente mock de la tabla aparezca
    await waitFor(() => {
      expect(screen.getByTestId('mock-users-table')).toBeInTheDocument();
    });

    // Verificamos que el mensaje de carga ha desaparecido
    expect(screen.queryByText(/Cargando usuarios.../i)).not.toBeInTheDocument();
    // Verificamos que nuestro mock recibió los datos correctos
    expect(screen.getByText('2 usuarios')).toBeInTheDocument();
  });

  test('debe mostrar un mensaje de error si la petición falla', async () => {
    // Simulamos una respuesta de error de la API
    (window.fetch as vi.Mock).mockResolvedValue(
      new Response('Error del servidor', { status: 500 })
    );

    render(<UserManagementPage />);

    // Esperamos a que el mensaje de error aparezca
    await waitFor(() => {
      expect(screen.getByText(/Error al obtener los usuarios/i)).toBeInTheDocument();
    });

    // Verificamos que el mensaje de carga y la tabla no están presentes
    expect(screen.queryByText(/Cargando usuarios.../i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-users-table')).not.toBeInTheDocument();
  });
});
