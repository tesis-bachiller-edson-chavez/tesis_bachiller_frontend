import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { RoleName } from "@/types/user.types";

// Interfaz basada en UserSummaryDto del openapi.json
interface User {
  githubUsername: string;
  name: string | null; // El nombre puede ser nulo
  avatarUrl: string;
  roles: string[]; // Roles asignados al usuario
}

interface UsersTableProps {
  users: User[];
}

export const UsersTable = ({ users }: UsersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Roles</TableHead>
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
                <span className="text-red-500 font-semibold">⚠️ Sin rol</span>
              ) : (
                <div className="flex gap-1 flex-wrap">
                  {user.roles.map((role) => (
                    <RoleBadge key={role} role={role as RoleName} />
                  ))}
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
