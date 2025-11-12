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
import type { DailyMetricDto } from '@/types/dashboard.types';

interface TimeSeriesChartsProps {
  dailyMetrics: DailyMetricDto[];
}

export function TimeSeriesCharts({ dailyMetrics }: TimeSeriesChartsProps) {
  if (dailyMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500">No hay datos de series de tiempo disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display (YYYY-MM-DD → MM/DD)
  // Parse date as local timezone to avoid UTC offset issues
  const formattedData = dailyMetrics.map((metric) => {
    // Parse YYYY-MM-DD as local date (not UTC)
    const [year, month, day] = metric.date.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    return {
      ...metric,
      dateFormatted: date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      successDeployments: metric.deploymentCount - metric.failedDeploymentCount,
    };
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
            <LineChart data={formattedData}>
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
            <BarChart data={formattedData}>
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
            <BarChart data={formattedData}>
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
    </div>
  );
}
