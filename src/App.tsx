import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { UserManagementPage } from './pages/UserManagementPage';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LoginPage />} />

      {/* Rutas protegidas */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
      </Route>
    </Routes>
  );
}

export default App;
