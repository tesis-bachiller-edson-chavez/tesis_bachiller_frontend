import { useEffect, useState } from 'react';
import { RepositoriesTable } from '@/components/RepositoriesTable';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/layouts/AuthenticatedLayout';
import { DebugAuthInfo } from '@/components/DebugAuthInfo';
import type {
  RepositoryDto,
  RepositorySyncResultDto,
  UpdateRepositoryRequest,
  DatadogServiceDto,
} from '@/types/user.types';

export const RepositoriesPage = () => {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<RepositoryDto[]>([]);
  const [services, setServices] = useState<DatadogServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Debug: Mostrar información del usuario
  console.log('🔍 DEBUG - Usuario actual:', user);
  console.log('🔍 DEBUG - Roles del usuario:', user?.roles);

  const isAdmin = user?.roles.includes('ADMIN') || false;
  console.log('🔍 DEBUG - ¿Es ADMIN?:', isAdmin);

  // Fetch repositories on mount
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/repositories`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Error al obtener los repositorios');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  // Fetch Datadog services if ADMIN
  useEffect(() => {
    console.log('🔍 DEBUG - Intentando cargar servicios de Datadog, isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('🔍 DEBUG - Usuario no es ADMIN, no se cargan servicios');
      return;
    }

    const fetchServices = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        console.log('🔍 DEBUG - Fetching servicios desde:', `${apiUrl}/api/v1/datadog/services`);
        const response = await fetch(`${apiUrl}/api/v1/datadog/services`, {
          credentials: 'include',
        });
        console.log('🔍 DEBUG - Respuesta de servicios:', {
          status: response.status,
          ok: response.ok,
        });
        if (!response.ok) {
          if (response.status === 403) {
            console.warn('⚠️ 403: No tienes permisos para ver servicios de Datadog');
            return;
          }
          const errorText = await response.text();
          console.error('🔍 DEBUG - Error response:', errorText);
          throw new Error('Error al obtener servicios de Datadog');
        }
        const data = await response.json();
        console.log('🔍 DEBUG - Servicios cargados:', data);
        setServices(data);
      } catch (err) {
        console.error('❌ Error al cargar servicios de Datadog:', err);
        // No mostramos error al usuario, simplemente permitimos input libre
      }
    };

    fetchServices();
  }, [isAdmin]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/repositories/sync`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para sincronizar repositorios');
        }
        if (response.status === 500) {
          throw new Error('Error del servidor al sincronizar');
        }
        throw new Error('Error en la sincronización');
      }

      const result: RepositorySyncResultDto = await response.json();

      // Show success message
      window.alert(
        `✅ Sincronización exitosa!\n\n` +
          `Nuevos: ${result.newRepositories}\n` +
          `Sin cambios: ${result.unchanged}\n` +
          `Total: ${result.totalRepositories}`
      );

      // Refresh repositories list
      const refreshResponse = await fetch(`${apiUrl}/api/v1/repositories`, {
        credentials: 'include',
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setRepositories(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      window.alert(`❌ Error: ${errorMessage}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdate = async (id: number, updates: UpdateRepositoryRequest) => {
    console.log('🔍 DEBUG - Intentando actualizar repositorio:', { id, updates, isAdmin });
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const url = `${apiUrl}/api/v1/repositories/${id}`;
      console.log('🔍 DEBUG - PUT request a:', url);
      console.log('🔍 DEBUG - Body:', JSON.stringify(updates));

      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      console.log('🔍 DEBUG - Respuesta de update:', {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DEBUG - Error response:', errorText);

        if (response.status === 403) {
          throw new Error('No tienes permisos para actualizar repositorios');
        }
        if (response.status === 404) {
          throw new Error('Repositorio no encontrado');
        }
        if (response.status === 500) {
          throw new Error('Error del servidor al actualizar');
        }
        throw new Error('Error al actualizar el repositorio');
      }

      const updatedRepo: RepositoryDto = await response.json();
      console.log('🔍 DEBUG - Repositorio actualizado:', updatedRepo);

      // Update local state
      setRepositories((prev) =>
        prev.map((repo) => (repo.id === id ? updatedRepo : repo))
      );

      window.alert('✅ Repositorio actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error al actualizar:', err);
      window.alert(`❌ Error: ${errorMessage}`);
      throw err; // Re-throw para que la tabla pueda manejarlo
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gestión de Repositorios</h1>
          {isAdmin && (
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? 'Sincronizando...' : 'Sincronizar desde GitHub'}
            </Button>
          )}
        </div>

        {loading && <p>Cargando repositorios...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!loading && !error && repositories.length === 0 && (
          <p className="text-gray-500">
            No hay repositorios configurados.
            {isAdmin && ' Sincroniza desde GitHub para comenzar.'}
          </p>
        )}
        {!loading && !error && repositories.length > 0 && (
          <RepositoriesTable
            repositories={repositories}
            services={services}
            onUpdate={handleUpdate}
            isAdmin={isAdmin}
          />
        )}
      </div>
      {/* Componente de debug temporal */}
        {/*<DebugAuthInfo /> */}
    </>
  );
};
