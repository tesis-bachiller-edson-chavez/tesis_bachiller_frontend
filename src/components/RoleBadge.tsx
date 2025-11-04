import { RoleName } from '@/types/user.types';

interface RoleBadgeProps {
  role: RoleName | string;
}

/**
 * Obtiene la clase de color de Tailwind según el rol
 * @param role - El nombre del rol
 * @returns Clase CSS de Tailwind para el color de fondo
 */
const getRoleColorClass = (role: RoleName | string): string => {
  switch (role) {
    case RoleName.ADMIN:
      return 'bg-red-500';
    case RoleName.ENGINEERING_MANAGER:
      return 'bg-purple-500';
    case RoleName.TECH_LEAD:
      return 'bg-blue-500';
    case RoleName.DEVELOPER:
      return 'bg-gray-500';
    default:
      // Roles desconocidos usan gris más claro
      return 'bg-gray-400';
  }
};

/**
 * Componente para mostrar un badge de rol con color distintivo
 * Colores según especificación:
 * - ADMIN: Rojo (rol crítico)
 * - ENGINEERING_MANAGER: Púrpura (gestión)
 * - TECH_LEAD: Azul (liderazgo técnico)
 * - DEVELOPER: Gris (base)
 */
export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const colorClass = getRoleColorClass(role);

  return (
    <span className={`text-white px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
      {role}
    </span>
  );
};