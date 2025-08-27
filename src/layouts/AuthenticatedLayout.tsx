import { Outlet } from 'react-router-dom';

export const AuthenticatedLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow p-4">
        <h1 className="text-xl font-semibold">Plataforma de Métricas DORA</h1>
      </header>

      <main className="flex-grow p-8">
        <Outlet />
      </main>

      {/* El footer podría ir aquí en el futuro */}
    </div>
  );
};
