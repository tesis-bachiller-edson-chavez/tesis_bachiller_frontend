
import { useEffect, useState } from "react";
import { UsersTable } from "@/components/UsersTable";
import type { AssignRolesRequest } from "@/types/user.types";

// Interfaz basada en UserSummaryDto del openapi.json
interface User {
  id: number;
  githubUsername: string;
  name: string;
  avatarUrl: string;
  roles: string[]; // Roles asignados al usuario
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      // En desarrollo, apiUrl es '' para usar el proxy. En producción, usa la variable de entorno.
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/users`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para actualizar roles de un usuario
  const handleUpdateRoles = async (userId: number, newRoles: string[]) => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const rolesRequest: AssignRolesRequest = { roles: newRoles };

      const response = await fetch(`${apiUrl}/api/v1/users/${userId}/roles`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rolesRequest),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para modificar roles');
        }
        throw new Error('Error al actualizar roles');
      }

      // Refrescar lista de usuarios
      await fetchUsers();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
      return false;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <UsersTable
          users={users}
          onUpdateRoles={handleUpdateRoles}
        />
      )}
    </div>
  );
};
