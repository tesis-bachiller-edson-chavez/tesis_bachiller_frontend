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
import { SelectionModal } from '@/components/SelectionModal';

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
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set());

  // Fetch all repositories
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

  // Handle open modal
  const handleOpenModal = async () => {
    setSelectedRepoIds(new Set());
    setSearchTerm('');
    await fetchAllRepositories();
    setShowModal(true);
  };

  // Filter available repos (not already assigned to this team)
  const availableRepos = allRepositories.filter((repo) => {
    const assignedRepoIds = new Set(repositories.map((r) => r.id));
    return !assignedRepoIds.has(repo.id);
  });

  // Filter by search term (search by repo name)
  const filteredRepos = availableRepos.filter((repo) => {
    if (!searchTerm) return true;
    return repo.repoName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Toggle repo selection
  const toggleRepoSelection = (repoId: number) => {
    const newSelection = new Set(selectedRepoIds);
    if (newSelection.has(repoId)) {
      newSelection.delete(repoId);
    } else {
      newSelection.add(repoId);
    }
    setSelectedRepoIds(newSelection);
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    if (selectedRepoIds.size === 0) return;

    const selectedRepos = allRepositories.filter((r) => selectedRepoIds.has(r.id));

    setShowModal(false);

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

      // Assign each repository to the team
      for (const repo of selectedRepos) {
        const response = await fetch(`${apiUrl}/api/v1/teams/${teamId}/repositories`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            repositoryConfigId: repo.id,
          }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            window.alert(
              `⚠️ ${repo.owner}/${repo.repoName} ya está asignado a este equipo. Se omitió.`
            );
            continue;
          }
          throw new Error(`Error al asignar ${repo.owner}/${repo.repoName}`);
        }
      }

      window.alert('✅ Repositorios asignados exitosamente');
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
          <Button onClick={handleOpenModal}>
            <GitBranch className="h-4 w-4 mr-2" />
            Asignar Repositorios
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

      {/* Selection Modal */}
      <SelectionModal
        title="Seleccionar Repositorios"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        items={filteredRepos}
        selectedIds={selectedRepoIds}
        onToggleSelection={(id) => toggleRepoSelection(id as number)}
        onConfirm={handleConfirmSelection}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre de repositorio..."
        getItemId={(repo) => repo.id}
        isLoading={loadingRepos}
        columns={[
          {
            header: 'Repositorio',
            render: (repo) => (
              <div>
                <p className="font-medium">
                  {repo.owner}/{repo.repoName}
                </p>
                <a
                  href={repo.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {repo.repositoryUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ),
          },
          {
            header: 'Servicio Datadog',
            render: (repo) =>
              repo.datadogServiceName ? (
                <span className="text-sm">{repo.datadogServiceName}</span>
              ) : (
                <span className="text-gray-400 italic text-sm">Sin configurar</span>
              ),
          },
        ]}
      />
    </div>
  );
};
