import { Outlet } from 'react-router-dom';

export const AuthenticatedLayout = () => {
  return (
    <div>
      <header>
        {/* Aquí iría el logo, el menú de perfil, etc. */}
        Barra de Navegación Principal
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
