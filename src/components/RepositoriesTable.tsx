import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type {
  RepositoryDto,
  UpdateRepositoryRequest,
  DatadogServiceDto,
} from '@/types/user.types';
import { ExternalLink, Pencil, Save, X } from 'lucide-react';

interface RepositoriesTableProps {
  repositories: RepositoryDto[];
  services: DatadogServiceDto[];
  onUpdate: (id: number, updates: UpdateRepositoryRequest) => Promise<void>;
  isAdmin: boolean;
}

export const RepositoriesTable = ({
  repositories,
  services,
  onUpdate,
  isAdmin,
}: RepositoriesTableProps) => {
  console.log('🔍 DEBUG - RepositoriesTable props:', {
    repositoriesCount: repositories.length,
    servicesCount: services.length,
    isAdmin,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<UpdateRepositoryRequest>({
    datadogServiceName: null,
    deploymentWorkflowFileName: null,
    productionEnvironmentName: null,
  });
  const [saving, setSaving] = useState(false);

  const handleEdit = (repo: RepositoryDto) => {
    setEditingId(repo.id);
    setEditForm({
      datadogServiceName: repo.datadogServiceName,
      deploymentWorkflowFileName: repo.deploymentWorkflowFileName || 'deploy-dev.yml',
      productionEnvironmentName: repo.productionEnvironmentName || 'prod',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      datadogServiceName: null,
      deploymentWorkflowFileName: null,
      productionEnvironmentName: null,
    });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      await onUpdate(id, editForm);
      setEditingId(null);
    } catch (err) {
      // Error is already handled by parent component
      console.error('Error saving repository:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Repositorio</TableHead>
            <TableHead>Servicio Datadog</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Ambiente</TableHead>
            {isAdmin && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
      <TableBody>
        {repositories.map((repo) => {
          const isEditing = editingId === repo.id;

          return (
            <TableRow key={repo.id}>
              {/* Repositorio */}
              <TableCell>
                <a
                  href={repo.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {repo.owner}/{repo.repoName}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>

              {/* Servicio de Datadog */}
              <TableCell>
                {isEditing ? (
                  <select
                    value={editForm.datadogServiceName || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        datadogServiceName: e.target.value || null,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="">Sin servicio</option>
                    {services.map((service) => (
                      <option key={service.name} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm">
                    {repo.datadogServiceName || (
                      <span className="text-gray-400 italic">Sin configurar</span>
                    )}
                  </span>
                )}
              </TableCell>

              {/* Workflow de Deployment */}
              <TableCell>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.deploymentWorkflowFileName || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        deploymentWorkflowFileName: e.target.value || null,
                      })
                    }
                    placeholder="ej: deploy-dev.yml"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                  />
                ) : (
                  <span className="text-sm">
                    {repo.deploymentWorkflowFileName || (
                      <span className="text-gray-400 italic">Sin configurar</span>
                    )}
                  </span>
                )}
              </TableCell>

              {/* Ambiente de Producción */}
              <TableCell>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.productionEnvironmentName || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        productionEnvironmentName: e.target.value || null,
                      })
                    }
                    placeholder="ej: prod"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                  />
                ) : (
                  <span className="text-sm">
                    {repo.productionEnvironmentName || (
                      <span className="text-gray-400 italic">Sin configurar</span>
                    )}
                  </span>
                )}
              </TableCell>

              {/* Acciones */}
              {isAdmin && (
                <TableCell>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(repo.id)}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(repo)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
      </Table>
    </div>
  );
};
