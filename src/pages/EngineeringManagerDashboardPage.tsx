import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsOverviewCards } from '@/components/MetricsOverviewCards';
import { DoraMetricsSectionTechLead } from '@/components/DoraMetricsSectionTechLead';
import { DeveloperRepositoriesTable } from '@/components/DeveloperRepositoriesTable';
import { TimeSeriesChartsTechLead } from '@/components/TimeSeriesChartsTechLead';
import { EngineeringManagerDashboardFilters } from '@/components/EngineeringManagerDashboardFilters';
import type { EngineeringManagerMetricsResponse, TeamMetricsDto } from '@/types/dashboard.types';
import type { TeamDto, TeamMemberDto } from '@/types/user.types';

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

export default function EngineeringManagerDashboardPage() {
  const [metrics, setMetrics] = useState<EngineeringManagerMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store all available data (fetched once, never filtered)
  const [allRepositories, setAllRepositories] = useState<EngineeringManagerMetricsResponse['repositories']>([]);
  const [allTeams, setAllTeams] = useState<TeamDto[]>([]);
  const [allMembers, setAllMembers] = useState<TeamMemberDto[]>([]); // Members from selected teams
  const [teamsWithRepos, setTeamsWithRepos] = useState<TeamMetricsDto[]>([]); // Teams with their repositories

  // Filter states
  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<number[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: defaultRange.from,
    dateTo: defaultRange.to,
    repositoryIds: [] as number[],
    teamIds: [] as number[],
    memberIds: [] as number[],
  });

  // Fetch all teams
  const fetchAllTeams = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/teams`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener equipos');
      }

      const teams: TeamDto[] = await response.json();
      setAllTeams(teams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  }, []);

  const fetchMetrics = useCallback(async (
    startDate: string,
    endDate: string,
    repoIds: number[],
    teamIds: number[],
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
      teamIds.forEach((id) => params.append('teamIds', id.toString()));
      memberIds.forEach((id) => params.append('memberIds', id.toString()));

      const url = `${apiUrl}/api/v1/dashboard/engineering-manager/metrics?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data: EngineeringManagerMetricsResponse = await response.json();
      setMetrics(data);

      // Store all repositories and teams with repos on first fetch (when no filters applied)
      if (allRepositories.length === 0 && data.repositories.length > 0) {
        setAllRepositories(data.repositories);
      }
      if (teamsWithRepos.length === 0 && data.teams.length > 0) {
        setTeamsWithRepos(data.teams);
      }

      // Initialize selected repos and teams if not set
      if (selectedRepositoryIds.length === 0 && data.repositories.length > 0) {
        setSelectedRepositoryIds(data.repositories.map((r) => r.repositoryId));
      }
      if (selectedTeamIds.length === 0 && allTeams.length > 0) {
        setSelectedTeamIds(allTeams.map((t) => t.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [selectedRepositoryIds.length, selectedTeamIds.length, allRepositories.length, allTeams.length, teamsWithRepos.length]);

  // Initial fetch
  useEffect(() => {
    const initDashboard = async () => {
      await fetchAllTeams();
      await fetchMetrics(appliedFilters.dateFrom, appliedFilters.dateTo, appliedFilters.repositoryIds, appliedFilters.teamIds, appliedFilters.memberIds);
    };
    initDashboard();
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      repositoryIds: selectedRepositoryIds,
      teamIds: selectedTeamIds,
      memberIds: selectedMemberIds,
    });
    fetchMetrics(dateFrom, dateTo, selectedRepositoryIds, selectedTeamIds, selectedMemberIds);
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
              No hay datos disponibles. Verifica la configuración de repositorios y equipos.
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
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard de Engineering Manager</h1>
        <p className="text-gray-600">@{metrics.engineeringManagerUsername} - {metrics.totalTeams} equipo(s), {metrics.totalDevelopers} desarrollador(es)</p>
      </div>

      {/* Filters */}
      <EngineeringManagerDashboardFilters
        repositories={allRepositories}
        selectedRepositoryIds={selectedRepositoryIds}
        onRepositoryIdsChange={setSelectedRepositoryIds}
        teams={allTeams}
        selectedTeamIds={selectedTeamIds}
        onTeamIdsChange={setSelectedTeamIds}
        availableMembers={allMembers}
        selectedMemberIds={selectedMemberIds}
        onMemberIdsChange={setSelectedMemberIds}
        onTeamMembersUpdate={setAllMembers}
        teamsWithRepos={teamsWithRepos}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onApplyFilters={handleApplyFilters}
      />

      {/* Overview Cards Row */}
      <MetricsOverviewCards
        commitStats={metrics.aggregatedCommitStats}
        pullRequestStats={metrics.aggregatedPullRequestStats}
        doraMetrics={metrics.aggregatedDoraMetrics}
      />

      {/* DORA Metrics Section (with MTTR) */}
      <DoraMetricsSectionTechLead doraMetrics={metrics.aggregatedDoraMetrics} />

      {/* Time Series Charts (with MTTR) */}
      <TimeSeriesChartsTechLead
        dailyMetrics={metrics.aggregatedDoraMetrics.dailyMetrics}
        dateFrom={appliedFilters.dateFrom}
        dateTo={appliedFilters.dateTo}
      />

      {/* Repositories Table */}
      <DeveloperRepositoriesTable repositories={metrics.repositories} />
    </div>
  );
}
