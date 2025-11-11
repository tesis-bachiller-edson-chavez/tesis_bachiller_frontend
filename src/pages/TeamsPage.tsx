import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/layouts/AuthenticatedLayout';
import type { TeamDto, CreateTeamRequest } from '@/types/user.types';
import { Pencil, Trash2, Eye, Users } from 'lucide-react';

export const TeamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canManageTeams =
    user?.roles.includes('ADMIN') || user?.roles.includes('ENGINEERING_MANAGER');
  const canViewTeams =
    canManageTeams || user?.roles.includes('TECH_LEAD');

  // Fetch teams
  useEffect(() => {
    if (!canViewTeams) {
      setError('No tienes permisos para ver equipos');
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/teams`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Error al obtener los equipos');
        }
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [canViewTeams]);

  // Handle create team
  const handleCreateTeam = async () => {
    const teamName = window.prompt('Ingrese el nombre del equipo:');
    if (!teamName || teamName.trim() === '') {
      return;
    }

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const createRequest: CreateTeamRequest = {
        name: teamName.trim(),
      };

      const response = await fetch(`${apiUrl}/api/v1/teams`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para crear equipos');
        }
        if (response.status === 409) {
          throw new Error('Ya existe un equipo con ese nombre');
        }
        throw new Error('Error al crear el equipo');
      }

      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      window.alert('✅ Equipo creado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle edit team
  const handleEditTeam = async (team: TeamDto) => {
    const newName = window.prompt('Ingrese el nuevo nombre del equipo:', team.name);
    if (!newName || newName.trim() === '' || newName.trim() === team.name) {
      return;
    }

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/teams/${team.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para editar equipos');
        }
        if (response.status === 404) {
          throw new Error('Equipo no encontrado');
        }
        if (response.status === 409) {
          throw new Error('Ya existe un equipo con ese nombre');
        }
        throw new Error('Error al actualizar el equipo');
      }

      const updatedTeam = await response.json();
      setTeams(teams.map((t) => (t.id === team.id ? updatedTeam : t)));
      window.alert('✅ Equipo actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle delete team
  const handleDeleteTeam = async (team: TeamDto) => {
    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar el equipo "${team.name}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) {
      return;
    }

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/teams/${team.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar equipos');
        }
        if (response.status === 404) {
          throw new Error('Equipo no encontrado');
        }
        if (response.status === 409) {
          throw new Error('No se puede eliminar un equipo con miembros asignados');
        }
        throw new Error('Error al eliminar el equipo');
      }

      setTeams(teams.filter((t) => t.id !== team.id));
      window.alert('✅ Equipo eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle view team details
  const handleViewTeam = (teamId: number) => {
    navigate(`/teams/${teamId}`);
  };

  if (!canViewTeams) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de Equipos</h1>
        <p className="text-red-500">No tienes permisos para ver esta página</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Equipos</h1>
        {canManageTeams && (
          <Button onClick={handleCreateTeam}>
            <Users className="h-4 w-4 mr-2" />
            Crear Equipo
          </Button>
        )}
      </div>

      {loading && <p>Cargando equipos...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && teams.length === 0 && (
        <p className="text-gray-500">
          No hay equipos configurados.
          {canManageTeams && ' Crea un equipo para comenzar.'}
        </p>
      )}

      {!loading && !error && teams.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead>Tech Leads</TableHead>
              <TableHead>Repositorios</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.memberCount}</TableCell>
                <TableCell>
                  {team.techLeads.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {team.techLeads.map((lead, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                        >
                          {lead}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-sm">Sin tech leads</span>
                  )}
                </TableCell>
                <TableCell>{team.repositoryCount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTeam(team.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManageTeams && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
