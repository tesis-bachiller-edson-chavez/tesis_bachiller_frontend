import { useAuth } from '@/layouts/AuthenticatedLayout';
import DeveloperDashboardPage from './DeveloperDashboardPage';
import TechLeadDashboardPage from './TechLeadDashboardPage';
import EngineeringManagerDashboardPage from './EngineeringManagerDashboardPage';

/**
 * Dashboard Router - Selecciona el dashboard correcto según los roles del usuario
 *
 * Lógica de selección (por orden de prioridad, mayor nivel de acceso primero):
 * - Si tiene ENGINEERING_MANAGER → EngineeringManagerDashboardPage
 * - Si tiene TECH_LEAD → TechLeadDashboardPage
 * - Si tiene DEVELOPER → DeveloperDashboardPage
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

  // Verificar roles en orden de prioridad (mayor a menor)
  const isEngineeringManager = user.roles.includes('ENGINEERING_MANAGER');
  const isTechLead = user.roles.includes('TECH_LEAD');

  console.log('DashboardRouter - isEngineeringManager:', isEngineeringManager);
  console.log('DashboardRouter - isTechLead:', isTechLead);

  // Prioridad 1: Engineering Manager (mayor nivel de acceso)
  if (isEngineeringManager) {
    console.log('DashboardRouter - Mostrando EngineeringManagerDashboardPage');
    return <EngineeringManagerDashboardPage />;
  }

  // Prioridad 2: Tech Lead
  if (isTechLead) {
    console.log('DashboardRouter - Mostrando TechLeadDashboardPage');
    return <TechLeadDashboardPage />;
  }

  // Prioridad 3 (por defecto): Developer
  console.log('DashboardRouter - Mostrando DeveloperDashboardPage');
  return <DeveloperDashboardPage />;
}