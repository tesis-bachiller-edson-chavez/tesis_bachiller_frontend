
import { useEffect, useState } from "react";
import { UsersTable } from "@/components/UsersTable";

// Interfaz basada en UserSummaryDto del openapi.json
interface User {
  githubUsername: string;
  name: string;
  avatarUrl: string;
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // En desarrollo, apiUrl es '' para usar el proxy. En producción, usa la variable de entorno.
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/users`);
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

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <UsersTable users={users} />}
    </div>
  );
};
