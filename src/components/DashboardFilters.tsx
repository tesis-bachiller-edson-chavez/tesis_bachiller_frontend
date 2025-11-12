import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { RepositoryStatsDto } from '@/types/dashboard.types';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset search when closing
    if (!newOpen) {
      setSearchQuery('');
    }
  };

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

  const selectedReposText = () => {
    if (selectedRepositoryIds.length === 0) return 'Seleccionar repositorios...';
    if (selectedRepositoryIds.length === repositories.length) return 'Todos los repositorios';
    if (selectedRepositoryIds.length === 1) {
      const repo = repositories.find((r) => r.repositoryId === selectedRepositoryIds[0]);
      return repo?.repositoryName || '1 repositorio';
    }
    return `${selectedRepositoryIds.length} repositorios seleccionados`;
  };

  // Filter repositories based on search query
  const filteredRepositories = repositories.filter((repo) =>
    repo.repositoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repositorios
          </label>
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                <span className="truncate">{selectedReposText()}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <div className="flex flex-col">
                {/* Search Input */}
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    type="text"
                    placeholder="Buscar repositorio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                  />
                </div>

                {/* Select/Deselect All Actions */}
                <div className="flex gap-2 p-2 border-b bg-gray-50">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:underline flex-1 text-left"
                    disabled={allSelected}
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs text-blue-600 hover:underline flex-1 text-right"
                    disabled={selectedRepositoryIds.length === 0}
                  >
                    Deseleccionar todos
                  </button>
                </div>

                {/* Repository List */}
                <div className="max-h-[300px] overflow-y-auto p-1">
                  {filteredRepositories.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      No se encontraron repositorios.
                    </div>
                  ) : (
                    filteredRepositories.map((repo) => (
                      <label
                        key={repo.repositoryId}
                        className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-center w-4 h-4">
                          <Check
                            className={cn(
                              'h-4 w-4 text-blue-600',
                              selectedRepositoryIds.includes(repo.repositoryId)
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedRepositoryIds.includes(repo.repositoryId)}
                          onChange={() => handleToggleRepository(repo.repositoryId)}
                          className="sr-only"
                        />
                        <span>{repo.repositoryName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
