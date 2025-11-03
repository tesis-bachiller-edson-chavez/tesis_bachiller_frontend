import { useAuth } from "@/layouts/AuthenticatedLayout";

export const HomePage = () => {
  // Obtenemos el usuario desde el contexto, que es proveído por el AuthenticatedLayout
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {/* Mantenemos el mensaje de bienvenida personalizado */}
        {user ? `Bienvenido, ${user.githubUsername}` : 'Bienvenido'}
      </h1>
      <p>
        Usa el menú de navegación de la derecha para explorar las diferentes secciones.
      </p>
    </div>
  );
};
