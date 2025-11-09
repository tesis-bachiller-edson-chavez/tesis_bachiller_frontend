import { useState } from 'react';
import { useAuth } from '@/layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';

export const DebugAuthInfo = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<{
    repositories?: any;
    datadogServices?: any;
    repositoriesError?: string;
    datadogError?: string;
  }>({});

  const testEndpoint = async (url: string, name: string) => {
    try {
      const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}${url}`, {
        credentials: 'include',
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      if (!response.ok) {
        const errorText = await response.text();
        setTestResults((prev) => ({
          ...prev,
          [`${name}Error`]: `${response.status} ${response.statusText}: ${errorText}`,
        }));
        return;
      }

      const data = await response.json();
      setTestResults((prev) => ({
        ...prev,
        [name]: { status: response.status, headers, data },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [`${name}Error`]: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-2xl max-h-96 overflow-auto">
      <h2 className="text-lg font-bold mb-2">🔍 Debug - Información de Autenticación</h2>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-1">Usuario (desde AuthContext):</h3>
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-1">Cookies del navegador:</h3>
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
          {document.cookie || 'No hay cookies'}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-1">Tests de Endpoints:</h3>
        <div className="flex gap-2 mb-2">
          <Button size="sm" onClick={() => testEndpoint('/api/v1/repositories', 'repositories')}>
            Test GET /repositories
          </Button>
          <Button
            size="sm"
            onClick={() => testEndpoint('/api/v1/datadog/services', 'datadogServices')}
          >
            Test GET /datadog/services
          </Button>
        </div>

        {testResults.repositories && (
          <div className="mt-2">
            <h4 className="font-semibold text-xs text-green-600">✅ GET /repositories:</h4>
            <pre className="text-xs bg-green-50 dark:bg-green-900 p-2 rounded overflow-auto">
              {JSON.stringify(testResults.repositories, null, 2)}
            </pre>
          </div>
        )}

        {testResults.repositoriesError && (
          <div className="mt-2">
            <h4 className="font-semibold text-xs text-red-600">❌ GET /repositories Error:</h4>
            <pre className="text-xs bg-red-50 dark:bg-red-900 p-2 rounded overflow-auto">
              {testResults.repositoriesError}
            </pre>
          </div>
        )}

        {testResults.datadogServices && (
          <div className="mt-2">
            <h4 className="font-semibold text-xs text-green-600">
              ✅ GET /datadog/services:
            </h4>
            <pre className="text-xs bg-green-50 dark:bg-green-900 p-2 rounded overflow-auto">
              {JSON.stringify(testResults.datadogServices, null, 2)}
            </pre>
          </div>
        )}

        {testResults.datadogError && (
          <div className="mt-2">
            <h4 className="font-semibold text-xs text-red-600">
              ❌ GET /datadog/services Error:
            </h4>
            <pre className="text-xs bg-red-50 dark:bg-red-900 p-2 rounded overflow-auto">
              {testResults.datadogError}
            </pre>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Presiona F12 para abrir DevTools y ver más información en la pestaña Network
      </div>
    </div>
  );
};
