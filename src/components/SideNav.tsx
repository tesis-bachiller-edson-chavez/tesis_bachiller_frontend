import { Link, useLocation } from 'react-router-dom';
import { Home, Users, GitMerge, FolderGit2, UsersRound, BarChart3 } from 'lucide-react';
import { useAuth } from '@/layouts/AuthenticatedLayout';

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
  const { user } = useAuth();

  // Check if user can see teams
  const canViewTeams =
    user?.roles.includes('ADMIN') ||
    user?.roles.includes('ENGINEERING_MANAGER') ||
    user?.roles.includes('TECH_LEAD');

  return (
    <aside className="w-52 lg:w-64 flex-shrink-0 border-r bg-gray-50 p-3 lg:p-4 flex flex-col">
      {/* Título de la aplicación en la parte superior del SideNav */}
      <div className="mb-6 lg:mb-8 flex items-center space-x-2 px-1 lg:px-2">
        <GitMerge className="h-6 w-6 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
        <h1 className="text-sm lg:text-lg font-bold leading-tight">Plataforma de Métricas DORA</h1>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col space-y-2">
        <NavLink to="/home" icon={Home}>
          Home
        </NavLink>
        <NavLink to="/dashboard" icon={BarChart3}>
          Dashboard
        </NavLink>
        <NavLink to="/repositories" icon={FolderGit2}>
          Repositorios
        </NavLink>
        {canViewTeams && (
          <NavLink to="/teams" icon={UsersRound}>
            Equipos
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin/users" icon={Users}>
            Gestión de Usuarios
          </NavLink>
        )}
      </nav>
    </aside>
  );
};
