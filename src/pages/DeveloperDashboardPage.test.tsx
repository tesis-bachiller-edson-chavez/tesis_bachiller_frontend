import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import DeveloperDashboardPage from './DeveloperDashboardPage';

// Mock sub-components
vi.mock('@/components/MetricsOverviewCards', () => ({
  MetricsOverviewCards: () => <div>MetricsOverviewCards</div>,
}));

vi.mock('@/components/DoraMetricsSection', () => ({
  DoraMetricsSection: () => <div>DoraMetricsSection</div>,
}));

vi.mock('@/components/TimeSeriesCharts', () => ({
  TimeSeriesCharts: () => <div>TimeSeriesCharts</div>,
}));

vi.mock('@/components/DeveloperRepositoriesTable', () => ({
  DeveloperRepositoriesTable: () => <div>DeveloperRepositoriesTable</div>,
}));

describe('DeveloperDashboardPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    vi.spyOn(window, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <DeveloperDashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cargando métricas.../i)).toBeInTheDocument();
  });

  it('should fetch and display metrics successfully', async () => {
    const mockData = {
      developerUsername: 'john_doe',
      repositories: [
        {
          repositoryId: 1,
          repositoryName: 'test-repo',
          repositoryUrl: 'https://github.com/org/test-repo',
          commitCount: 10,
        },
      ],
      commitStats: {
        totalCommits: 10,
        repositoryCount: 1,
        lastCommitDate: '2025-11-11T10:00:00',
        firstCommitDate: '2025-11-01T10:00:00',
      },
      pullRequestStats: {
        totalPullRequests: 5,
        mergedPullRequests: 4,
        openPullRequests: 1,
      },
      doraMetrics: {
        averageLeadTimeHours: 12.5,
        minLeadTimeHours: 5.0,
        maxLeadTimeHours: 20.0,
        totalDeploymentCount: 5,
        deployedCommitCount: 10,
        changeFailureRate: 20.0,
        failedDeploymentCount: 1,
        dailyMetrics: [],
      },
    };

    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(
      <BrowserRouter>
        <DeveloperDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Dashboard de Desarrollador/i)).toBeInTheDocument();
      expect(screen.getByText(/@john_doe/i)).toBeInTheDocument();
      expect(screen.getByText(/MetricsOverviewCards/i)).toBeInTheDocument();
      expect(screen.getByText(/DoraMetricsSection/i)).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <DeveloperDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no commits', async () => {
    const mockData = {
      developerUsername: 'new_developer',
      repositories: [],
      commitStats: {
        totalCommits: 0,
        repositoryCount: 0,
        lastCommitDate: null,
        firstCommitDate: null,
      },
      pullRequestStats: {
        totalPullRequests: 0,
        mergedPullRequests: 0,
        openPullRequests: 0,
      },
      doraMetrics: {
        averageLeadTimeHours: null,
        minLeadTimeHours: null,
        maxLeadTimeHours: null,
        totalDeploymentCount: 0,
        deployedCommitCount: 0,
        changeFailureRate: null,
        failedDeploymentCount: 0,
        dailyMetrics: [],
      },
    };

    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    render(
      <BrowserRouter>
        <DeveloperDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
    });
  });
});
