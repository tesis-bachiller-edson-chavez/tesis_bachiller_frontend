import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Interfaz basada en UserSummaryDto del openapi.json
interface User {
  githubUsername: string;
  name: string | null; // El nombre puede ser nulo
  avatarUrl: string;
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
