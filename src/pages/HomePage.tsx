import { useState, useEffect } from 'react';

// Interfaz que coincide con el UserDto del backend
interface User {
  id: number;
  githubUsername: string;
  email: string;
  roles: string[];
}

export const HomePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/v1/user/me', { credentials: 'include' });
        if (response.ok) {
          const userData: User = await response.json();
          setUser(userData);
        } else {
          console.error('Error al obtener los datos del usuario');
          setUser(null);
        }
      } catch (error) {
        console.error('Error de red al obtener los datos del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>
        {user ? `Bienvenido, ${user.githubUsername}` : 'No se pudieron cargar los datos del usuario'}
      </h1>
    </div>
  );
};
