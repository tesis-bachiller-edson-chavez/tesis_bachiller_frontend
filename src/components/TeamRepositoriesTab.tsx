import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RepositoryDto } from '@/types/user.types';
import { GitBranch, X, ExternalLink } from 'lucide-react';

interface TeamRepositoriesTabProps {
  teamId: number;
  repositories: RepositoryDto[];
  canManage: boolean;
  onRepositoriesChange: () => void;
}

export const TeamRepositoriesTab = ({
  teamId,
  repositories,
  canManage,
  onRepositoriesChange,
}: TeamRepositoriesTabProps) => {
  const [allRepositories, setAllRepositories] = useState<RepositoryDto[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Fetch all repositories when needed
  const fetchAllRepositories = async () => {
    setLoadingRepos(true);
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/repositories`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al obtener repositorios');
      }
      const data = await response.json();
      setAllRepositories(data);
    } catch (err) {
      console.error('Error fetching repositories:', err);
      window.alert('❌ Error al cargar repositorios');
    } finally {
      setLoadingRepos(false);
    }
  };

  // Handle assign repository
  const handleAssignRepository = async () => {
    await fetchAllRepositories();

    // Filter out repositories already assigned to this team
    const assignedRepoIds = new Set(repositories.map((r) => r.id));
    const availableRepos = allRepositories.filter((r) => !assignedRepoIds.has(r.id));

    if (availableRepos.length === 0) {
      window.alert('No hay repositorios disponibles para asignar');
      return;
    }

    // Create options for the user
    const repoOptions = availableRepos
      .map((r, idx) => `${idx + 1}. ${r.owner}/${r.repoName}`)
      .join('\n');

    const repoSelection = window.prompt(
      `Seleccione un repositorio para asignar:\n\n${repoOptions}\n\nIngrese el número:`
    );

    if (!repoSelection) return;

    const selectedIndex = parseInt(repoSelection, 10) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableRepos.length) {
      window.alert('❌ Selección inválida');
      return;
    }

    const selectedRepo = availableRepos[selectedIndex];

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/teams/${teamId}/repositories`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryConfigId: selectedRepo.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para asignar repositorios');
        }
        if (response.status === 409) {
          throw new Error('El repositorio ya está asignado a este equipo');
        }
        throw new Error('Error al asignar repositorio');
      }

      window.alert('✅ Repositorio asignado exitosamente');
      onRepositoriesChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle remove repository
  const handleRemoveRepository = async (repository: RepositoryDto) => {
    const confirmed = window.confirm(
      `¿Está seguro que desea remover el repositorio "${repository.owner}/${repository.repoName}" del equipo?`
    );
    if (!confirmed) return;

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/v1/teams/${teamId}/repositories/${repository.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para remover repositorios');
        }
        throw new Error('Error al remover repositorio');
      }

      window.alert('✅ Repositorio removido exitosamente');
      onRepositoriesChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <div>
      {canManage && (
        <div className="mb-4">
          <Button onClick={handleAssignRepository} disabled={loadingRepos}>
            <GitBranch className="h-4 w-4 mr-2" />
            {loadingRepos ? 'Cargando...' : 'Asignar Repositorio'}
          </Button>
        </div>
      )}

      {repositories.length === 0 ? (
        <p className="text-gray-500">
          No hay repositorios asignados a este equipo.
          {canManage && ' Asigna repositorios para comenzar.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repositorio</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Servicio Datadog</TableHead>
              <TableHead>Workflow Deployment</TableHead>
              {canManage && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {repositories.map((repo) => (
              <TableRow key={repo.id}>
                <TableCell className="font-medium">
                  <a
                    href={repo.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {repo.owner}/{repo.repoName}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {repo.repositoryUrl}
                  </span>
                </TableCell>
                <TableCell>
                  {repo.datadogServiceName ? (
                    <span className="text-sm">{repo.datadogServiceName}</span>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Sin configurar</span>
                  )}
                </TableCell>
                <TableCell>
                  {repo.deploymentWorkflowFileName ? (
                    <span className="text-sm">{repo.deploymentWorkflowFileName}</span>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Sin configurar</span>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveRepository(repo)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
