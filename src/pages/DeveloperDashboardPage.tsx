import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsOverviewCards } from '@/components/MetricsOverviewCards';
import { DoraMetricsSection } from '@/components/DoraMetricsSection';
import { DeveloperRepositoriesTable } from '@/components/DeveloperRepositoriesTable';
import { TimeSeriesCharts } from '@/components/TimeSeriesCharts';
import { DashboardFilters } from '@/components/DashboardFilters';
import type { DeveloperMetricsResponse } from '@/types/dashboard.types';

// Helper to get date in YYYY-MM-DD format
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get default date range (last 90 days)
const getDefaultDateRange = () => {
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  return {
    from: formatDate(ninetyDaysAgo),
    to: formatDate(today),
  };
};

export default function DeveloperDashboardPage() {
  const [metrics, setMetrics] = useState<DeveloperMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store all available repositories (fetched once, never filtered)
  const [allRepositories, setAllRepositories] = useState<DeveloperMetricsResponse['repositories']>([]);

  // Filter states
  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: defaultRange.from,
    dateTo: defaultRange.to,
    repositoryIds: [] as number[],
  });

  const fetchMetrics = useCallback(async (
    startDate: string,
    endDate: string,
    repoIds: number[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      repoIds.forEach((id) => params.append('repositoryIds', id.toString()));

      const url = `${apiUrl}/api/v1/dashboard/developer/metrics?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data: DeveloperMetricsResponse = await response.json();
      setMetrics(data);

      // Store all repositories on first fetch (when no filters applied)
      if (allRepositories.length === 0 && data.repositories.length > 0) {
        setAllRepositories(data.repositories);
      }

      // Initialize selected repos if not set
      if (selectedRepositoryIds.length === 0 && data.repositories.length > 0) {
        setSelectedRepositoryIds(data.repositories.map((r) => r.repositoryId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedRepositoryIds.length, allRepositories.length]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics(appliedFilters.dateFrom, appliedFilters.dateTo, appliedFilters.repositoryIds);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      repositoryIds: selectedRepositoryIds,
    });
    fetchMetrics(dateFrom, dateTo, selectedRepositoryIds);
  };


  if (loading) {
    return <div className="p-6">Cargando métricas...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!metrics || metrics.commitStats.totalCommits === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">
              No hay datos disponibles. Verifica la configuracion de repositorios y despliega tu primer commit para ver métricas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Desarrollador</h1>
        <p className="text-gray-600">@{metrics.developerUsername}</p>
      </div>

      {/* Filters */}
      <DashboardFilters
        repositories={allRepositories}
        selectedRepositoryIds={selectedRepositoryIds}
        onRepositoryIdsChange={setSelectedRepositoryIds}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApplyFilters={handleApplyFilters}
      />

      {/* Overview Cards Row */}
      <MetricsOverviewCards
        commitStats={metrics.commitStats}
        pullRequestStats={metrics.pullRequestStats}
        doraMetrics={metrics.doraMetrics}
      />

      {/* DORA Metrics Section */}
      <DoraMetricsSection doraMetrics={metrics.doraMetrics} />

      {/* Time Series Charts */}
      <TimeSeriesCharts dailyMetrics={metrics.doraMetrics.dailyMetrics} />

      {/* Repositories Table */}
      <DeveloperRepositoriesTable repositories={metrics.repositories} />
    </div>
  );
}
