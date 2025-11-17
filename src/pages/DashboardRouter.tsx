import { useAuth } from '@/layouts/AuthenticatedLayout';
import DeveloperDashboardPage from './DeveloperDashboardPage';
import TechLeadDashboardPage from './TechLeadDashboardPage';

/**
 * Dashboard Router - Selecciona el dashboard correcto según los roles del usuario
 *
 * Lógica de selección:
 * - Si tiene TECH_LEAD (con o sin DEVELOPER) → TechLeadDashboardPage
 * - Si solo tiene DEVELOPER → DeveloperDashboardPage
 * - Siempre se muestra el dashboard de mayor nivel de acceso disponible
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Cargando...</div>;
  }

  // Debug: Verificar roles del usuario
  console.log('DashboardRouter - Usuario:', user.githubUsername);
  console.log('DashboardRouter - Roles:', user.roles);
  console.log('DashboardRouter - Tipo de roles:', typeof user.roles, Array.isArray(user.roles));

  // Verificar si tiene rol TECH_LEAD
  const isTechLead = user.roles.includes('TECH_LEAD');
  console.log('DashboardRouter - isTechLead:', isTechLead);

  // Si tiene TECH_LEAD, mostrar dashboard de tech lead (mayor nivel de acceso)
  if (isTechLead) {
    console.log('DashboardRouter - Mostrando TechLeadDashboardPage');
    return <TechLeadDashboardPage />;
  }

  // Por defecto, mostrar dashboard de developer
  console.log('DashboardRouter - Mostrando DeveloperDashboardPage');
  return <DeveloperDashboardPage />;
}