import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X, Search } from 'lucide-react';

interface SelectionModalProps<T> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  selectedIds: Set<number | string>;
  onToggleSelection: (id: number | string) => void;
  onConfirm: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  columns: {
    header: string;
    render: (item: T) => React.ReactNode;
  }[];
  getItemId: (item: T) => number | string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function SelectionModal<T>({
  title,
  isOpen,
  onClose,
  items,
  selectedIds,
  onToggleSelection,
  onConfirm,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  columns,
  getItemId,
  confirmLabel = 'Agregar seleccionados',
  isLoading = false,
}: SelectionModalProps<T>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button variant="outline" disabled>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {selectedIds.size} seleccionado(s)
          </p>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p>Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No se encontraron resultados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  {columns.map((col, idx) => (
                    <TableHead key={idx}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const id = getItemId(item);
                  const isSelected = selectedIds.has(id);
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelection(id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      {columns.map((col, idx) => (
                        <TableCell key={idx}>{col.render(item)}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={selectedIds.size === 0}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
