import { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
interface AuthContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  refreshUser: async () => {},
});

export const AuthenticatedLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Función para obtener datos del usuario
  const fetchUser = async () => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v1/users/me`, { credentials: 'include' });
      if (response.ok) {
        const userData: User = await response.json();
        console.log('AuthenticatedLayout - Usuario obtenido:', userData);
        console.log('AuthenticatedLayout - Roles:', userData.roles);
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

  // Función pública para refrescar el usuario
  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Redirigir a /home después del login inicial
  useEffect(() => {
    if (!isLoading && user && !sessionStorage.getItem('initialRedirectDone')) {
      // Marcar que ya hicimos el redirect inicial
      sessionStorage.setItem('initialRedirectDone', 'true');
      // Solo redirigir si no estamos ya en /home
      if (location.pathname !== '/home') {
        navigate('/home', { replace: true });
      }
    }
  }, [isLoading, user, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/logout`, { method: 'POST', credentials: 'include' });
      if (response.ok) {
        // Limpiar el flag de redirect para el próximo login
        sessionStorage.removeItem('initialRedirectDone');
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
    <AuthContext.Provider value={{ user, refreshUser }}>
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
