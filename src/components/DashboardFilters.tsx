import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
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
}: DashboardFiltersProps) {
  // Convert repositories to react-select options
  const repositoryOptions = repositories.map((repo) => ({
    value: repo.repositoryId,
    label: repo.repositoryName,
  }));

  // Get selected options from IDs
  const selectedOptions = repositoryOptions.filter((option) =>
    selectedRepositoryIds.includes(option.value)
  );

  // Handle selection change
  const handleChange = (selected: readonly { value: number; label: string }[] | null) => {
    const ids = selected ? selected.map((option) => option.value) : [];
    onRepositoryIdsChange(ids);
  };

  const handleSelectAll = () => {
    onRepositoryIdsChange(repositories.map((r) => r.repositoryId));
  };

  const handleDeselectAll = () => {
    onRepositoryIdsChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primera línea: Repositorios con botones a la izquierda */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Repositorios
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:underline"
              >
                Todos
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-blue-600 hover:underline"
              >
                Ninguno
              </button>
            </div>
          </div>
          <Select
            isMulti
            value={selectedOptions}
            onChange={handleChange}
            options={repositoryOptions}
            placeholder="Seleccionar repositorios..."
            noOptionsMessage={() => 'No se encontraron repositorios'}
            closeMenuOnSelect={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#e0e7ff',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#3730a3',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#3730a3',
                '&:hover': {
                  backgroundColor: '#c7d2fe',
                  color: '#312e81',
                },
              }),
            }}
          />
        </div>

        {/* Segunda línea: Filtros de fecha y botón Aplicar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <Button onClick={onApplyFilters} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
