import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { RepositoriesPage } from './RepositoriesPage';

// Mock del componente RepositoriesTable para aislar la prueba
vi.mock('@/components/RepositoriesTable', () => ({
  RepositoriesTable: vi.fn(({ repositories }) => (
    <div data-testid="mock-repositories-table">
      <span>{repositories.length} repositorios</span>
    </div>
  )),
}));

// Mock de useAuth para simular diferentes roles
vi.mock('@/layouts/AuthenticatedLayout', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/layouts/AuthenticatedLayout';

// Datos de prueba
const mockRepositories = [
  {
    id: 1,
    repositoryUrl: 'https://github.com/org/repo1',
    datadogServiceName: 'service-1',
    deploymentWorkflowFileName: 'deploy.yml',
    owner: 'org',
    repoName: 'repo1',
  },
  {
    id: 2,
    repositoryUrl: 'https://github.com/org/repo2',
    datadogServiceName: null,
    deploymentWorkflowFileName: null,
    owner: 'org',
    repoName: 'repo2',
  },
];

const mockServices = [
  { serviceName: 'service-1' },
  { serviceName: 'service-2' },
];

describe('RepositoriesPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('debe mostrar el estado de carga inicialmente', () => {
    // Mock de usuario sin rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['DEVELOPER'] },
    });

    // Hacemos que fetch nunca se resuelva para mantener el estado de carga
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    render(<RepositoriesPage />);

    expect(screen.getByText(/Cargando repositorios.../i)).toBeInTheDocument();
  });

  test('debe mostrar la tabla de repositorios cuando la petición tiene éxito', async () => {
    // Mock de usuario sin rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['DEVELOPER'] },
    });

    // Simulamos una respuesta exitosa de la API
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(mockRepositories), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<RepositoriesPage />);

    // Esperamos a que el componente mock de la tabla aparezca
    await waitFor(() => {
      expect(screen.getByTestId('mock-repositories-table')).toBeInTheDocument();
    });

    // Verificamos que el mensaje de carga ha desaparecido
    expect(screen.queryByText(/Cargando repositorios.../i)).not.toBeInTheDocument();
    // Verificamos que nuestro mock recibió los datos correctos
    expect(screen.getByText('2 repositorios')).toBeInTheDocument();
  });

  test('debe mostrar un mensaje de error si la petición falla', async () => {
    // Mock de usuario sin rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['DEVELOPER'] },
    });

    // Simulamos una respuesta de error de la API
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('Error del servidor', { status: 500 })
    );

    render(<RepositoriesPage />);

    // Esperamos a que el mensaje de error aparezca
    await waitFor(() => {
      expect(screen.getByText(/Error al obtener los repositorios/i)).toBeInTheDocument();
    });

    // Verificamos que el mensaje de carga y la tabla no están presentes
    expect(screen.queryByText(/Cargando repositorios.../i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-repositories-table')).not.toBeInTheDocument();
  });

  test('debe mostrar mensaje cuando no hay repositorios', async () => {
    // Mock de usuario sin rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['DEVELOPER'] },
    });

    // Simulamos respuesta vacía
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<RepositoriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No hay repositorios configurados/i)).toBeInTheDocument();
    });
  });

  test('debe mostrar el botón de sincronización solo para ADMIN', async () => {
    // Mock de usuario con rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'admin', email: 'admin@test.com', roles: ['ADMIN'] },
    });

    // Mock de fetch para repositories
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url) => {
      if (url.includes('/repositories')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockRepositories), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      if (url.includes('/datadog/services')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockServices), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<RepositoriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sincronizar desde GitHub/i)).toBeInTheDocument();
    });
  });

  test('NO debe mostrar el botón de sincronización para usuarios sin rol ADMIN', async () => {
    // Mock de usuario sin rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'developer', email: 'dev@test.com', roles: ['DEVELOPER'] },
    });

    // Simulamos respuesta exitosa
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify(mockRepositories), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    render(<RepositoriesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-repositories-table')).toBeInTheDocument();
    });

    // Verificamos que el botón de sync NO está presente
    expect(screen.queryByText(/Sincronizar desde GitHub/i)).not.toBeInTheDocument();
  });

  test('debe manejar la sincronización exitosa', async () => {
    // Mock de usuario con rol ADMIN
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: 1, githubUsername: 'admin', email: 'admin@test.com', roles: ['ADMIN'] },
    });

    const mockSyncResult = {
      newRepositories: 3,
      unchanged: 2,
      totalRepositories: 5,
    };

    // Mock de fetch para diferentes endpoints
    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation((url, options) => {
      if (url.includes('/sync') && options?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify(mockSyncResult), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      if (url.includes('/repositories')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockRepositories), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      if (url.includes('/datadog/services')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockServices), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<RepositoriesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Sincronizar desde GitHub/i)).toBeInTheDocument();
    });

    const syncButton = screen.getByText(/Sincronizar desde GitHub/i);
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Sincronización exitosa')
      );
    });
  });
});
