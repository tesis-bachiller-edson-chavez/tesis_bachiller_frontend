import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
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
  const [commandKey, setCommandKey] = useState(0);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Remount Command when closing to clear internal search state
    if (!newOpen) {
      setCommandKey((prev) => prev + 1);
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
              <Command key={commandKey}>
                <CommandInput placeholder="Buscar repositorio..." />
                <CommandList>
                  <CommandEmpty>No se encontraron repositorios.</CommandEmpty>
                  <CommandGroup>
                    {/* Select/Deselect All Actions */}
                    <div className="flex gap-2 p-2 border-b">
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
                    {repositories.map((repo) => (
                      <CommandItem
                        key={repo.repositoryId}
                        value={repo.repositoryName}
                        onSelect={() => handleToggleRepository(repo.repositoryId)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedRepositoryIds.includes(repo.repositoryId)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {repo.repositoryName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
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
