/**
 * Developer Dashboard Types
 * Based on OpenAPI schema: DeveloperMetricsResponse
 */

export interface DeveloperMetricsResponse {
  developerUsername: string;
  repositories: RepositoryStatsDto[];
  commitStats: CommitStatsDto;
  pullRequestStats: PullRequestStatsDto;
  doraMetrics: DeveloperDoraMetricsDto;
}

export interface RepositoryStatsDto {
  repositoryId: number;
  repositoryName: string;
  repositoryUrl: string;
  commitCount: number;
}

export interface CommitStatsDto {
  totalCommits: number;
  repositoryCount: number;
  lastCommitDate: string | null; // ISO 8601 format
  firstCommitDate: string | null; // ISO 8601 format
}

export interface PullRequestStatsDto {
  totalPullRequests: number;
  mergedPullRequests: number;
  openPullRequests: number;
}

export interface DeveloperDoraMetricsDto {
  // Aggregated values
  averageLeadTimeHours: number | null;
  minLeadTimeHours: number | null;
  maxLeadTimeHours: number | null;
  totalDeploymentCount: number;
  deployedCommitCount: number;
  changeFailureRate: number | null; // 0-100 percentage
  failedDeploymentCount: number;
  // Time series
  dailyMetrics: DailyMetricDto[];
}

export interface DailyMetricDto {
  date: string; // YYYY-MM-DD format
  averageLeadTimeHours: number;
  deploymentCount: number;
  commitCount: number;
  failedDeploymentCount: number;
}
