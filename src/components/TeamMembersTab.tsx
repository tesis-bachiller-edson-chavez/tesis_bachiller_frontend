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
import type { TeamMemberDto, AvailableUserDto, AssignRolesRequest } from '@/types/user.types';
import { UserPlus, X, Crown } from 'lucide-react';
import { SelectionModal } from '@/components/SelectionModal';

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
  const [allUsers, setAllUsers] = useState<AvailableUserDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/users`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      window.alert('❌ Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle open modal
  const handleOpenModal = async () => {
    setSelectedUserIds(new Set());
    setSearchTerm('');
    await fetchAllUsers();
    setShowModal(true);
  };

  // Filter available users (not already in team)
  const availableUsers = allUsers.filter((user) => {
    const memberUserIds = new Set(members.map((m) => m.userId));
    return !memberUserIds.has(user.id);
  });

  // Filter by search term
  const filteredUsers = availableUsers.filter((user) => {
    if (!searchTerm) return true;
    return user.githubUsername.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Toggle user selection
  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    if (selectedUserIds.size === 0) return;

    const selectedUsers = allUsers.filter((u) => selectedUserIds.has(u.id));

    // Ask if users should be tech leads
    const makeTechLeads = window.confirm(
      `¿Desea asignar a los ${selectedUsers.length} usuario(s) seleccionado(s) como Tech Lead?\n\nSi selecciona "Cancelar", se asignarán solo como Developer.`
    );

    setShowModal(false);

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

      // Step 1: Assign each user to the team
      for (const user of selectedUsers) {
        const response = await fetch(`${apiUrl}/api/v1/teams/${teamId}/members`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            window.alert(`⚠️ @${user.githubUsername} ya pertenece a otro equipo. Se omitió.`);
            continue;
          }
          throw new Error(`Error al asignar a @${user.githubUsername}`);
        }

        // Step 2: If should be tech lead, assign TECH_LEAD role
        if (makeTechLeads) {
          // Get current roles and add TECH_LEAD
          const newRoles = user.roles.includes('TECH_LEAD')
            ? user.roles
            : [...user.roles, 'TECH_LEAD'];

          const rolesRequest: AssignRolesRequest = { roles: newRoles };

          const rolesResponse = await fetch(`${apiUrl}/api/v1/users/${user.id}/roles`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rolesRequest),
          });

          if (!rolesResponse.ok) {
            window.alert(
              `⚠️ @${user.githubUsername} fue asignado al equipo pero no se pudo asignar rol TECH_LEAD`
            );
          }
        }
      }

      window.alert('✅ Usuarios asignados exitosamente');
      onMembersChange();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      window.alert(`❌ Error: ${errorMessage}`);
    }
  };

  // Handle remove member
  const handleRemoveMember = async (member: TeamMemberDto) => {
    const confirmed = window.confirm(
      `¿Está seguro que desea remover a @${member.githubUsername} del equipo?`
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
    const confirmed = window.confirm(`¿Desea ${action} Tech Lead a @${member.githubUsername}?`);
    if (!confirmed) return;

    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

      // Toggle TECH_LEAD role
      const newRoles = member.techLead
        ? member.roles.filter((r) => r !== 'TECH_LEAD')
        : [...member.roles, 'TECH_LEAD'];

      const rolesRequest: AssignRolesRequest = { roles: newRoles };

      const response = await fetch(`${apiUrl}/api/v1/users/${member.userId}/roles`, {
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
        throw new Error('Error al actualizar rol');
      }

      window.alert('✅ Rol actualizado exitosamente');
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
          <Button onClick={handleOpenModal}>
            <UserPlus className="h-4 w-4 mr-2" />
            Asignar Miembros
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

      {/* Selection Modal */}
      <SelectionModal
        title="Seleccionar Usuarios"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        items={filteredUsers}
        selectedIds={selectedUserIds}
        onToggleSelection={(id) => toggleUserSelection(id as number)}
        onConfirm={handleConfirmSelection}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre de usuario de GitHub..."
        getItemId={(user) => user.id}
        isLoading={loadingUsers}
        columns={[
          {
            header: 'Usuario',
            render: (user) => (
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">@{user.githubUsername}</p>
              </div>
            ),
          },
          {
            header: 'Roles Actuales',
            render: (user) => (
              <div className="flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
