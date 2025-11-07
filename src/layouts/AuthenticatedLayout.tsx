import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SideNav } from '@/components/SideNav';

// Interfaz para los datos del usuario
interface User {
  id: number;
  githubUsername: string;
  email: string;
  roles: string[];
}

// 1. Crear el Contexto de Autenticación
const AuthContext = createContext<{ user: User | null }>({ user: null });

export const AuthenticatedLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v1/users/me`, { credentials: 'include' });
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/logout`, { method: 'POST', credentials: 'include' });
      if (response.ok) {
        window.location.assign('/');
      } else {
        console.error('El logout ha fallado en el servidor');
      }
    } catch (error) {
      console.error('Error de red durante el logout:', error);
    }
  };

  const isAdmin = user?.roles.includes('ADMIN') || false;

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Barra de navegación lateral fija */}
        {!isLoading && user && <SideNav isAdmin={isAdmin} />}

        {/* Área de contenido principal que ocupa el resto del espacio */}
        <div className="flex flex-1 flex-col">
          {/* Header superior solo para el contenido */}
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex-shrink-0">
            <div className="flex justify-end items-center w-full">
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </header>

          {/* Contenido de la página con scroll si es necesario */}
          <main className="flex-grow p-6 overflow-auto">
            {isLoading ? <p>Cargando...</p> : <Outlet />}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};
