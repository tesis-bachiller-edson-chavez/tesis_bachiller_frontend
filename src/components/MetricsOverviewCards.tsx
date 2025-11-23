import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  CommitStatsDto,
  PullRequestStatsDto,
  DeveloperDoraMetricsDto,
} from '@/types/dashboard.types';

interface MetricsOverviewCardsProps {
  commitStats: CommitStatsDto;
  pullRequestStats: PullRequestStatsDto;
  doraMetrics: DeveloperDoraMetricsDto;
}

export function MetricsOverviewCards({
  commitStats,
  pullRequestStats,
  doraMetrics,
}: MetricsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
      {/* Total Commits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">Commits Desplegados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{commitStats.totalCommits}</p>
          <p className="text-xs text-gray-500 mt-1">
            En {commitStats.repositoryCount} repositorio(s)
          </p>
        </CardContent>
      </Card>

      {/* Pull Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">Pull Requests Desplegados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{pullRequestStats.totalPullRequests}</p>
          <p className="text-xs text-gray-500 mt-1">
            {pullRequestStats.mergedPullRequests} merged,{' '}
            {pullRequestStats.openPullRequests} open
          </p>
        </CardContent>
      </Card>

      {/* Average Lead Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Lead Time Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {(doraMetrics.averageLeadTimeHours ?? 0).toFixed(1)} hrs
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Min: {(doraMetrics.minLeadTimeHours ?? 0).toFixed(1)} | Max:{' '}
            {(doraMetrics.maxLeadTimeHours ?? 0).toFixed(1)}
          </p>
        </CardContent>
      </Card>

      {/* Deployment Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{doraMetrics.totalDeploymentCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {doraMetrics.deployedCommitCount} commits desplegados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
