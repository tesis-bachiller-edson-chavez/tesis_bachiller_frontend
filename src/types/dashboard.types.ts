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

/**
 * Tech Lead Dashboard Types
 * Based on OpenAPI schema: TechLeadMetricsResponse
 */

export interface TechLeadMetricsResponse {
  techLeadUsername: string;
  teamId: number;
  teamName: string;
  teamMembers: TeamMemberStatsDto[];
  repositories: RepositoryStatsDto[];
  commitStats: CommitStatsDto;
  pullRequestStats: PullRequestStatsDto;
  doraMetrics: TeamDoraMetricsDto;
}

export interface TeamMemberStatsDto {
  userId: number;
  githubUsername: string;
  name: string;
  email: string;
  totalCommits: number;
  totalPullRequests: number;
  mergedPullRequests: number;
  averageLeadTimeHours: number | null;
  deploymentCount: number;
}

export interface TeamDoraMetricsDto {
  // Aggregated values
  averageLeadTimeHours: number | null;
  minLeadTimeHours: number | null;
  maxLeadTimeHours: number | null;
  totalDeploymentCount: number;
  deployedCommitCount: number;
  changeFailureRate: number | null; // 0-100 percentage
  failedDeploymentCount: number;
  // MTTR metrics (new for Tech Lead)
  averageMTTRHours: number | null;
  minMTTRHours: number | null;
  maxMTTRHours: number | null;
  totalResolvedIncidents: number;
  // Time series
  dailyMetrics: TeamDailyMetricDto[];
}

export interface TeamDailyMetricDto {
  date: string; // YYYY-MM-DD format
  averageLeadTimeHours: number;
  deploymentCount: number;
  commitCount: number;
  failedDeploymentCount: number;
  averageMTTRHours: number | null;
  resolvedIncidentCount: number;
}

/**
 * Engineering Manager Dashboard Types
 * Based on OpenAPI schema: EngineeringManagerMetricsResponse
 */

export interface EngineeringManagerMetricsResponse {
  engineeringManagerUsername: string;
  totalTeams: number;
  totalDevelopers: number;
  teams: TeamMetricsDto[];
  repositories: RepositoryStatsDto[];
  aggregatedCommitStats: CommitStatsDto;
  aggregatedPullRequestStats: PullRequestStatsDto;
  aggregatedDoraMetrics: TeamDoraMetricsDto;
}

export interface TeamMetricsDto {
  teamId: number;
  teamName: string;
  memberCount: number;
  totalCommits: number;
  totalPullRequests: number;
  repositoryCount: number;
  commitStats: CommitStatsDto;
  pullRequestStats: PullRequestStatsDto;
  doraMetrics: TeamDoraMetricsDto;
  repositories: RepositoryStatsDto[];
}
