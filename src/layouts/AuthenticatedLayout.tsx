import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AuthenticatedLayout = () => {
  const handleLogout = async () => {
    try {
      // Esperamos a que la petición fetch se complete
      const response = await fetch('/logout', {
        method: 'POST',
      });

      // Solo si la respuesta es exitosa, procedemos a redirigir
      if (response.ok) {
        window.location.assign('/');
      } else {
        // Si el logout falla en el backend, lo mostramos en la consola
        console.error('El logout ha fallado en el servidor');
      }
    } catch (error) {
      // Si hay un error de red, lo mostramos en la consola
      console.error('Error de red durante el logout:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Plataforma de Métricas DORA</h1>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="flex-grow p-8 container mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
