import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
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
            <Button className="w-full">
              Iniciar Sesión con GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
