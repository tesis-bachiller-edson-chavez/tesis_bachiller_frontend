import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/RoleBadge";
import { RoleName } from "@/types/user.types";
import { Pencil } from "lucide-react";

// Interfaz basada en UserSummaryDto del openapi.json
interface User {
  id: number;
  githubUsername: string;
  name: string | null; // El nombre puede ser nulo
  avatarUrl: string;
  roles: string[]; // Roles asignados al usuario
}

interface UsersTableProps {
  users: User[];
  onUpdateRoles: (userId: number, newRoles: string[]) => Promise<boolean>;
}

// Roles que se pueden editar desde esta pantalla (NO incluye TECH_LEAD)
const EDITABLE_ROLES = ['ADMIN', 'ENGINEERING_MANAGER', 'DEVELOPER'] as const;

export const UsersTable = ({ users, onUpdateRoles }: UsersTableProps) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    // Inicializar con los roles editables actuales del usuario
    const editableRoles = user.roles.filter(role =>
      EDITABLE_ROLES.includes(role as typeof EDITABLE_ROLES[number])
    );
    setSelectedRoles(new Set(editableRoles));
  };

  const handleRoleToggle = (role: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);

    // Mantener TECH_LEAD si el usuario ya lo tiene (no se puede quitar desde aquí)
    const hasTechLead = editingUser.roles.includes('TECH_LEAD');
    const newRoles = Array.from(selectedRoles);
    if (hasTechLead) {
      newRoles.push('TECH_LEAD');
    }

    // Asegurar que al menos tenga DEVELOPER si no tiene ningún rol
    if (newRoles.length === 0) {
      newRoles.push('DEVELOPER');
    }

    const success = await onUpdateRoles(editingUser.id, newRoles);
    setSaving(false);

    if (success) {
      setEditingUser(null);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.githubUsername}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={`Avatar de ${user.name || user.githubUsername}`} />
                  <AvatarFallback>
                    {/* Usa la inicial del nombre, o si no existe, la del username */}
                    {(user.name || user.githubUsername).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user.githubUsername}</TableCell>
              {/* Muestra el nombre o un guion si no existe */}
              <TableCell>{user.name || '-'}</TableCell>
              <TableCell>
                {/* Caso anómalo: usuario sin roles (error del backend) */}
                {user.roles.length === 0 ? (
                  <span className="text-red-500 font-semibold">Sin rol</span>
                ) : (
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <RoleBadge key={role} role={role as RoleName} />
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(user)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar Roles
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de edición de roles */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Editar Roles de @{editingUser.githubUsername}
            </h2>

            {/* Aviso sobre TECH_LEAD */}
            {editingUser.roles.includes('TECH_LEAD') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-yellow-800">
                El rol <strong>TECH_LEAD</strong> solo puede ser gestionado desde la pantalla de Equipos.
              </div>
            )}

            <div className="space-y-3 mb-6">
              {EDITABLE_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.has(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="h-4 w-4"
                  />
                  <div>
                    <span className="font-medium">{role}</span>
                    <p className="text-xs text-gray-500">
                      {role === 'ADMIN' && 'Acceso completo al sistema'}
                      {role === 'ENGINEERING_MANAGER' && 'Ve métricas de todos los equipos'}
                      {role === 'DEVELOPER' && 'Rol base para todos los usuarios'}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
