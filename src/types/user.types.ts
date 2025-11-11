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

/**
 * Información básica de un equipo
 * Para uso en listados
 * Basado en TeamResponse del OpenAPI (components.schemas.TeamResponse)
 */
export interface TeamDto {
  /** ID único del equipo */
  id: number;

  /** Nombre del equipo */
  name: string;

  /** Cantidad de miembros en el equipo */
  memberCount: number;

  /** Cantidad de tech leads en el equipo */
  techLeadCount: number;

  /** IDs de los tech leads del equipo */
  techLeadIds: number[];

  /** Cantidad de repositorios asignados */
  repositoryCount: number;
}

/**
 * Información detallada de un miembro del equipo
 * Basado en TeamMemberResponse del OpenAPI (components.schemas.TeamMemberResponse)
 */
export interface TeamMemberDto {
  /** ID del usuario */
  userId: number;

  /** Nombre de usuario de GitHub */
  githubUsername: string;

  /** Email del usuario */
  email: string;

  /** Nombre completo del usuario */
  name: string;

  /** Roles asignados al usuario en el sistema */
  roles: string[];

  /** Indica si el usuario es tech lead del equipo */
  techLead: boolean;
}

/**
 * Información detallada de un equipo
 * Incluye miembros y repositorios
 */
export interface TeamDetailDto {
  /** ID único del equipo */
  id: number;

  /** Nombre del equipo */
  name: string;

  /** Lista de miembros del equipo */
  members: TeamMemberDto[];

  /** Lista de repositorios asignados al equipo */
  repositories: RepositoryDto[];
}

/**
 * Datos para crear un nuevo equipo
 */
export interface CreateTeamRequest {
  /** Nombre del equipo (requerido) */
  name: string;

  /** IDs de usuarios para asignar como tech leads iniciales (opcional) */
  techLeadIds?: number[];
}

/**
 * Datos para actualizar un equipo
 */
export interface UpdateTeamRequest {
  /** Nuevo nombre del equipo */
  name: string;
}

/**
 * Request para asignar un miembro a un equipo
 * Basado en AssignMemberRequest del OpenAPI (components.schemas.AssignMemberRequest)
 * Nota: El usuario se asigna inicialmente como developer. Para promover a tech lead,
 * usar el endpoint PUT /api/v1/teams/{id}/members/{userId}/tech-lead
 */
export interface AssignMemberRequest {
  /** ID del usuario a asignar */
  userId: number;
}

/**
 * Request para actualizar el estado de tech lead de un miembro
 */
export interface UpdateTechLeadRequest {
  /** Indica si el usuario debe ser tech lead */
  isTechLead: boolean;
}

/**
 * Request para asignar un repositorio a un equipo
 * Basado en AssignRepositoryRequest del OpenAPI (components.schemas.AssignRepositoryRequest)
 */
export interface AssignRepositoryRequest {
  /** ID del repositorio a asignar */
  repositoryConfigId: number;
}

/**
 * Usuario disponible para asignación
 * Basado en UserSummaryDto del OpenAPI (components.schemas.UserSummaryDto)
 */
export interface AvailableUserDto {
  /** ID interno del usuario en el sistema */
  id: number;

  /** ID del usuario en GitHub */
  githubId: number;

  /** Nombre de usuario de GitHub */
  githubUsername: string;

  /** Nombre completo */
  name: string;

  /** URL del avatar */
  avatarUrl: string;

  /** Roles del usuario */
  roles: string[];
}
