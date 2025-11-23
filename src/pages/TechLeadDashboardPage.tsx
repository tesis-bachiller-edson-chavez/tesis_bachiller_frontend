import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsOverviewCards } from '@/components/MetricsOverviewCards';
import { DoraMetricsSectionTechLead } from '@/components/DoraMetricsSectionTechLead';
import { DeveloperRepositoriesTable } from '@/components/DeveloperRepositoriesTable';
import { TimeSeriesChartsTechLead } from '@/components/TimeSeriesChartsTechLead';
import { TechLeadDashboardFilters } from '@/components/TechLeadDashboardFilters';
import type { TechLeadMetricsResponse } from '@/types/dashboard.types';

// Helper to get date in YYYY-MM-DD format
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(today.getDate() - 30);

  return {
    from: formatDate(oneMonthAgo),
    to: formatDate(today),
  };
};

export default function TechLeadDashboardPage() {
  const [metrics, setMetrics] = useState<TechLeadMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store all available repositories and members (fetched once, never filtered)
  const [allRepositories, setAllRepositories] = useState<TechLeadMetricsResponse['repositories']>([]);
  const [allMembers, setAllMembers] = useState<TechLeadMetricsResponse['teamMembers']>([]);

  // Filter states
  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<number[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: defaultRange.from,
    dateTo: defaultRange.to,
    repositoryIds: [] as number[],
    memberIds: [] as number[],
  });

  const fetchMetrics = useCallback(async (
    startDate: string,
    endDate: string,
    repoIds: number[],
    memberIds: number[]
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
      memberIds.forEach((id) => params.append('memberIds', id.toString()));

      const url = `${apiUrl}/api/v1/dashboard/tech-lead/metrics?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data: TechLeadMetricsResponse = await response.json();
      setMetrics(data);

      // Store all repositories and members on first fetch (when no filters applied)
      if (allRepositories.length === 0 && data.repositories.length > 0) {
        setAllRepositories(data.repositories);
      }
      if (allMembers.length === 0 && data.teamMembers.length > 0) {
        setAllMembers(data.teamMembers);
      }

      // Initialize selected repos and members if not set
      if (selectedRepositoryIds.length === 0 && data.repositories.length > 0) {
        setSelectedRepositoryIds(data.repositories.map((r) => r.repositoryId));
      }
      if (selectedMemberIds.length === 0 && data.teamMembers.length > 0) {
        setSelectedMemberIds(data.teamMembers.map((m) => m.userId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedRepositoryIds.length, selectedMemberIds.length, allRepositories.length, allMembers.length]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics(appliedFilters.dateFrom, appliedFilters.dateTo, appliedFilters.repositoryIds, appliedFilters.memberIds);
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      repositoryIds: selectedRepositoryIds,
      memberIds: selectedMemberIds,
    });
    fetchMetrics(dateFrom, dateTo, selectedRepositoryIds, selectedMemberIds);
  };


  if (loading) {
    return <div className="p-6">Cargando métricas...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">
              No hay datos disponibles. Verifica la configuración de repositorios y despliega el primer commit del equipo para ver métricas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard de Tech Lead</h1>
        <p className="text-gray-600">@{metrics.techLeadUsername} - {metrics.teamName}</p>
      </div>

      {/* Filters */}
      <TechLeadDashboardFilters
        repositories={allRepositories}
        selectedRepositoryIds={selectedRepositoryIds}
        onRepositoryIdsChange={setSelectedRepositoryIds}
        teamMembers={allMembers}
        selectedMemberIds={selectedMemberIds}
        onMemberIdsChange={setSelectedMemberIds}
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

      {/* DORA Metrics Section (with MTTR) */}
      <DoraMetricsSectionTechLead doraMetrics={metrics.doraMetrics} />

      {/* Time Series Charts (with MTTR) */}
      <TimeSeriesChartsTechLead
        dailyMetrics={metrics.doraMetrics.dailyMetrics}
        dateFrom={appliedFilters.dateFrom}
        dateTo={appliedFilters.dateTo}
      />

      {/* Repositories Table */}
      <DeveloperRepositoriesTable repositories={metrics.repositories} />
    </div>
  );
}