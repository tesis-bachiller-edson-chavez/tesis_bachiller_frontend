import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamDailyMetricDto } from '@/types/dashboard.types';

interface TimeSeriesChartsTechLeadProps {
  dailyMetrics: TeamDailyMetricDto[];
  dateFrom?: string;
  dateTo?: string;
}

export function TimeSeriesChartsTechLead({ dailyMetrics, dateFrom, dateTo }: TimeSeriesChartsTechLeadProps) {
  // Helper to get all dates in range
  const getAllDatesInRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Get date range - use filter dates if provided, otherwise use data range
  let minDate: string;
  let maxDate: string;

  if (dateFrom && dateTo) {
    minDate = dateFrom;
    maxDate = dateTo;
  } else if (dailyMetrics.length > 0) {
    const sortedMetrics = [...dailyMetrics].sort((a, b) => a.date.localeCompare(b.date));
    minDate = sortedMetrics[0].date;
    maxDate = sortedMetrics[sortedMetrics.length - 1].date;
  } else {
    // No data and no filter - show empty state
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500">No hay datos de series de tiempo disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  const allDates = getAllDatesInRange(minDate, maxDate);

  // Create a map of existing metrics
  const metricsMap = new Map(dailyMetrics.map(m => [m.date, m]));

  // Fill in missing dates with zero/null values
  const completeData = allDates.map((date) => {
    const existing = metricsMap.get(date);

    // Parse date for formatting
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateFormatted = dateObj.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });

    if (existing) {
      return {
        ...existing,
        dateFormatted,
        successDeployments: existing.deploymentCount - existing.failedDeploymentCount,
        // Convertir null a 0 para mantener línea continua
        averageMTTRHours: existing.averageMTTRHours ?? 0,
      };
    } else {
      // Fill missing day with zeros
      return {
        date,
        dateFormatted,
        averageLeadTimeHours: 0,
        deploymentCount: 0,
        commitCount: 0,
        failedDeploymentCount: 0,
        successDeployments: 0,
        averageMTTRHours: 0, // Cambiado de null a 0 para mantener línea continua
        resolvedIncidentCount: 0,
      };
    }
  });

  return (
    <div className="space-y-6">
      {/* Lead Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Time for Changes (Diario)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageLeadTimeHours"
                stroke="#3b82f6"
                name="Lead Time (hrs)"
                strokeWidth={2}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deployment Frequency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Frequency (Diario)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis label={{ value: 'Deployments', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="deploymentCount" fill="#10b981" name="Deployments" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Change Failure Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Change Failure Rate (Diario)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis label={{ value: 'Deployments', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="successDeployments"
                stackId="a"
                fill="#10b981"
                name="Success"
              />
              <Bar
                dataKey="failedDeploymentCount"
                stackId="a"
                fill="#ef4444"
                name="Failed"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MTTR Chart - NEW */}
      <Card>
        <CardHeader>
          <CardTitle>Mean Time to Recover (Diario)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateFormatted" />
              <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageMTTRHours"
                stroke="#f59e0b"
                name="MTTR (hrs)"
                strokeWidth={2}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}