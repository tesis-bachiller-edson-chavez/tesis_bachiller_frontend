import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/layouts/AuthenticatedLayout';
import type { TeamDetailDto } from '@/types/user.types';
import { ArrowLeft, Users, GitBranch, Pencil } from 'lucide-react';
import { TeamMembersTab } from '@/components/TeamMembersTab';
import { TeamRepositoriesTab } from '@/components/TeamRepositoriesTab';

type TabType = 'members' | 'repositories';

export const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('members');

  // Check permissions
  const canManageTeam =
    user?.roles.includes('ADMIN') || user?.roles.includes('ENGINEERING_MANAGER');

  // Fetch team details
  useEffect(() => {
    if (!id) {
      setError('ID de equipo no proporcionado');
      setLoading(false);
      return;
    }

    const fetchTeamDetails = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/teams/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('No tienes permisos para ver este equipo');
          }
          if (response.status === 404) {
            throw new Error('Equipo no encontrado');
          }
          throw new Error('Error al obtener detalles del equipo');
        }

        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id]);

  // Handle edit team
  const handleEditTeam = async () => {
    if (!team) return;

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
          throw new Error('No tienes permisos para editar este equipo');
        }
        if (response.status === 409) {
          throw new Error('Ya existe un equipo con ese nombre');
        }
        throw new Error('Error al actualizar el equipo');
      }

      const updatedTeam = await response.json();
      setTeam(updatedTeam);
      window.alert('✅ Equipo actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Refresh team data
  const refreshTeam = async () => {
    if (!id) return;

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/teams/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      }
    } catch (err) {
      console.error('Error refreshing team:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Cargando detalles del equipo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="outline" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <p className="text-red-500 mt-4">{error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-4">
        <p>Equipo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">{team.name}</h1>
        </div>
        {canManageTeam && (
          <Button onClick={handleEditTeam}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Miembros</p>
              <p className="text-2xl font-bold">{team.members.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tech Leads</p>
              <p className="text-2xl font-bold">
                {team.members.filter((m) => m.isTechLead).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Repositorios</p>
              <p className="text-2xl font-bold">{team.repositories.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Miembros
          </button>
          <button
            onClick={() => setActiveTab('repositories')}
            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'repositories'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <GitBranch className="h-4 w-4 inline mr-2" />
            Repositorios
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'members' && (
          <TeamMembersTab
            teamId={team.id}
            members={team.members}
            canManage={canManageTeam || false}
            onMembersChange={refreshTeam}
          />
        )}
        {activeTab === 'repositories' && (
          <TeamRepositoriesTab
            teamId={team.id}
            repositories={team.repositories}
            canManage={canManageTeam || false}
            onRepositoriesChange={refreshTeam}
          />
        )}
      </div>
    </div>
  );
};
