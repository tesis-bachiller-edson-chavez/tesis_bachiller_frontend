import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RepositoryStatsDto } from '@/types/dashboard.types';

interface DashboardFiltersProps {
  repositories: RepositoryStatsDto[];
  selectedRepositoryIds: number[];
  onRepositoryIdsChange: (ids: number[]) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function DashboardFilters({
  repositories,
  selectedRepositoryIds,
  onRepositoryIdsChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyFilters,
  onResetFilters,
}: DashboardFiltersProps) {
  const handleToggleRepository = (repoId: number) => {
    if (selectedRepositoryIds.includes(repoId)) {
      onRepositoryIdsChange(selectedRepositoryIds.filter((id) => id !== repoId));
    } else {
      onRepositoryIdsChange([...selectedRepositoryIds, repoId]);
    }
  };

  const handleSelectAll = () => {
    onRepositoryIdsChange(repositories.map((r) => r.repositoryId));
  };

  const handleDeselectAll = () => {
    onRepositoryIdsChange([]);
  };

  const allSelected = selectedRepositoryIds.length === repositories.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Repository Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Repositorios
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:underline"
                disabled={allSelected}
              >
                Seleccionar todos
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-blue-600 hover:underline"
                disabled={selectedRepositoryIds.length === 0}
              >
                Deseleccionar todos
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
            {repositories.map((repo) => (
              <label
                key={repo.repositoryId}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedRepositoryIds.includes(repo.repositoryId)}
                  onChange={() => handleToggleRepository(repo.repositoryId)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">{repo.repositoryName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onApplyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
          <Button onClick={onResetFilters} variant="outline" className="flex-1">
            Resetear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
