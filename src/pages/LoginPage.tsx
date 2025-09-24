import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const LoginPage = () => {
  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${apiUrl}/oauth2/authorization/github`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">
            Plataforma de Métricas DORA
          </h1>
          <CardDescription>
            Bienvenido. Inicia sesión para visualizar el rendimiento de tus equipos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button className="w-full bg-primary text-primary-foreground" onClick={handleLogin}>
              Iniciar Sesión con GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
