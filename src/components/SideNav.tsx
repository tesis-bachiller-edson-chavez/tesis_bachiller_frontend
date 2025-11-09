import { Link, useLocation } from 'react-router-dom';
import { Home, Users, GitMerge, FolderGit2 } from 'lucide-react';

interface SideNavProps {
  isAdmin: boolean;
}

// Helper para aplicar estilos al enlace activo
const NavLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 rounded-md p-2 text-sm font-medium transition-colors ${
        isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-200'
      }`}>
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};

export const SideNav = ({ isAdmin }: SideNavProps) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 p-4 flex flex-col">
      {/* Título de la aplicación en la parte superior del SideNav */}
      <div className="mb-8 flex items-center space-x-2 px-2">
        <GitMerge className="h-8 w-8 text-primary" />
        <h1 className="text-lg font-bold">Plataforma de Métricas DORA</h1>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col space-y-2">
        <NavLink to="/home" icon={Home}>
          Home
        </NavLink>
        <NavLink to="/repositories" icon={FolderGit2}>
          Repositorios
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin/users" icon={Users}>
            Gestión de Usuarios
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
