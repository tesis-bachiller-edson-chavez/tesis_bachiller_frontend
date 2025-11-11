import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RepositoryStatsDto } from '@/types/dashboard.types';

interface DeveloperRepositoriesTableProps {
  repositories: RepositoryStatsDto[];
}

export function DeveloperRepositoriesTable({
  repositories,
}: DeveloperRepositoriesTableProps) {
  const totalCommits = repositories.reduce((sum, repo) => sum + repo.commitCount, 0);

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contribuciones por Repositorio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No hay repositorios con commits.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribuciones por Repositorio</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repositorio</TableHead>
              <TableHead className="text-right">Commits</TableHead>
              <TableHead className="text-right">Porcentaje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repositories.map((repo) => {
              const percentage = ((repo.commitCount / totalCommits) * 100).toFixed(1);
              return (
                <TableRow key={repo.repositoryId}>
                  <TableCell>
                    <a
                      href={repo.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {repo.repositoryName}
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {repo.commitCount}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {percentage}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
