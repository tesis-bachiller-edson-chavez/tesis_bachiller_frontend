import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { UserManagementPage } from './pages/UserManagementPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import DashboardRouter from './pages/DashboardRouter';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/repositories" element={<RepositoriesPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/:id" element={<TeamDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
