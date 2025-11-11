import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TeamsPage } from './TeamsPage';

// Mock useAuth
vi.mock('@/layouts/AuthenticatedLayout', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { useAuth } from '@/layouts/AuthenticatedLayout';

// Mock team data
const mockTeams = [
  {
    id: 1,
    name: 'Team Alpha',
    memberCount: 5,
    techLeadCount: 2,
    techLeadIds: [1, 2],
    repositoryCount: 3,
  },
  {
    id: 2,
    name: 'Team Beta',
    memberCount: 3,
    techLeadCount: 0,
    techLeadIds: [],
    repositoryCount: 2,
  },
];

describe('TeamsPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderTeamsPage = () => {
    render(
      <MemoryRouter>
        <TeamsPage />
      </MemoryRouter>
    );
  };

  test('debe mostrar el estado de carga inicialmente', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['ADMIN'] },
    });

    window.fetch = vi.fn(() => new Promise(() => {})) as any;

    renderTeamsPage();

    expect(screen.getByText(/Cargando equipos.../i)).toBeInTheDocument();
  });

  test('debe mostrar la lista de equipos cuando la petición tiene éxito', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, githubUsername: 'admin', email: 'admin@test.com', roles: ['ADMIN'] },
    });

    window.fetch = vi.fn((url) => {
      if (url.includes('/api/v1/teams')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockTeams), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }
      return Promise.reject(new Error('Unknown URL'));
    }) as any;

    renderTeamsPage();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando equipos.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  test('debe mostrar un mensaje de error si la petición falla', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, githubUsername: 'testuser', email: 'test@test.com', roles: ['ADMIN'] },
    });

    window.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 500,
        })
      )
    ) as any;

    renderTeamsPage();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando equipos.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Error al obtener los equipos/i)).toBeInTheDocument();
  });

  test('debe mostrar mensaje cuando no hay equipos', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, githubUsername: 'admin', email: 'admin@test.com', roles: ['ADMIN'] },
    });

    window.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ) as any;

    renderTeamsPage();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando equipos.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No hay equipos configurados/i)).toBeInTheDocument();
  });

  test('debe mostrar el botón de crear equipo solo para ADMIN y ENGINEERING_MANAGER', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        githubUsername: 'admin',
        email: 'admin@test.com',
        roles: ['ADMIN'],
      },
    });

    window.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockTeams), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ) as any;

    renderTeamsPage();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando equipos.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Crear Equipo/i)).toBeInTheDocument();
  });

  test('NO debe mostrar el botón de crear equipo para TECH_LEAD', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        githubUsername: 'techlead',
        email: 'lead@test.com',
        roles: ['TECH_LEAD'],
      },
    });

    window.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(mockTeams), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    ) as any;

    renderTeamsPage();

    await waitFor(() => {
      expect(screen.queryByText(/Cargando equipos.../i)).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/Crear Equipo/i)).not.toBeInTheDocument();
  });

  test('debe mostrar mensaje de error de permisos para usuarios sin acceso', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        githubUsername: 'developer',
        email: 'dev@test.com',
        roles: ['DEVELOPER'],
      },
    });

    renderTeamsPage();

    expect(screen.getByText(/No tienes permisos para ver esta página/i)).toBeInTheDocument();
  });
});
