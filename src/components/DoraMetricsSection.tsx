import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DeveloperDoraMetricsDto } from '@/types/dashboard.types';

type DoraLevel = 'Elite' | 'High' | 'Medium' | 'Low';

interface DoraMetricsSectionProps {
  doraMetrics: DeveloperDoraMetricsDto;
}

function DoraPerformanceBadge({ level }: { level: DoraLevel }) {
  const colors: Record<DoraLevel, string> = {
    Elite: 'bg-green-500',
    High: 'bg-blue-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-red-500',
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded text-xs font-semibold text-white ${colors[level]}`}
    >
      {level}
    </span>
  );
}

function getLeadTimeLevel(averageLeadTimeHours: number | null): DoraLevel {
  if (averageLeadTimeHours === null) return 'Low';
  if (averageLeadTimeHours < 24) return 'Elite'; // < 1 day
  if (averageLeadTimeHours < 168) return 'High'; // < 1 week (7 days)
  if (averageLeadTimeHours < 720) return 'Medium'; // < 1 month (30 days)
  return 'Low';
}

function getDeploymentFrequencyLevel(
  totalDeployments: number,
  dailyMetricsCount: number
): DoraLevel {
  if (dailyMetricsCount === 0) return 'Low';
  const deploymentsPerDay = totalDeployments / dailyMetricsCount;
  if (deploymentsPerDay >= 1) return 'Elite'; // >= 1 per day
  if (deploymentsPerDay >= 1 / 7) return 'High'; // >= 1 per week
  if (deploymentsPerDay >= 1 / 30) return 'Medium'; // >= 1 per month
  return 'Low';
}

function getChangeFailureRateLevel(changeFailureRate: number | null): DoraLevel {
  if (changeFailureRate === null) return 'Low';
  if (changeFailureRate < 15) return 'Elite';
  if (changeFailureRate < 30) return 'High';
  if (changeFailureRate < 45) return 'Medium';
  return 'Low';
}

export function DoraMetricsSection({ doraMetrics }: DoraMetricsSectionProps) {
  const leadTimeLevel = getLeadTimeLevel(doraMetrics.averageLeadTimeHours);
  const deploymentLevel = getDeploymentFrequencyLevel(
    doraMetrics.totalDeploymentCount,
    doraMetrics.dailyMetrics.length
  );
  const cfrLevel = getChangeFailureRateLevel(doraMetrics.changeFailureRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Lead Time for Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lead Time for Changes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Clasificación:</span>
            <DoraPerformanceBadge level={leadTimeLevel} />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {doraMetrics.averageLeadTimeHours !== null
                ? `${doraMetrics.averageLeadTimeHours.toFixed(1)} hrs`
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Promedio</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Min:</span>
              <span className="font-medium">
                {doraMetrics.minLeadTimeHours !== null
                  ? `${doraMetrics.minLeadTimeHours.toFixed(1)} hrs`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max:</span>
              <span className="font-medium">
                {doraMetrics.maxLeadTimeHours !== null
                  ? `${doraMetrics.maxLeadTimeHours.toFixed(1)} hrs`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Deployment Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Clasificación:</span>
            <DoraPerformanceBadge level={deploymentLevel} />
          </div>
          <div>
            <p className="text-2xl font-bold">{doraMetrics.totalDeploymentCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total Deployments</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Commits Deployed:</span>
              <span className="font-medium">{doraMetrics.deployedCommitCount}</span>
            </div>
            {doraMetrics.dailyMetrics.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Frecuencia:</span>
                <span className="font-medium">
                  {(doraMetrics.totalDeploymentCount / doraMetrics.dailyMetrics.length).toFixed(
                    2
                  )}{' '}
                  /día
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Failure Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Change Failure Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Clasificación:</span>
            <DoraPerformanceBadge level={cfrLevel} />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {doraMetrics.changeFailureRate !== null
                ? `${doraMetrics.changeFailureRate.toFixed(1)}%`
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tasa de Fallo</p>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Failed:</span>
              <span className="font-medium text-red-600">
                {doraMetrics.failedDeploymentCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{doraMetrics.totalDeploymentCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
