import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TeamMemberDto, AvailableUserDto } from '@/types/user.types';
import { UserPlus, X, Crown } from 'lucide-react';

interface TeamMembersTabProps {
  teamId: number;
  members: TeamMemberDto[];
  canManage: boolean;
  onMembersChange: () => void;
}

export const TeamMembersTab = ({
  teamId,
  members,
  canManage,
  onMembersChange,
}: TeamMembersTabProps) => {
  const [availableUsers, setAvailableUsers] = useState<AvailableUserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch available users when needed
  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/users`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al obtener usuarios disponibles');
      }
      const data = await response.json();

      // Filter out users who are already members of this team
      const memberUserIds = new Set(members.map(m => m.userId));
      const available = data.filter((user: AvailableUserDto) => !memberUserIds.has(user.id));

      setAvailableUsers(available);
    } catch (err) {
      console.error('Error fetching available users:', err);
      window.alert('❌ Error al cargar usuarios disponibles');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle assign member
  const handleAssignMember = async () => {
    await fetchAvailableUsers();

    if (availableUsers.length === 0) {
      window.alert('No hay usuarios disponibles para asignar');
      return;
    }

    // Create options for the user
    const userOptions = availableUsers
      .map((u, idx) => `${idx + 1}. ${u.name} (@${u.githubUsername})`)
      .join('\n');

    const userSelection = window.prompt(
      `Seleccione un usuario para asignar:\n\n${userOptions}\n\nIngrese el número:`
    );

    if (!userSelection) return;

    const selectedIndex = parseInt(userSelection, 10) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableUsers.length) {
      window.alert('❌ Selección inválida');
      return;
    }

    const selectedUser = availableUsers[selectedIndex];

    const isTechLeadResponse = window.confirm(
      `¿Desea asignar a ${selectedUser.name} como Tech Lead?`
    );

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

      // Step 1: Assign member (always as developer initially)
      const response = await fetch(`${apiUrl}/api/v1/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para asignar miembros');
        }
        if (response.status === 409) {
          throw new Error('El usuario ya pertenece a un equipo');
        }
        throw new Error('Error al asignar miembro');
      }

      // Step 2: If tech lead, update the member's role
      if (isTechLeadResponse) {
        const techLeadResponse = await fetch(
          `${apiUrl}/api/v1/teams/${teamId}/members/${selectedUser.id}/tech-lead`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isTechLead: true }),
          }
        );

        if (!techLeadResponse.ok) {
          // Member was assigned but tech lead promotion failed
          window.alert('⚠️ Miembro asignado pero no se pudo promover a Tech Lead');
          onMembersChange();
          return;
        }
      }

      window.alert('✅ Miembro asignado exitosamente');
      onMembersChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (member: TeamMemberDto) => {
    const confirmed = window.confirm(
      `¿Está seguro que desea remover a ${member.name} del equipo?`
    );
    if (!confirmed) return;

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/v1/teams/${teamId}/members/${member.userId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para remover miembros');
        }
        throw new Error('Error al remover miembro');
      }

      window.alert('✅ Miembro removido exitosamente');
      onMembersChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle toggle tech lead status
  const handleToggleTechLead = async (member: TeamMemberDto) => {
    const action = member.techLead ? 'remover de' : 'asignar como';
    const confirmed = window.confirm(
      `¿Desea ${action} Tech Lead a ${member.name}?`
    );
    if (!confirmed) return;

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/v1/teams/${teamId}/members/${member.userId}/tech-lead`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isTechLead: !member.techLead }),
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para modificar Tech Leads');
        }
        throw new Error('Error al actualizar Tech Lead');
      }

      window.alert('✅ Tech Lead actualizado exitosamente');
      onMembersChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <div>
      {canManage && (
        <div className="mb-4">
          <Button onClick={handleAssignMember} disabled={loadingUsers}>
            <UserPlus className="h-4 w-4 mr-2" />
            {loadingUsers ? 'Cargando...' : 'Asignar Miembro'}
          </Button>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-gray-500">
          No hay miembros asignados a este equipo.
          {canManage && ' Asigna miembros para comenzar.'}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead>Rol</TableHead>
              {canManage && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://github.com/${member.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    @{member.githubUsername}
                  </a>
                </TableCell>
                <TableCell>
                  {member.techLead ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-semibold">
                      <Crown className="h-3 w-3" />
                      Tech Lead
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">Developer</span>
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleTechLead(member)}
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveMember(member)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
