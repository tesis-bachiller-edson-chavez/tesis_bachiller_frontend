/**
 * Roles del sistema
 * Basado en el enum RoleName del backend (module_domain)
 * Usando const object en lugar de enum para compatibilidad con erasableSyntaxOnly
 */
export const RoleName = {
  ADMIN: 'ADMIN',
  ENGINEERING_MANAGER: 'ENGINEERING_MANAGER',
  TECH_LEAD: 'TECH_LEAD',
  DEVELOPER: 'DEVELOPER',
} as const;

/**
 * Tipo derivado de RoleName para type safety
 */
export type RoleName = typeof RoleName[keyof typeof RoleName];

/**
 * Información resumida de un usuario activo de la organización
 * Basado en UserSummaryDto del OpenAPI (components.schemas.UserSummaryDto)
 */
export interface UserSummaryDto {
  /** Nombre de usuario de GitHub */
  githubUsername: string;

  /** Nombre completo del usuario */
  name: string;

  /** URL del avatar del usuario en GitHub */
  avatarUrl: string;

  /**
   * Roles asignados al usuario en el sistema
   * Según reglas de negocio: Todos los usuarios tienen al menos DEVELOPER
   * Si este array está vacío, es un error del backend
   */
  roles: string[];
}

/**
 * Información de un repositorio configurado
 * Basado en RepositoryDto del OpenAPI (components.schemas.RepositoryDto)
 */
export interface RepositoryDto {
  /** ID único del repositorio en la base de datos */
  id: number;

  /** URL del repositorio en GitHub */
  repositoryUrl: string;

  /** Nombre del servicio en Datadog asociado al repositorio (puede ser null) */
  datadogServiceName: string | null;

  /** Nombre del archivo de workflow de deployment de GitHub Actions (puede ser null) */
  deploymentWorkflowFileName: string | null;

  /** Propietario del repositorio extraído de la URL */
  owner: string;

  /** Nombre del repositorio extraído de la URL */
  repoName: string;
}

/**
 * Resultado de la sincronización de repositorios desde GitHub
 * Basado en RepositorySyncResultDto del OpenAPI (components.schemas.RepositorySyncResultDto)
 */
export interface RepositorySyncResultDto {
  /** Cantidad de repositorios nuevos creados */
  newRepositories: number;

  /** Total de repositorios en la base de datos después de la sincronización */
  totalRepositories: number;

  /** Cantidad de repositorios que ya existían y no fueron modificados */
  unchanged: number;
}

/**
 * Datos para actualizar un repositorio
 * Basado en UpdateRepositoryRequest del OpenAPI (components.schemas.UpdateRepositoryRequest)
 */
export interface UpdateRepositoryRequest {
  /** Nombre del servicio en Datadog (puede ser null para eliminar la asociación) */
  datadogServiceName: string | null;

  /** Nombre del archivo de workflow de deployment de GitHub Actions (puede ser null) */
  deploymentWorkflowFileName: string | null;
}

/**
 * Servicio de Datadog disponible en APM
 * Basado en DatadogServiceDto del OpenAPI (components.schemas.DatadogServiceDto)
 */
export interface DatadogServiceDto {
  /** Nombre del servicio en Datadog */
  name: string;
}
