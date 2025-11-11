import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricsOverviewCards } from '@/components/MetricsOverviewCards';
import { DoraMetricsSection } from '@/components/DoraMetricsSection';
import { DeveloperRepositoriesTable } from '@/components/DeveloperRepositoriesTable';
import { TimeSeriesCharts } from '@/components/TimeSeriesCharts';
import type { DeveloperMetricsResponse } from '@/types/dashboard.types';

export default function DeveloperDashboardPage() {
  const [metrics, setMetrics] = useState<DeveloperMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/dashboard/developer/metrics`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: DeveloperMetricsResponse = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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
              No hay datos disponibles. Realiza tu primer commit para ver métricas.
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
